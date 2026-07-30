import type { ActivePiece, Cell, PieceType, Rotation } from "../model/types";

type PieceOffsets = Readonly<Record<Rotation, readonly Cell[]>>;

const shapes: Readonly<Record<PieceType, PieceOffsets>> = {
  I: {
    0: [
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 1, column: 3 },
    ],
    1: [
      { row: 0, column: 2 },
      { row: 1, column: 2 },
      { row: 2, column: 2 },
      { row: 3, column: 2 },
    ],
    2: [
      { row: 2, column: 0 },
      { row: 2, column: 1 },
      { row: 2, column: 2 },
      { row: 2, column: 3 },
    ],
    3: [
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 2, column: 1 },
      { row: 3, column: 1 },
    ],
  },
  O: sameRotations([
    { row: 0, column: 1 },
    { row: 0, column: 2 },
    { row: 1, column: 1 },
    { row: 1, column: 2 },
  ]),
  T: {
    0: [
      { row: 0, column: 1 },
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
    ],
    1: [
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 2, column: 1 },
    ],
    2: [
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 2, column: 1 },
    ],
    3: [
      { row: 0, column: 1 },
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 2, column: 1 },
    ],
  },
  S: {
    0: [
      { row: 0, column: 1 },
      { row: 0, column: 2 },
      { row: 1, column: 0 },
      { row: 1, column: 1 },
    ],
    1: [
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 2, column: 2 },
    ],
    2: [
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 2, column: 0 },
      { row: 2, column: 1 },
    ],
    3: [
      { row: 0, column: 0 },
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 2, column: 1 },
    ],
  },
  Z: {
    0: [
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
    ],
    1: [
      { row: 0, column: 2 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 2, column: 1 },
    ],
    2: [
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 2, column: 1 },
      { row: 2, column: 2 },
    ],
    3: [
      { row: 0, column: 1 },
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 2, column: 0 },
    ],
  },
  J: {
    0: [
      { row: 0, column: 0 },
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
    ],
    1: [
      { row: 0, column: 1 },
      { row: 0, column: 2 },
      { row: 1, column: 1 },
      { row: 2, column: 1 },
    ],
    2: [
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 2, column: 2 },
    ],
    3: [
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 2, column: 0 },
      { row: 2, column: 1 },
    ],
  },
  L: {
    0: [
      { row: 0, column: 2 },
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
    ],
    1: [
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 2, column: 1 },
      { row: 2, column: 2 },
    ],
    2: [
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
      { row: 2, column: 0 },
    ],
    3: [
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      { row: 1, column: 1 },
      { row: 2, column: 1 },
    ],
  },
};

function sameRotations(cells: readonly Cell[]): PieceOffsets {
  return { 0: cells, 1: cells, 2: cells, 3: cells };
}

export function getPieceOffsets(type: PieceType, rotation: Rotation): readonly Cell[] {
  return shapes[type][rotation];
}

export function getPieceCells(piece: ActivePiece): readonly Cell[] {
  return getPieceOffsets(piece.type, piece.rotation).map((offset) => ({
    row: piece.row + offset.row,
    column: piece.column + offset.column,
  }));
}
