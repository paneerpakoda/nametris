import { HIDDEN_BOARD_ROWS } from "../../game/engine/board";
import { getPieceCells } from "../../game/engine/pieces";
import type { ActivePiece, Board } from "../../game/model/types";
import { ms } from "../../design/tokens";

export const lineClearVisibleMilliseconds = ms("duration-clear");
export const lineClearReducedMilliseconds = ms("duration-clear-reduced");
export const rowClearMilliseconds = ms("duration-pop");
export const softLockFlashMilliseconds = ms("duration-lock");
export const hardDropTrailMilliseconds = ms("duration-trail");
export const hardDropBumpMilliseconds = ms("duration-bump");
export const namePopMilliseconds = ms("duration-pop");
export const pieceFlyMilliseconds = ms("duration-flight");
export const letterFlashMilliseconds = ms("duration-letter");
export const stackGreyMilliseconds = ms("duration-grey");

export function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function pieceCellKeys(piece: ActivePiece): readonly string[] {
  return getPieceCells(piece).map(({ row, column }) => `${row}:${column}`);
}

export function clearedVisibleRows(
  board: Board,
  piece: ActivePiece,
): readonly number[] {
  const locked = board.map((row) => [...row]);

  for (const cell of getPieceCells(piece)) {
    const row = locked[cell.row];
    if (row !== undefined && row[cell.column] === null) {
      row[cell.column] = piece.type;
    }
  }

  const rows: number[] = [];
  locked.forEach((row, index) => {
    if (index >= HIDDEN_BOARD_ROWS && row.every((cell) => cell !== null)) {
      rows.push(index - HIDDEN_BOARD_ROWS);
    }
  });
  return rows;
}

export function hardDropTrailKeys(
  piece: ActivePiece,
  landingRow: number,
): readonly string[] {
  const keys: string[] = [];

  for (let row = piece.row; row < landingRow; row += 1) {
    keys.push(...pieceCellKeys({ ...piece, row }));
  }

  return keys;
}

export function ghostLocksTooHigh(ghost: ActivePiece): boolean {
  return getPieceCells(ghost).some((cell) => cell.row < HIDDEN_BOARD_ROWS + 2);
}

export function addedFilledKeys(
  previous: ReadonlySet<string>,
  filled: ReadonlyMap<string, unknown>,
): readonly string[] {
  return [...filled.keys()].filter((key) => !previous.has(key));
}
