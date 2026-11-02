import { describe, expect, it } from "vitest";

import { createRunSeed, readSeedParam } from "./seed";

describe("run seed", () => {
  it("reads a whole-number seed and ignores anything else", () => {
    expect(readSeedParam("?seed=20260730")).toBe(20_260_730);
    expect(readSeedParam("?seed=0")).toBe(0);
    expect(readSeedParam("?seed=01")).toBe(1);
    expect(readSeedParam("")).toBeNull();
    expect(readSeedParam("?seed=")).toBeNull();
    expect(readSeedParam("?seed=-4")).toBeNull();
    expect(readSeedParam("?seed=1.5")).toBeNull();
    expect(readSeedParam("?seed=1e2")).toBeNull();
    expect(readSeedParam("?seed=name")).toBeNull();
  });

  it("repeats the address seed, otherwise draws a new one", () => {
    expect(createRunSeed("?seed=20260730", () => 0.25)).toBe(20_260_730);
    expect(createRunSeed("", () => 0.25)).toBe(250_000_000);
  });
});
