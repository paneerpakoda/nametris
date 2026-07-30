import type { ActivePiece, Board, BoardCell } from "../model/types";
import { getPieceCells } from "./pieces";
import { getLineClearScore } from "./scoring";

export const BOARD_WIDTH = 10;
export const VISIBLE_BOARD_HEIGHT = 20;
export const HIDDEN_BOARD_ROWS = 2;
export const BOARD_HEIGHT = VISIBLE_BOARD_HEIGHT + HIDDEN_BOARD_ROWS;

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null),
  );
}

export function getBoardStackHeight(board: Board): number {
  const highestOccupiedRow = board.findIndex((row) =>
    row.some((cell) => cell !== null),
  );

  return highestOccupiedRow === -1 ? 0 : BOARD_HEIGHT - highestOccupiedRow;
}

export interface LockResult {
  readonly board: Board;
  readonly linesCleared: number;
  readonly transfersEarned: number;
  readonly scoreEarned: number;
  readonly toppedOut: boolean;
}

export function lockAndClearPiece(
  board: Board,
  piece: ActivePiece,
  level: number,
): LockResult {
  const locked: BoardCell[][] = board.map((row) => [...row]);
  const pieceCells = getPieceCells(piece);

  for (const cell of pieceCells) {
    const row = locked[cell.row];

    if (
      row === undefined ||
      cell.column < 0 ||
      cell.column >= BOARD_WIDTH ||
      row[cell.column] !== null
    ) {
      throw new Error("Cannot lock a tetromino into occupied or out-of-bounds cells.");
    }

    row[cell.column] = piece.type;
  }

  const toppedOut = pieceCells.some(({ row }) => row < HIDDEN_BOARD_ROWS);
  const remainingRows = locked.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_HEIGHT - remainingRows.length;
  const emptyRows = Array.from({ length: linesCleared }, () =>
    Array.from<BoardCell>({ length: BOARD_WIDTH }).fill(null),
  );

  return {
    board: [...emptyRows, ...remainingRows],
    linesCleared,
    transfersEarned: linesCleared,
    scoreEarned: getLineClearScore(linesCleared, level),
    toppedOut,
  };
}
