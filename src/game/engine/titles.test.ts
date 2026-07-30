import { describe, expect, it } from "vitest";

import type { PerformanceMetrics } from "./titles";
import { selectPlayerTitle } from "./titles";

const baseMetrics: PerformanceMetrics = {
  completionRatio: 0.85,
  score: 1_000,
  activeSeconds: 200,
  linesCleared: 10,
  fourLineClears: 0,
  routedAttempts: 10,
  successfulStencilLocks: 5,
  distinctStencilPieceTypes: 4,
};

function titleFor(overrides: Partial<PerformanceMetrics>) {
  return selectPlayerTitle({ ...baseMetrics, ...overrides });
}

describe("regular success titles", () => {
  it("selects Stencil Sorcerer first at 95% completion", () => {
    expect(
      titleFor({
        completionRatio: 0.95,
        activeSeconds: 10,
        successfulStencilLocks: 10,
      }),
    ).toBe("Stencil Sorcerer");
  });

  it("selects Turbo Typesetter at exactly 15 seconds per piece", () => {
    expect(
      titleFor({
        activeSeconds: 90,
        successfulStencilLocks: 6,
      }),
    ).toBe("Turbo Typesetter");
  });

  it("selects Line-Dance Legend for a four-line clear", () => {
    expect(titleFor({ fourLineClears: 1 })).toBe("Line-Dance Legend");
  });

  it("selects Line-Dance Legend at exactly 450 score per line", () => {
    expect(titleFor({ score: 4_500, linesCleared: 10 })).toBe("Line-Dance Legend");
  });

  it("selects Shape Whisperer at both efficiency boundaries", () => {
    expect(
      titleFor({
        routedAttempts: 10,
        successfulStencilLocks: 8,
        distinctStencilPieceTypes: 6,
      }),
    ).toBe("Shape Whisperer");
  });

  it("uses Block-Poet as the regular fallback", () => {
    expect(titleFor({})).toBe("Block-Poet");
  });
});

describe("exclusive perfect titles", () => {
  it("selects The One-Hundred Wonder first at 13 seconds per piece", () => {
    expect(
      titleFor({
        completionRatio: 1,
        activeSeconds: 65,
        successfulStencilLocks: 5,
        score: 10_000,
      }),
    ).toBe("The One-Hundred Wonder");
  });

  it("selects Pixel-Perfect Name Alchemist at 550 score per line", () => {
    expect(
      titleFor({
        completionRatio: 1,
        activeSeconds: 100,
        successfulStencilLocks: 5,
        score: 5_500,
        linesCleared: 10,
      }),
    ).toBe("Pixel-Perfect Name Alchemist");
  });

  it("uses Crowned Blocksmith as the perfect fallback", () => {
    expect(
      titleFor({
        completionRatio: 1,
        activeSeconds: 100,
        successfulStencilLocks: 5,
      }),
    ).toBe("Crowned Blocksmith");
  });

  it("never selects a regular title for a perfect result", () => {
    expect(
      titleFor({
        completionRatio: 1,
        activeSeconds: 100,
        successfulStencilLocks: 5,
        distinctStencilPieceTypes: 7,
      }),
    ).not.toBe("Shape Whisperer");
  });
});
