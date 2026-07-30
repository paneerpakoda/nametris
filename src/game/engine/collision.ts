import type { ActivePiece, Board } from "../model/types";
import { BOARD_HEIGHT, BOARD_WIDTH } from "./board";
import { getPieceCells } from "./pieces";

export function canPlacePiece(board: Board, piece: ActivePiece): boolean {
  return getPieceCells(piece).every(({ row, column }) => {
    if (row < 0 || row >= BOARD_HEIGHT || column < 0 || column >= BOARD_WIDTH) {
      return false;
    }

    return board[row]?.[column] === null;
  });
}

export function movePiece(
  board: Board,
  piece: ActivePiece,
  columnDelta: number,
  rowDelta: number,
): ActivePiece {
  const moved = {
    ...piece,
    column: piece.column + columnDelta,
    row: piece.row + rowDelta,
  };

  return canPlacePiece(board, moved) ? moved : piece;
}
