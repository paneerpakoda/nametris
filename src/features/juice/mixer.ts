export const maxVoices = 8;
export const moveGapMs = 50;
export const repeatPitch = 0.03;
export const rewardSlotsMs = [0, 120, 300] as const;

export type SoundName =
  | "rotate"
  | "soft-lock"
  | "hard-drop"
  | "clear-1"
  | "clear-2"
  | "clear-3"
  | "clear-4"
  | "name-piece"
  | "send"
  | "stamp"
  | "letter"
  | "nope"
  | "level-up"
  | "eighty"
  | "win"
  | "game-over"
  | "ui"
  | "move";

export const soundDurationMs: Record<SoundName, number> = {
  rotate: 40,
  "soft-lock": 70,
  "hard-drop": 90,
  "clear-1": 80,
  "clear-2": 140,
  "clear-3": 200,
  "clear-4": 420,
  "name-piece": 180,
  send: 150,
  stamp: 100,
  letter: 300,
  nope: 80,
  "level-up": 270,
  eighty: 420,
  win: 700,
  "game-over": 500,
  ui: 30,
  move: 25,
};

export const soundPriority: Record<SoundName, number> = {
  "game-over": 70,
  win: 60,
  eighty: 60,
  "clear-1": 50,
  "clear-2": 50,
  "clear-3": 50,
  "clear-4": 50,
  "level-up": 50,
  "name-piece": 40,
  letter: 40,
  stamp: 30,
  "soft-lock": 20,
  "hard-drop": 20,
  send: 20,
  nope: 15,
  rotate: 10,
  ui: 5,
  move: 0,
};

const rewardNames = new Set<SoundName>([
  "clear-1",
  "clear-2",
  "clear-3",
  "clear-4",
  "name-piece",
  "level-up",
  "letter",
  "eighty",
  "win",
  "stamp",
]);

export function isRewardSound(name: SoundName): boolean {
  return rewardNames.has(name);
}

export interface ScheduledSound {
  readonly id: number;
  readonly name: SoundName;
  readonly at: number;
  readonly pitch: number;
  readonly priority: number;
  readonly reward: boolean;
  readonly duration: number;
}

export interface MixerDecision {
  readonly started: readonly ScheduledSound[];
  readonly stopped: readonly number[];
}

const emptyDecision: MixerDecision = { started: [], stopped: [] };

export interface Mixer {
  queue(name: SoundName): void;
  drop(): void;
  start(name: SoundName, at?: number, now?: number): MixerDecision;
  flush(now?: number): MixerDecision;
  release(id: number): void;
  activeCount(now?: number): number;
}

export function createMixer(options?: {
  readonly now?: () => number;
  readonly random?: () => number;
}): Mixer {
  const now = options?.now ?? (() => performance.now());
  const random = options?.random ?? Math.random;
  let active: ScheduledSound[] = [];
  let pending: SoundName[] = [];
  let nextId = 1;
  let lastMoveAt = Number.NEGATIVE_INFINITY;
  const repeats = new Map<SoundName, number>();

  function prune(time: number) {
    active = active.filter((voice) => voice.at + voice.duration > time);
  }

  function rewardOverlap(at: number, duration: number): number {
    const end = at + duration;
    let count = 0;
    for (const voice of active) {
      if (voice.reward && voice.at < end && voice.at + voice.duration > at) {
        count += 1;
      }
    }
    return count;
  }

  function victim(priority: number): ScheduledSound | null {
    let chosen: ScheduledSound | null = null;
    for (const voice of active) {
      if (voice.priority > priority) {
        continue;
      }
      if (
        chosen === null ||
        voice.priority < chosen.priority ||
        (voice.priority === chosen.priority &&
          (voice.at < chosen.at || (voice.at === chosen.at && voice.id < chosen.id)))
      ) {
        chosen = voice;
      }
    }
    return chosen;
  }

  function start(name: SoundName, at = now(), time = now()): MixerDecision {
    prune(time);
    if (name === "move" && time - lastMoveAt < moveGapMs) {
      return emptyDecision;
    }

    const reward = rewardNames.has(name);
    const duration = soundDurationMs[name];
    if (reward && rewardOverlap(at, duration) >= 2) {
      return emptyDecision;
    }

    const stopped: number[] = [];
    if (active.length >= maxVoices) {
      const stolen = victim(soundPriority[name]);
      if (stolen === null) {
        return emptyDecision;
      }
      active = active.filter((voice) => voice.id !== stolen.id);
      stopped.push(stolen.id);
    }

    const heard = repeats.get(name) ?? 0;
    repeats.set(name, heard + 1);
    const sound: ScheduledSound = {
      id: nextId,
      name,
      at,
      pitch: heard === 0 ? 1 : 1 + (random() * 2 - 1) * repeatPitch,
      priority: soundPriority[name],
      reward,
      duration,
    };
    nextId += 1;
    active.push(sound);
    if (name === "move") {
      lastMoveAt = time;
    }
    return { started: [sound], stopped };
  }

  return {
    queue(name) {
      pending.push(name);
    },
    drop() {
      pending = [];
    },
    start,
    flush(time = now()) {
      const queued = pending.splice(0, Math.min(pending.length, rewardSlotsMs.length));
      pending = [];
      const started: ScheduledSound[] = [];
      const stopped: number[] = [];
      queued.forEach((name, index) => {
        const slot = rewardSlotsMs[index] ?? 0;
        const decision = start(name, time + slot, time);
        started.push(...decision.started);
        stopped.push(...decision.stopped);
      });
      return { started, stopped };
    },
    release(id) {
      active = active.filter((voice) => voice.id !== id);
    },
    activeCount(time = now()) {
      prune(time);
      return active.length;
    },
  };
}
