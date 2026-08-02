import { describe, expect, it } from "vitest";

import { playerTitles } from "../../game/config/titles";
import type { RunResult } from "../../game/engine/result";
import { createRewardSvg, formatActiveTime } from "./exportCard";

const result: RunResult = {
  outcome: "won",
  name: "HARSH",
  completionRatio: 0.8,
  displayPercent: 80,
  score: 12_345,
  activeMilliseconds: 125_000,
  title: playerTitles.blockPoet,
  linesCleared: 8,
  level: 1,
  fourLineClears: 0,
  routedAttempts: 5,
  successfulStencilLocks: 4,
  canceledRoutes: 1,
  distinctStencilPieceTypes: 3,
  maximumBoardStackHeight: 10,
  stencilCellsFilled: 4,
  stencil: {
    rows: 1,
    columns: 5,
    mask: ["0:0", "0:1", "0:2", "0:3", "0:4"],
    filledCells: [
      ["0:0", "I"],
      ["0:1", "I"],
      ["0:2", "I"],
      ["0:3", "I"],
    ],
  },
};

describe("local reward export", () => {
  it("formats active time without wall-clock data", () => {
    expect(formatActiveTime(125_000)).toBe("02:05");
  });

  it("creates deterministic standalone SVG from result data", () => {
    const first = createRewardSvg(result);
    const second = createRewardSvg(result);

    expect(first).toBe(second);
    expect(first).toContain("HARSH");
    expect(first).toContain("Block-Poet");
    expect(first).toContain("NAME COMPLETE · 80%");
    expect(first).toContain('id="scanlines"');
    expect(first).toContain("#f1d3a0");
    expect(first).toContain("#f04434");
    expect(first.replace('xmlns="http://www.w3.org/2000/svg"', "")).not.toMatch(
      /https?:|<script|foreignObject|<image/,
    );
  });
});
