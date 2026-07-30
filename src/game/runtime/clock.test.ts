import { describe, expect, it } from "vitest";

import { addActiveMilliseconds } from "./clock";

describe("active game clock", () => {
  it("adds safe elapsed time during active play", () => {
    expect(addActiveMilliseconds(1_000, 250.5, true)).toBe(1_250.5);
  });

  it("excludes paused, help, and hidden-tab time", () => {
    expect(addActiveMilliseconds(1_000, 250, false)).toBe(1_000);
  });

  it("ignores negative elapsed values", () => {
    expect(addActiveMilliseconds(1_000, -50, true)).toBe(1_000);
  });
});
