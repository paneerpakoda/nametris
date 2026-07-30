import type { ActivePiece, Board, Cell, Rotation } from "../model/types";
import { canPlacePiece } from "./collision";

export type RotationDirection = "clockwise" | "counterclockwise";

const standardKicks: readonly Cell[] = [
  { row: 0, column: 0 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
  { row: -1, column: 0 },
  { row: -1, column: -1 },
  { row: -1, column: 1 },
  { row: 0, column: -2 },
  { row: 0, column: 2 },
];

const iPieceKicks: readonly Cell[] = [
  { row: 0, column: 0 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
  { row: 0, column: -2 },
  { row: 0, column: 2 },
  { row: -1, column: 0 },
  { row: -2, column: 0 },
];

function nextRotation(rotation: Rotation, direction: RotationDirection): Rotation {
  const delta = direction === "clockwise" ? 1 : 3;
  return ((rotation + delta) % 4) as Rotation;
}

export function rotatePiece(
  board: Board,
  piece: ActivePiece,
  direction: RotationDirection,
): ActivePiece {
  const rotation = nextRotation(piece.rotation, direction);
  const kicks = piece.type === "I" ? iPieceKicks : standardKicks;

  for (const kick of kicks) {
    const candidate: ActivePiece = {
      ...piece,
      rotation,
      row: piece.row + kick.row,
      column: piece.column + kick.column,
    };

    if (canPlacePiece(board, candidate)) {
      return candidate;
    }
  }

  return piece;
}
