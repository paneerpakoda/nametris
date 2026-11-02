import type {
  AudioBufferLike,
  AudioNodeLike,
  AudioParamLike,
  BufferSourceLike,
  FilterLike,
  GainLike,
  OscillatorLike,
  SoundContext,
} from "./graph";
import type { SoundName } from "./mixer";

export interface RenderRequest {
  readonly name: SoundName;
  readonly when: number;
  readonly pitch: number;
  readonly duration: number;
}

export interface RenderHandle {
  stop: () => void;
}

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.51;
const clearNotes = [C5, E5, G5, C6] as const;

interface TrackedNode extends AudioNodeLike {
  onended: (() => void) | null;
}

interface Voice {
  readonly context: SoundContext;
  readonly destination: AudioNodeLike;
  readonly noise: AudioBufferLike | null;
  readonly when: number;
  readonly pitch: number;
  bus: GainLike | null;
  readonly nodes: TrackedNode[];
  remaining: number;
  closed: boolean;
  onEnded: () => void;
}

function hz(frequency: number, pitch: number): number {
  return Math.max(1, frequency * pitch);
}

function envelope(param: AudioParamLike, peak: number, when: number, seconds: number) {
  const attack = Math.min(0.008, seconds / 3);
  param.setValueAtTime(0.0001, when);
  param.exponentialRampToValueAtTime(Math.max(0.0001, peak), when + attack);
  param.exponentialRampToValueAtTime(0.0001, when + seconds);
}

function sweep(
  param: AudioParamLike,
  from: number,
  to: number,
  when: number,
  seconds: number,
) {
  param.setValueAtTime(from, when);
  if (Math.abs(from - to) > 0.5) {
    param.exponentialRampToValueAtTime(Math.max(1, to), when + seconds);
  }
}

function createVoice(
  context: SoundContext,
  destination: AudioNodeLike,
  noise: AudioBufferLike | null,
  request: RenderRequest,
  onEnded: () => void,
): Voice {
  return {
    context,
    destination,
    noise,
    when: request.when,
    pitch: request.pitch,
    bus: null,
    nodes: [],
    remaining: 0,
    closed: false,
    onEnded,
  };
}

function openBus(voice: Voice, peak: number) {
  const bus = voice.context.createGain();
  bus.gain.setValueAtTime(peak, voice.when);
  bus.connect(voice.destination);
  voice.bus = bus;
}

function track(
  voice: Voice,
  node: TrackedNode,
  stopAt: number,
  stop: (when: number) => void,
) {
  voice.nodes.push(node);
  voice.remaining += 1;
  node.onended = () => {
    try {
      node.disconnect();
    } catch {
      // Ending twice is harmless.
    }
    voice.remaining -= 1;
    if (voice.remaining <= 0) {
      finish(voice);
    }
  };
  stop(stopAt);
}

function addTone(
  voice: Voice,
  type: OscillatorType,
  from: number,
  to: number,
  when: number,
  seconds: number,
  level: number,
) {
  if (voice.bus === null) {
    return;
  }
  const oscillator: OscillatorLike = voice.context.createOscillator();
  const gain = voice.context.createGain();
  oscillator.type = type;
  sweep(
    oscillator.frequency,
    hz(from, voice.pitch),
    hz(to, voice.pitch),
    when,
    seconds,
  );
  envelope(gain.gain, level, when, seconds);
  oscillator.connect(gain);
  gain.connect(voice.bus);
  oscillator.start(when);
  track(voice, oscillator, when + seconds, (stopAt) => oscillator.stop(stopAt));
}

function addFilteredTone(
  voice: Voice,
  type: OscillatorType,
  from: number,
  to: number,
  when: number,
  seconds: number,
  level: number,
  filterFrom: number,
  filterTo: number,
) {
  if (voice.bus === null) {
    return;
  }
  const oscillator: OscillatorLike = voice.context.createOscillator();
  const filter: FilterLike = voice.context.createBiquadFilter();
  const gain = voice.context.createGain();
  oscillator.type = type;
  sweep(
    oscillator.frequency,
    hz(from, voice.pitch),
    hz(to, voice.pitch),
    when,
    seconds,
  );
  filter.type = "lowpass";
  filter.Q.setValueAtTime(0.7, when);
  sweep(
    filter.frequency,
    hz(filterFrom, voice.pitch),
    hz(filterTo, voice.pitch),
    when,
    seconds,
  );
  envelope(gain.gain, level, when, seconds);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(voice.bus);
  oscillator.start(when);
  track(voice, oscillator, when + seconds, (stopAt) => oscillator.stop(stopAt));
}

function addNoise(
  voice: Voice,
  type: BiquadFilterType,
  from: number,
  to: number,
  when: number,
  seconds: number,
  level: number,
) {
  if (voice.bus === null || voice.noise === null) {
    return;
  }
  const source: BufferSourceLike = voice.context.createBufferSource();
  const filter: FilterLike = voice.context.createBiquadFilter();
  const gain = voice.context.createGain();
  source.buffer = voice.noise;
  filter.type = type;
  filter.Q.setValueAtTime(0.7, when);
  sweep(filter.frequency, hz(from, voice.pitch), hz(to, voice.pitch), when, seconds);
  envelope(gain.gain, level, when, seconds);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(voice.bus);
  source.start(when);
  track(voice, source, when + seconds, (stopAt) => source.stop(stopAt));
}

