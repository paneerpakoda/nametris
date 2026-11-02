import { describe, expect, it } from "vitest";

import { createJuiceEngine } from "./audio";
import type {
  AudioBufferLike,
  AudioNodeLike,
  AudioParamLike,
  BufferSourceLike,
  DynamicsCompressorLike,
  FilterLike,
  GainLike,
  OscillatorLike,
  SoundContext,
} from "./graph";
import { defaultJuicePreferences, type JuicePreferences } from "./preferences";

class FakeParam implements AudioParamLike {
  value = 0;
  readonly events: { method: string; value: number; time: number }[] = [];

  setValueAtTime(value: number, time: number) {
    this.value = value;
    this.events.push({ method: "set", value, time });
  }

  linearRampToValueAtTime(value: number, time: number) {
    this.events.push({ method: "linear", value, time });
  }

  exponentialRampToValueAtTime(value: number, time: number) {
    this.events.push({ method: "expo", value, time });
  }

  cancelScheduledValues() {
    return undefined;
  }
}

class FakeNode implements AudioNodeLike {
  readonly connections: AudioNodeLike[] = [];

  connect(destination: AudioNodeLike) {
    this.connections.push(destination);
  }

  disconnect() {
    this.connections.splice(0, this.connections.length);
  }
}

class FakeOscillator extends FakeNode implements OscillatorLike {
  type: OscillatorType = "sine";
  frequency = new FakeParam();
  onended: (() => void) | null = null;
  started: number | null = null;
  stopped: number | null = null;

  start(when = 0) {
    this.started = when;
  }

  stop(when = 0) {
    this.stopped = when;
  }
}

class FakeContext implements SoundContext {
  currentTime = 0;
  sampleRate = 1000;
  state: AudioContextState = "suspended";
  destination = new FakeNode();
  readonly oscillators: FakeOscillator[] = [];
  readonly gains: FakeNode[] = [];
  readonly compressors: FakeNode[] = [];
  resumeCalls = 0;
  suspendCalls = 0;
  buffers = 0;

  resume() {
    this.resumeCalls += 1;
    this.state = "running";
    return Promise.resolve();
  }

  suspend() {
    this.suspendCalls += 1;
    this.state = "suspended";
    return Promise.resolve();
  }

  createGain(): GainLike {
    const gain = new FakeParam();
    const node = new FakeNode();
    this.gains.push(node);
    return Object.assign(node, { gain });
  }

  createOscillator(): OscillatorLike {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createDynamicsCompressor(): DynamicsCompressorLike {
    const node = new FakeNode();
    this.compressors.push(node);
    return Object.assign(node, {
      threshold: new FakeParam(),
      knee: new FakeParam(),
      ratio: new FakeParam(),
      attack: new FakeParam(),
      release: new FakeParam(),
    });
  }

  createBuffer(channels: number, length: number, sampleRate: number): AudioBufferLike {
    void channels;
    this.buffers += 1;
    const data = new Float32Array(length);
    return {
      length,
      sampleRate,
      getChannelData() {
        return data;
      },
    };
  }

  createBufferSource(): BufferSourceLike {
    return Object.assign(new FakeNode(), {
      buffer: null,
      onended: null,
      start() {
        return undefined;
      },
      stop() {
        return undefined;
      },
    });
  }

  createBiquadFilter(): FilterLike {
    return Object.assign(new FakeNode(), {
      type: "lowpass" as BiquadFilterType,
      frequency: new FakeParam(),
      Q: new FakeParam(),
    });
  }
}

function harness(preferences: JuicePreferences = { ...defaultJuicePreferences }) {
  const context = new FakeContext();
  let clock = 0;
  const engine = createJuiceEngine({
    contextFactory: () => context,
    listen: false,
    now: () => clock,
    random: () => 1,
    readPreferences: () => preferences,
  });
  return {
    context,
    engine,
    preferences,
    setTime(value: number) {
      clock = value;
    },
  };
}

describe("sound engine", () => {
  it("stays silent until the first gesture primes the context", () => {
    const { context, engine } = harness();

    engine.play("rotate");
    expect(context.oscillators).toHaveLength(0);

    engine.prime();
    expect(context.resumeCalls).toBe(1);
    expect(context.gains[0]).toBeDefined();
    const master = context.gains[0] as FakeNode & { gain: FakeParam };
    expect(master.gain.value).toBe(0.5);
    expect(master.connections[0]).toBe(context.compressors[0]);
    const limiter = context.compressors[0] as FakeNode & {
      ratio: FakeParam;
      threshold: FakeParam;
    };
    expect(limiter.threshold.value).toBe(-12);
    expect(limiter.ratio.value).toBe(20);
    expect(limiter.connections[0]).toBe(context.destination);

    engine.play("rotate");
    expect(context.oscillators).toHaveLength(1);
    expect(context.buffers).toBe(1);
    engine.play("ui");
    expect(context.buffers).toBe(1);
  });

  it("mutes, suspends while paused or hidden, and skips move ticks unless asked", () => {
    const preferences = { ...defaultJuicePreferences };
    const { context, engine, setTime } = harness(preferences);
    engine.prime();

    preferences.muted = true;
    engine.play("rotate");
    expect(context.oscillators).toHaveLength(0);

    preferences.muted = false;
    engine.play("move");
    expect(context.oscillators).toHaveLength(0);
    preferences.moveSounds = true;
    engine.play("move");
    setTime(10);
    engine.play("move");
    setTime(50);
    engine.play("move");
    expect(context.oscillators).toHaveLength(2);

    engine.hold("pause", true);
    expect(context.suspendCalls).toBe(1);
    engine.hold("pause", false);
    expect(context.resumeCalls).toBe(2);
    engine.hold("hidden", true);
    expect(context.suspendCalls).toBe(2);
  });

  it("keeps at most eight voices and staggers rewards", async () => {
    const { context, engine } = harness();
    engine.prime();

    for (let index = 0; index < 8; index += 1) {
      engine.play("rotate");
    }
    engine.play("rotate");
    expect(context.oscillators).toHaveLength(9);
    expect(engine.activeVoices(0)).toBe(8);
    expect(context.oscillators[0]?.connections).toHaveLength(0);

    const rewards = harness();
    rewards.engine.prime();
    rewards.engine.play("clear-1");
    rewards.engine.play("name-piece");
    rewards.engine.play("level-up");
    await Promise.resolve();

    expect(rewards.context.oscillators.map((oscillator) => oscillator.started)).toEqual(
      [0, 0.12, 0.3],
    );
  });
});
