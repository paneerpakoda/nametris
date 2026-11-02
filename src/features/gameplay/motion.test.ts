import { describe, expect, it } from "vitest";

import { createBoardSession, getGhostPiece } from "../../game/engine/session";
import { BOARD_HEIGHT } from "../../game/engine/board";
import {
  addedFilledKeys,
  clearedVisibleRows,
  ghostLocksTooHigh,
  hardDropBumpMilliseconds,
  hardDropTrailKeys,
  hardDropTrailMilliseconds,
  lineClearReducedMilliseconds,
  lineClearVisibleMilliseconds,
  namePopMilliseconds,
  rowClearMilliseconds,
  softLockFlashMilliseconds,
} from "./motion";

describe("gameplay motion cues", () => {
  it("finds the visible rows a lock would clear", () => {
    const session = createBoardSession(["I", "O", "T"]);
    const board = session.board.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex === BOARD_HEIGHT - 1 && columnIndex !== 5 ? "J" : cell,
      ),
    );
    const piece = { type: "I" as const, rotation: 1 as const, row: 0, column: 3 };
    const ghost = getGhostPiece(board, piece);

    expect(clearedVisibleRows(board, ghost)).toEqual([BOARD_HEIGHT - 3]);
    expect(clearedVisibleRows(board, piece)).toEqual([]);
  });

  it("warns from the ghost landing, not the spawn position", () => {
    const session = createBoardSession(["O", "I"]);
    const ghost = getGhostPiece(session.board, session.activePiece);

    expect(ghostLocksTooHigh(session.activePiece)).toBe(true);
    expect(ghostLocksTooHigh(ghost)).toBe(false);
    expect(ghostLocksTooHigh({ type: "T", rotation: 0, row: 2, column: 3 })).toBe(true);
  });

  it("records the cells a hard drop passes through", () => {
    const piece = { type: "O" as const, rotation: 0 as const, row: 0, column: 3 };

    expect(new Set(hardDropTrailKeys(piece, 2))).toEqual(
      new Set(["0:4", "0:5", "1:4", "1:5", "2:4", "2:5"]),
    );
    expect(hardDropTrailKeys(piece, 0)).toEqual([]);
  });

  it("keeps each cue inside its short window", () => {
    expect(rowClearMilliseconds).toBe(180);
    expect(softLockFlashMilliseconds).toBe(80);
    expect(hardDropTrailMilliseconds).toBe(120);
    expect(hardDropBumpMilliseconds).toBe(90);
    expect(namePopMilliseconds).toBe(180);
    expect(lineClearVisibleMilliseconds).toBe(900);
    expect(lineClearReducedMilliseconds).toBe(1_200);
  });

  it("lists only the name cells that just locked", () => {
    expect(
      addedFilledKeys(
        new Set(["0:0"]),
        new Map([
          ["0:0", "I"],
          ["0:1", "I"],
        ]),
      ),
    ).toEqual(["0:1"]);
  });
});
