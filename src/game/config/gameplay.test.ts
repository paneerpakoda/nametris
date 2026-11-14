import { describe, expect, it } from "vitest";

import { getGravityMilliseconds, level1GravityMilliseconds } from "./gameplay";

describe("getGravityMilliseconds", () => {
  it("uses a 1500 ms level-1 base and the 0.85 curve, floored at 80", () => {
    expect(level1GravityMilliseconds).toBe(1500);
    expect(getGravityMilliseconds(1)).toBe(level1GravityMilliseconds);

    const table: Record<number, number> = {
      1: 1500,
      2: 1275,
      3: 1084,
      4: 921,
      5: 783,
      6: 666,
      7: 566,
      8: 481,
      9: 409,
      10: 347,
      15: 154,
      18: 95,
      19: 80,
      20: 80,
    };

    for (const [level, milliseconds] of Object.entries(table)) {
      expect(getGravityMilliseconds(Number(level))).toBe(milliseconds);
    }
  });
});
