import { BOARD_COLS } from "./config";

// ─── Piece definitions ──────────────────────────────────────────────────────────

export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface Piece {
  type: PieceType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

export const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export const PIECE_DEFS: Record<PieceType, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: "#06b6d4" },
  O: { shape: [[1, 1], [1, 1]], color: "#facc15" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "#a855f7" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "#4ade80" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "#f87171" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "#3b82f6" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "#f97316" },
};

export function spawnPiece(type: PieceType, cols: number = BOARD_COLS): Piece {
  const def = PIECE_DEFS[type];
  return {
    type,
    shape: def.shape.map((row) => [...row]),
    color: def.color,
    x: Math.floor((cols - def.shape[0].length) / 2),
    y: 0,
  };
}

export function rotateCW(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const result: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) result[c][rows - 1 - r] = shape[r][c];
  return result;
}

export function rotateCCW(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const result: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) result[cols - 1 - c][r] = shape[r][c];
  return result;
}

// ─── Deterministic seven-bag generator ──────────────────────────────────────────
// Fills a bag with all seven piece types in a shuffled order, refilling when empty.
// This guarantees fair distribution instead of independent random pieces.

export interface Bag {
  queue: PieceType[];
}

function shuffledBag(): PieceType[] {
  const bag = [...PIECE_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function createBag(): Bag {
  return { queue: shuffledBag() };
}

export function nextType(bag: Bag): PieceType {
  if (bag.queue.length === 0) bag.queue = shuffledBag();
  return bag.queue.shift()!;
}
