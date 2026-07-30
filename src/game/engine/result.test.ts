import { describe, expect, it } from "vitest";

import { playerTitles } from "../config/titles";
import { createLossResult, createRunResult } from "./result";
import { createBoardSession } from "./session";
import { createStencilState } from "./stencil";

function completedSession(completionCells = 16) {
  const mask = new Set(Array.from({ length: 20 }, (_, index) => `0:${index}`));
  const filledCells = new Map(
    Array.from({ length: completionCells }, (_, index) => [`0:${index}`, "I" as const]),
  );

  return {
    ...createBoardSession(["I", "O", "T"]),
    phase: "won" as const,
    name: "HARSH",
    score: 12_345,
    linesCleared: 10,
    level: 2,
    fourLineClears: 1,
    routedAttempts: 6,
    successfulStencilLocks: 5,
    canceledRoutes: 1,
    distinctStencilPieceTypes: new Set(["I", "O"] as const),
    maximumBoardStackHeight: 8,
    activeMilliseconds: 100_000,
    stencil: {
      ...createStencilState(mask, 1, 20),
      filledCells,
    },
  };
}

describe("final results", () => {
  it("freezes a detached success snapshot and selects one title", () => {
    const state = completedSession();
    const result = createRunResult(state);

    expect(result).toMatchObject({
      name: "HARSH",
      completionRatio: 0.8,
      displayPercent: 80,
      score: 12_345,
      activeMilliseconds: 100_000,
      title: playerTitles.lineDanceLegend,
      linesCleared: 10,
      level: 2,
      fourLineClears: 1,
      routedAttempts: 6,
      successfulStencilLocks: 5,
      canceledRoutes: 1,
      distinctStencilPieceTypes: 2,
      maximumBoardStackHeight: 8,
      stencilCellsFilled: 16,
    });
    expect(result.stencil.mask).not.toBe(state.stencil.mask);
    expect(result.stencil.filledCells).not.toBe(state.stencil.filledCells);
  });

  it("uses only an exclusive perfect title at 100%", () => {
    const result = createRunResult(completedSession(20));

    expect(result.displayPercent).toBe(100);
    expect([
      playerTitles.oneHundredWonder,
      playerTitles.pixelPerfectAlchemist,
      playerTitles.crownedBlocksmith,
    ]).toContain(result.title);
  });

  it("creates a loss snapshot without any success title", () => {
    const state = { ...completedSession(), phase: "lost" as const };
    const result = createLossResult(state);

    expect(result).not.toHaveProperty("title");
    expect(result).toMatchObject({
      name: "HARSH",
      displayPercent: 80,
      score: 12_345,
      activeMilliseconds: 100_000,
    });
  });
});