function finish(voice: Voice) {
  if (voice.closed) {
    return;
  }
  voice.closed = true;
  try {
    voice.bus?.disconnect();
    for (const node of voice.nodes) {
      node.disconnect();
    }
  } catch {
    // Nodes that already ended can refuse a second disconnect.
  }
  voice.onEnded();
}

function arpeggio(voice: Voice, count: number, level: number) {
  for (let index = 0; index < count; index += 1) {
    const frequency = clearNotes[index] ?? C6;
    addTone(
      voice,
      "triangle",
      frequency,
      frequency,
      voice.when + index * 0.06,
      0.055,
      level,
    );
  }
}

function renderNamed(voice: Voice, name: SoundName) {
  switch (name) {
    case "rotate":
      openBus(voice, 0.06);
      addTone(voice, "triangle", 440, 620, voice.when, 0.04, 1);
      break;
    case "soft-lock":
      openBus(voice, 0.12);
      addTone(voice, "sine", 220, 150, voice.when, 0.07, 0.75);
      addTone(voice, "triangle", 800, 800, voice.when, 0.02, 0.25);
      break;
    case "hard-drop":
      openBus(voice, 0.18);
      addTone(voice, "sine", 200, 110, voice.when, 0.09, 0.6);
      addNoise(voice, "lowpass", 900, 400, voice.when, 0.02, 0.2);
      addTone(voice, "triangle", 1400, 1400, voice.when, 0.015, 0.2);
      break;
    case "clear-1":
    case "clear-2":
    case "clear-3":
      openBus(voice, 0.14);
      arpeggio(voice, Number(name.slice(-1)), 1);
      break;
    case "clear-4":
      openBus(voice, 0.2);
      arpeggio(voice, 4, 0.2);
      for (const frequency of clearNotes) {
        addTone(voice, "triangle", frequency, frequency, voice.when, 0.12, 0.2);
      }
      addTone(voice, "triangle", 1976, 2637, voice.when + 0.18, 0.15, 0.4);
      break;
    case "name-piece":
      openBus(voice, 0.12);
      addTone(voice, "sine", 880, 880, voice.when, 0.09, 1);
      addTone(voice, "sine", 1320, 1320, voice.when + 0.09, 0.09, 1);
      break;
    case "send":
      openBus(voice, 0.1);
      addNoise(voice, "bandpass", 400, 2000, voice.when, 0.15, 1);
      break;
    case "stamp":
      openBus(voice, 0.14);
      addTone(voice, "sine", 200, 150, voice.when, 0.1, 0.75);
      addTone(voice, "triangle", 1760, 1760, voice.when, 0.02, 0.25);
      break;
    case "letter":
      openBus(voice, 0.12);
      addTone(voice, "sine", 988, 988, voice.when, 0.3, 0.5);
      addTone(voice, "sine", 1976, 1976, voice.when, 0.3, 0.5);
      break;
    case "nope":
      openBus(voice, 0.06);
      addTone(voice, "square", 160, 160, voice.when, 0.08, 1);
      break;
    case "level-up":
      openBus(voice, 0.16);
      addTone(voice, "triangle", C5, C5, voice.when, 0.085, 1);
      addTone(voice, "triangle", E5, E5, voice.when + 0.09, 0.085, 1);
      addTone(voice, "triangle", G5, G5, voice.when + 0.18, 0.085, 1);
      break;
    case "eighty":
      openBus(voice, 0.2);
      addTone(voice, "sine", 988, 988, voice.when, 0.2, 0.5);
      addTone(voice, "sine", 1976, 1976, voice.when, 0.2, 0.5);
      addTone(voice, "sine", E6, E6, voice.when + 0.22, 0.16, 0.45);
      break;
    case "win":
      openBus(voice, 0.2);
      [C5, E5, G5, C6, E6].forEach((frequency, index) => {
        addTone(
          voice,
          "triangle",
          frequency,
          frequency,
          voice.when + index * 0.14,
          0.13,
          1,
        );
      });
      break;
    case "game-over":
      openBus(voice, 0.18);
      addFilteredTone(voice, "sawtooth", 400, 100, voice.when, 0.5, 0.85, 1800, 180);
      addTone(voice, "sine", 800, 200, voice.when, 0.5, 0.15);
      break;
    case "ui":
      openBus(voice, 0.05);
      addTone(voice, "triangle", 600, 600, voice.when, 0.03, 1);
      break;
    case "move":
      openBus(voice, 0.03);
      addTone(voice, "square", 200, 200, voice.when, 0.025, 1);
      break;
    default:
      break;
  }
}

export function renderSound(
  context: SoundContext,
  destination: AudioNodeLike,
  request: RenderRequest,
  noise: AudioBufferLike | null,
  onEnded: () => void,
): RenderHandle {
  const voice = createVoice(context, destination, noise, request, onEnded);
  try {
    renderNamed(voice, request.name);
  } catch {
    finish(voice);
  }
  if (voice.remaining === 0) {
    finish(voice);
  }
  return {
    stop() {
      finish(voice);
    },
  };
}
