import { describe, expect, it } from "vitest";

import type { ActivePiece, Board } from "../model/types";
import { createEmptyBoard } from "./board";
import { getPieceCells } from "./pieces";
import { rotatePiece } from "./rotation";

describe("piece rotation", () => {
  it("rotates clockwise and counter-clockwise in open space", () => {
    const board = createEmptyBoard();
    const active: ActivePiece = {
      type: "T",
      row: 5,
      column: 3,
      rotation: 0,
    };

    expect(rotatePiece(board, active, "clockwise").rotation).toBe(1);
    expect(rotatePiece(board, active, "counterclockwise").rotation).toBe(3);
  });

  it("kicks a T piece away from the left wall", () => {
    const board = createEmptyBoard();
    const active: ActivePiece = {
      type: "T",
      row: 5,
      column: -1,
      rotation: 1,
    };

    const rotated = rotatePiece(board, active, "clockwise");

    expect(rotated.rotation).toBe(2);
    expect(rotated.column).toBeGreaterThan(active.column);
  });

  it("uses a wider kick for the I piece", () => {
    const board = createEmptyBoard();
    const active: ActivePiece = {
      type: "I",
      row: 5,
      column: 7,
      rotation: 1,
    };

    const rotated = rotatePiece(board, active, "clockwise");

    expect(rotated.rotation).toBe(2);
    expect(rotated.column).toBe(6);
  });

  it("keeps the piece unchanged when every kick is obstructed", () => {
    const active: ActivePiece = {
      type: "T",
      row: 5,
      column: 3,
      rotation: 0,
    };
    const activeCells = new Set(
      getPieceCells(active).map(({ row, column }) => `${row}:${column}`),
    );
    const board: Board = createEmptyBoard().map((row, rowIndex) =>
      row.map((_, columnIndex) =>
        activeCells.has(`${rowIndex}:${columnIndex}`) ? null : "J",
      ),
    );

    expect(rotatePiece(board, active, "clockwise")).toEqual(active);
  });

  it("keeps the O piece centered when rotating", () => {
    const board = createEmptyBoard();
    const active: ActivePiece = {
      type: "O",
      row: 5,
      column: 3,
      rotation: 0,
    };

    expect(rotatePiece(board, active, "clockwise")).toEqual({
      ...active,
      rotation: 1,
    });
  });
});
