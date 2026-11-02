import { describe, expect, it } from "vitest";

import { createMixer, maxVoices, repeatPitch, type SoundName } from "./mixer";

function fill(mixer: ReturnType<typeof createMixer>, name: SoundName, count: number) {
  const started = [];
  for (let index = 0; index < count; index += 1) {
    started.push(...mixer.start(name, 0, 0).started);
  }
  return started;
}

describe("voice mixer", () => {
  it("steals the oldest low-priority voice and keeps the cap at 8", () => {
    const mixer = createMixer({ now: () => 0, random: () => 1 });
    const first = fill(mixer, "rotate", maxVoices);
    const ninth = mixer.start("rotate", 0, 0);

    expect(first).toHaveLength(maxVoices);
    expect(ninth.stopped).toEqual([first[0]?.id]);
    expect(mixer.activeCount(0)).toBe(maxVoices);
  });

  it("lets game over replace a rotate and refuses the other way around", () => {
    const crowded = createMixer({ now: () => 0, random: () => 1 });
    fill(crowded, "game-over", maxVoices);

    expect(crowded.start("rotate", 0, 0).started).toEqual([]);
    expect(crowded.activeCount(0)).toBe(maxVoices);

    const open = createMixer({ now: () => 0, random: () => 1 });
    const rotates = fill(open, "rotate", maxVoices);
    const taken = open.start("game-over", 0, 0);

    expect(taken.stopped).toEqual([rotates[0]?.id]);
    expect(taken.started[0]?.name).toBe("game-over");
  });

  it("plays at most one move tick every 50ms", () => {
    let time = 0;
    const mixer = createMixer({ now: () => time, random: () => 1 });

    expect(mixer.start("move", time, time).started).toHaveLength(1);
    time = 49;
    expect(mixer.start("move", time, time).started).toEqual([]);
    time = 50;
    expect(mixer.start("move", time, time).started).toHaveLength(1);
  });

  it("queues same-moment rewards at 0, 120 and 300ms with two at once", () => {
    const mixer = createMixer({ now: () => 0, random: () => 1 });
    mixer.queue("clear-1");
    mixer.queue("name-piece");
    mixer.queue("level-up");

    const decision = mixer.flush(0);

    expect(decision.started.map((sound) => [sound.name, sound.at])).toEqual([
      ["clear-1", 0],
      ["name-piece", 120],
      ["level-up", 300],
    ]);

    const wins = createMixer({ now: () => 0, random: () => 1 });
    wins.queue("win");
    wins.queue("win");
    wins.queue("win");

    expect(wins.flush(0).started.map((sound) => sound.at)).toEqual([0, 120]);
  });

  it("shifts repeated sounds by 3 percent", () => {
    const up = createMixer({ now: () => 0, random: () => 1 });
    expect(up.start("rotate", 0, 0).started[0]?.pitch).toBe(1);
    expect(up.start("rotate", 100, 100).started[0]?.pitch).toBeCloseTo(1 + repeatPitch);

    const down = createMixer({ now: () => 0, random: () => 0 });
    down.start("ui", 0, 0);
    expect(down.start("ui", 100, 100).started[0]?.pitch).toBeCloseTo(1 - repeatPitch);
  });
});
