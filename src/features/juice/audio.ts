import { browserSoundContext, type AudioNodeLike, type SoundContext } from "./graph";
import {
  createMixer,
  isRewardSound,
  type Mixer,
  type MixerDecision,
  type ScheduledSound,
  type SoundName,
} from "./mixer";
import {
  getJuicePreferences,
  subscribeJuicePreferences,
  type JuicePreferences,
} from "./preferences";
import { renderSound, type RenderHandle } from "./recipes";

export type AudioHold = "pause" | "hidden";

export interface JuiceEngine {
  prime(): void;
  play(name: SoundName): void;
  hold(reason: AudioHold, on: boolean): void;
  apply(preferences: JuicePreferences): void;
  activeVoices(now?: number): number;
  stats(): { readonly plays: number };
}

interface EngineOptions {
  readonly contextFactory?: () => SoundContext | null;
  readonly listen?: boolean;
  readonly now?: () => number;
  readonly random?: () => number;
  readonly readPreferences?: () => JuicePreferences;
}

function settle(promise: Promise<void>): void {
  void promise.catch(() => undefined);
}

export function createJuiceEngine(options: EngineOptions = {}): JuiceEngine {
  const contextFactory = options.contextFactory ?? browserSoundContext;
  const clock = options.now ?? (() => performance.now());
  const readPreferences = options.readPreferences ?? getJuicePreferences;
  const mixer: Mixer = createMixer({ now: clock, random: options.random });
  const holds = new Set<AudioHold>();
  const live = new Map<number, RenderHandle>();
  let context: SoundContext | null = null;
  let master: AudioNodeLike | null = null;
  let masterGain: { value: number } | null = null;
  let noise: ReturnType<SoundContext["createBuffer"]> | null = null;
  let primed = false;
  let flushQueued = false;
  let plays = 0;

  function apply(preferences: JuicePreferences) {
    if (masterGain === null) {
      return;
    }
    try {
      masterGain.value = preferences.muted ? 0 : preferences.volume;
    } catch {
      // A missing gain node must not stop the player.
    }
  }

  function syncHold() {
    if (context === null) {
      return;
    }
    try {
      if (holds.size > 0) {
        settle(context.suspend());
      } else if (primed) {
        settle(context.resume());
      }
    } catch {
      // Suspending a closed context is safe to ignore.
    }
  }

  function stopLive(id: number) {
    const handle = live.get(id);
    live.delete(id);
    mixer.release(id);
    try {
      handle?.stop();
    } catch {
      // The voice may already have ended.
    }
  }

  function realize(decision: MixerDecision, time: number) {
    if (context === null || master === null) {
      return;
    }
    for (const id of decision.stopped) {
      stopLive(id);
    }
    for (const sound of decision.started) {
      const delay = Math.max(0, sound.at - time) / 1000;
      const when = context.currentTime + delay;
      let ended = false;
      const finish = () => {
        if (ended) {
          return;
        }
        ended = true;
        live.delete(sound.id);
        mixer.release(sound.id);
      };
      try {
        const handle = renderSound(
          context,
          master,
          {
            name: sound.name,
            when,
            pitch: sound.pitch,
            duration: sound.duration,
          },
          noise,
          finish,
        );
        live.set(sound.id, handle);
        plays += 1;
      } catch {
        finish();
      }
    }
  }

  function flush(time: number) {
    try {
      if (readPreferences().muted) {
        mixer.drop();
        return;
      }
      realize(mixer.flush(time), time);
    } catch {
      // A failed reward queue must not affect the next piece.
    }
  }

  function play(name: SoundName) {
    try {
      const preferences = readPreferences();
      apply(preferences);
      if (!primed || preferences.muted) {
        return;
      }
      if (name === "move" && !preferences.moveSounds) {
        return;
      }
      const time = clock();
      if (isRewardSound(name)) {
        mixer.queue(name);
        if (!flushQueued) {
          flushQueued = true;
          const queuedAt = time;
          queueMicrotask(() => {
            flushQueued = false;
            flush(queuedAt);
          });
        }
        return;
      }
      realize(mixer.start(name, time, time), time);
    } catch {
      // Sound is never allowed to break play.
    }
  }

  const engine: JuiceEngine = {
    prime() {
      try {
        if (context === null) {
          const created = contextFactory();
          if (created === null) {
            return;
          }
          context = created;
          const gain = created.createGain();
          const limiter = created.createDynamicsCompressor();
          limiter.threshold.value = -12;
          limiter.knee.value = 0;
          limiter.ratio.value = 20;
          limiter.attack.value = 0.003;
          limiter.release.value = 0.1;
          gain.connect(limiter);
          limiter.connect(created.destination);
          master = gain;
          masterGain = gain.gain;
          const length = Math.max(1, Math.floor(created.sampleRate));
          noise = created.createBuffer(1, length, created.sampleRate);
          const data = noise.getChannelData(0);
          for (let index = 0; index < data.length; index += 1) {
            data[index] = Math.random() * 2 - 1;
          }
          primed = true;
          apply(readPreferences());
          syncHold();
          return;
        }
        primed = true;
        apply(readPreferences());
      } catch {
        // The game keeps running if the browser blocks audio.
      }
    },
    play,
    hold(reason, on) {
      try {
        if (on) {
          holds.add(reason);
        } else {
          holds.delete(reason);
        }
        syncHold();
      } catch {
        // Pause must still pause the game if audio fails.
      }
    },
    apply,
    activeVoices(now) {
      return mixer.activeCount(now ?? clock());
    },
    stats() {
      return { plays };
    },
  };

  if (options.listen === true && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      engine.hold("hidden", document.hidden);
    });
  }

  return engine;
}

let singleton: JuiceEngine | null = null;

function engine(): JuiceEngine {
  if (singleton === null) {
    singleton = createJuiceEngine({ listen: true });
    subscribeJuicePreferences(() => {
      try {
        singleton?.apply(getJuicePreferences());
      } catch {
        // Preference updates still succeed if the context is gone.
      }
    });
  }
  return singleton;
}

export function primeAudio(): void {
  try {
    engine().prime();
  } catch {
    // Starting a run never depends on sound.
  }
}

export function playSound(name: SoundName): void {
  try {
    engine().play(name);
  } catch {
    // A missed click sound is not a failed move.
  }
}

export function holdAudio(reason: AudioHold, on: boolean): void {
  try {
    engine().hold(reason, on);
  } catch {
    // The pause state is owned by the game, not the context.
  }
}

export type { ScheduledSound, SoundName };
