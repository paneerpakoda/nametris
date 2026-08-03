import { BOARD_COLS, BOARD_ROWS } from "./config";
import { Piece, rotateCW, rotateCCW } from "./pieces";

// ─── Board types & pure engine functions ────────────────────────────────────────

export type Cell = string | null;
export type Board = Cell[][];

export function emptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
}

export function isValidPosition(board: Board, piece: Piece): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const nx = piece.x + c;
      const ny = piece.y + r;
      if (nx < 0 || nx >= BOARD_COLS || ny >= BOARD_ROWS) return false;
      if (ny >= 0 && board[ny][nx] !== null) return false;
    }
  }
  return true;
}

export function lockPiece(board: Board, piece: Piece): Board {
  const next = board.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++)
      if (piece.shape[r][c] && piece.y + r >= 0) next[piece.y + r][piece.x + c] = piece.color;
  return next;
}

export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((c) => c === null));
  const cleared = BOARD_ROWS - kept.length;
  const newRows: Board = Array.from({ length: cleared }, () => Array(BOARD_COLS).fill(null));
  return { board: [...newRows, ...kept], cleared };
}

export function getPieceSquares(piece: Piece): { r: number; c: number }[] {
  const squares: { r: number; c: number }[] = [];
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++)
      if (piece.shape[r][c]) squares.push({ r: piece.y + r, c: piece.x + c });
  return squares;
}

export function getGhostPiece(board: Board, piece: Piece): Piece {
  let ghost = { ...piece };
  while (isValidPosition(board, { ...ghost, y: ghost.y + 1 })) ghost = { ...ghost, y: ghost.y + 1 };
  return ghost;
}

// Highest occupied stack height (rows from the bottom that contain any block).
export function stackHeight(board: Board): number {
  for (let r = 0; r < BOARD_ROWS; r++) {
    if (board[r].some((c) => c !== null)) return BOARD_ROWS - r;
  }
  return 0;
}

// ─── Rotation with basic wall kicks ─────────────────────────────────────────────
// After rotating, try a small set of horizontal (and one vertical) offsets so
// rotations near walls or the floor succeed naturally.

const KICK_OFFSETS: { dx: number; dy: number }[] = [
  { dx: 0, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: -2, dy: 0 },
  { dx: 2, dy: 0 },
  { dx: 0, dy: -1 },
];

export function tryRotate(board: Board, piece: Piece, dir: "cw" | "ccw"): Piece | null {
  const rotated = dir === "cw" ? rotateCW(piece.shape) : rotateCCW(piece.shape);
  for (const { dx, dy } of KICK_OFFSETS) {
    const candidate: Piece = { ...piece, shape: rotated, x: piece.x + dx, y: piece.y + dy };
    if (isValidPosition(board, candidate)) return candidate;
  }
  return null;
}
