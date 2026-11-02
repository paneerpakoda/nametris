import { describe, expect, it } from "vitest";

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
import { renderSound } from "./recipes";

class Param implements AudioParamLike {
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

class Node implements AudioNodeLike {
  readonly connections: AudioNodeLike[] = [];
  disconnect() {
    this.connections.splice(0, this.connections.length);
  }
  connect(destination: AudioNodeLike) {
    this.connections.push(destination);
  }
}

class Osc extends Node implements OscillatorLike {
  type: OscillatorType = "sine";
  frequency = new Param();
  onended: (() => void) | null = null;
  stopped: number | null = null;
  start() {
    return undefined;
  }
  stop(when = 0) {
    this.stopped = when;
  }
}

class FilterNode extends Node implements FilterLike {
  type: BiquadFilterType = "lowpass";
  frequency = new Param();
  Q = new Param();
}

class Context implements SoundContext {
  currentTime = 0;
  sampleRate = 1000;
  state: AudioContextState = "running";
  destination = new Node();
  readonly oscillators: Osc[] = [];
  readonly gains: (Node & { gain: Param })[] = [];
  readonly filters: FilterNode[] = [];

  resume() {
    return Promise.resolve();
  }
  suspend() {
    return Promise.resolve();
  }
  createGain(): GainLike {
    const node = Object.assign(new Node(), { gain: new Param() });
    this.gains.push(node);
    return node;
  }
  createOscillator(): OscillatorLike {
    const oscillator = new Osc();
    this.oscillators.push(oscillator);
    return oscillator;
  }
  createDynamicsCompressor() {
    return Object.assign(new Node(), {
      threshold: new Param(),
      knee: new Param(),
      ratio: new Param(),
      attack: new Param(),
      release: new Param(),
    });
  }
  createBuffer(): AudioBufferLike {
    const data = new Float32Array(8);
    return {
      length: data.length,
      sampleRate: this.sampleRate,
      getChannelData: () => data,
    };
  }
  createBufferSource(): BufferSourceLike {
    const node = new Node();
    return Object.assign(node, {
      buffer: null,
      onended: null as (() => void) | null,
      start() {
        return undefined;
      },
      stop() {
        return undefined;
      },
    });
  }
  createBiquadFilter(): FilterLike {
    const filter = new FilterNode();
    this.filters.push(filter);
    return filter;
  }
}

const noise = {
  length: 8,
  sampleRate: 1000,
  getChannelData: () => new Float32Array(8),
};

function play(name: SoundName, pitch = 1) {
  const context = new Context();
  let ended = 0;
  const handle = renderSound(
    context,
    context.destination,
    { name, when: 1, pitch, duration: 1 },
    noise,
    () => {
      ended += 1;
    },
  );
  const bus = context.gains.find((gain) =>
    gain.connections.includes(context.destination),
  );
  return { context, handle, ended: () => ended, bus };
}

describe("sound recipes", () => {
  it("matches the rotate, lock, drop, and move recipes", () => {
    const rotate = play("rotate");
    expect(rotate.bus?.gain.value).toBeCloseTo(0.06);
    expect(rotate.context.oscillators[0]?.type).toBe("triangle");
    expect(
      rotate.context.oscillators[0]?.frequency.events.map((event) => event.value),
    ).toEqual([440, 620]);
    expect(rotate.context.oscillators[0]?.stopped).toBeCloseTo(1.04);

    const shifted = play("rotate", 1.03);
    expect(shifted.context.oscillators[0]?.frequency.events[0]?.value).toBeCloseTo(
      440 * 1.03,
    );

    const lock = play("soft-lock");
    expect(lock.bus?.gain.value).toBeCloseTo(0.12);
    expect(
      lock.context.oscillators[0]?.frequency.events.map((event) => event.value),
    ).toEqual([220, 150]);
    expect(lock.context.oscillators[1]?.frequency.events[0]?.value).toBe(800);

    const drop = play("hard-drop");
    expect(drop.bus?.gain.value).toBeCloseTo(0.18);
    expect(
      drop.context.oscillators[0]?.frequency.events.map((event) => event.value),
    ).toEqual([200, 110]);
    expect(drop.context.filters[0]?.type).toBe("lowpass");
    expect(drop.context.oscillators[0]?.stopped).toBeCloseTo(1.09);

    expect(play("move").context.oscillators[0]?.type).toBe("square");
    expect(play("move").bus?.gain.value).toBeCloseTo(0.03);
    expect(play("nope").context.oscillators[0]?.frequency.value).toBe(160);
    expect(play("ui").context.oscillators[0]?.frequency.value).toBe(600);
  });

  it("keeps clears, the win, and game over inside their caps", () => {
    for (const name of ["clear-1", "clear-2", "clear-3", "clear-4", "win"] as const) {
      const played = play(name);
      const peak = name === "clear-4" || name === "win" ? 0.2 : 0.14;
      expect(played.bus?.gain.value).toBeCloseTo(peak);
      const span = Math.max(
        ...played.context.oscillators.map(
          (oscillator) => (oscillator.stopped ?? 0) - 1,
        ),
      );
      expect(span).toBeLessThanOrEqual(0.7);
    }

    const quad = play("clear-4");
    expect(
      quad.context.oscillators.map(
        (oscillator) => oscillator.frequency.events[0]?.value,
      ),
    ).toEqual(expect.arrayContaining([523.25, 659.25, 783.99, 1046.5]));

    const over = play("game-over");
    expect(over.bus?.gain.value).toBeCloseTo(0.18);
    expect(over.context.oscillators[0]?.type).toBe("sawtooth");
    expect(
      over.context.oscillators[0]?.frequency.events.map((event) => event.value),
    ).toEqual([400, 100]);
    expect(
      over.context.filters[0]?.frequency.events.map((event) => event.value),
    ).toEqual([1800, 180]);
    expect(
      over.context.oscillators[1]?.frequency.events.map((event) => event.value),
    ).toEqual([800, 200]);
  });

  it("plays the name, send, level, and eighty cues", () => {
    const earned = play("name-piece");
    expect(
      earned.context.oscillators.map((oscillator) => oscillator.frequency.value),
    ).toEqual([880, 1320]);
    expect(earned.bus?.gain.value).toBeCloseTo(0.12);

    const send = play("send");
    expect(send.context.filters[0]?.type).toBe("bandpass");
    expect(
      send.context.filters[0]?.frequency.events.map((event) => event.value),
    ).toEqual([400, 2000]);
    expect(send.bus?.gain.value).toBeCloseTo(0.1);

    expect(play("level-up").context.oscillators).toHaveLength(3);
    expect(play("eighty").bus?.gain.value).toBeCloseTo(0.2);
    expect(
      play("letter").context.oscillators.map(
        (oscillator) => oscillator.frequency.value,
      ),
    ).toEqual([988, 1976]);
    expect(play("stamp").bus?.gain.value).toBeCloseTo(0.14);

    const played = play("ui");
    played.handle.stop();
    played.handle.stop();
    expect(played.ended()).toBe(1);
  });
});
