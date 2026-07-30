import { describe, expect, it } from "vitest";

import type { ActivePiece, Board, PieceType, Rotation } from "../model/types";
import { BOARD_HEIGHT, BOARD_WIDTH, createEmptyBoard } from "./board";
import { canPlacePiece, movePiece } from "./collision";
import { getPieceCells } from "./pieces";

const pieceTypes: readonly PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];
const rotations: readonly Rotation[] = [0, 1, 2, 3];

function piece(
  type: PieceType,
  column: number,
  row: number,
  rotation: Rotation = 0,
): ActivePiece {
  return { type, column, row, rotation };
}

describe("tetromino geometry", () => {
  it.each(pieceTypes)("%s has four cells in every rotation", (type) => {
    for (const rotation of rotations) {
      const cells = getPieceCells(piece(type, 3, 3, rotation));
      expect(cells).toHaveLength(4);
      expect(new Set(cells.map(({ row, column }) => `${row}:${column}`)).size).toBe(4);
    }
  });
});

describe("piece collision", () => {
  it("allows movement through empty in-bounds cells", () => {
    const board = createEmptyBoard();
    const active = piece("T", 3, 3);

    expect(movePiece(board, active, 1, 0)).toEqual({
      ...active,
      column: 4,
    });
  });

  it("rejects movement through the left wall", () => {
    const board = createEmptyBoard();
    const active = piece("I", -2, 3, 1);

    expect(movePiece(board, active, -1, 0)).toEqual(active);
  });

  it("rejects movement through the floor", () => {
    const board = createEmptyBoard();
    const active = piece("O", 3, BOARD_HEIGHT - 2);

    expect(movePiece(board, active, 0, 1)).toEqual(active);
  });

  it("rejects occupied board cells", () => {
    const empty = createEmptyBoard();
    const board: Board = empty.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex === 5 && columnIndex === 4 ? "J" : cell,
      ),
    );

    expect(canPlacePiece(board, piece("T", 3, 4))).toBe(false);
  });

  it("uses the configured ten-column board", () => {
    expect(BOARD_WIDTH).toBe(10);
  });
});
