import { describe, expect, it } from "vitest";

import type { ActivePiece, Board } from "../model/types";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  HIDDEN_BOARD_ROWS,
  createEmptyBoard,
  getBoardStackHeight,
  lockAndClearPiece,
} from "./board";
import {
  getHardDropScore,
  getLevel,
  getLineClearScore,
  getSoftDropScore,
} from "./scoring";

function boardReadyForVerticalClear(lineCount: number): Board {
  const firstClearRow = BOARD_HEIGHT - lineCount;

  return createEmptyBoard().map((row, rowIndex) =>
    row.map((cell, columnIndex) =>
      rowIndex >= firstClearRow && columnIndex !== 5 ? "J" : cell,
    ),
  );
}

function bottomVerticalI(): ActivePiece {
  return {
    type: "I",
    rotation: 1,
    row: BOARD_HEIGHT - 4,
    column: 3,
  };
}

describe("board locking and clearing", () => {
  it("measures stack height from the highest occupied row", () => {
    const empty = createEmptyBoard();
    const board = empty.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex === BOARD_HEIGHT - 3 && columnIndex === 4 ? "T" : cell,
      ),
    );

    expect(getBoardStackHeight(empty)).toBe(0);
    expect(getBoardStackHeight(board)).toBe(3);
  });

  it.each([
    [1, 100],
    [2, 300],
    [3, 700],
    [4, 1500],
  ])(
    "a %i-row clear awards matching lines, transfers, and level-one score",
    (lineCount, expectedScore) => {
      const result = lockAndClearPiece(
        boardReadyForVerticalClear(lineCount),
        bottomVerticalI(),
        1,
      );

      expect(result.linesCleared).toBe(lineCount);
      expect(result.transfersEarned).toBe(lineCount);
      expect(result.scoreEarned).toBe(expectedScore);
      expect(result.board).toHaveLength(BOARD_HEIGHT);
      expect(result.board.every((row) => row.length === BOARD_WIDTH)).toBe(true);
    },
  );

  it("reports top-out when a lock occupies a hidden row", () => {
    const result = lockAndClearPiece(
      createEmptyBoard(),
      { type: "O", rotation: 0, row: 0, column: 3 },
      1,
    );

    expect(result.toppedOut).toBe(true);
    expect(
      result.board
        .slice(0, HIDDEN_BOARD_ROWS)
        .some((row) => row.some((cell) => cell !== null)),
    ).toBe(true);
  });
});

describe("score and level rules", () => {
  it("multiplies line-clear score by level", () => {
    expect(getLineClearScore(4, 3)).toBe(4500);
    expect(getLineClearScore(0, 9)).toBe(0);
  });

  it("increases level every ten total lines", () => {
    expect(getLevel(0)).toBe(1);
    expect(getLevel(9)).toBe(1);
    expect(getLevel(10)).toBe(2);
    expect(getLevel(20)).toBe(3);
  });

  it("awards manual drop distance", () => {
    expect(getSoftDropScore(7)).toBe(7);
    expect(getHardDropScore(7)).toBe(14);
  });
});
