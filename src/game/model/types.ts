export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type Rotation = 0 | 1 | 2 | 3;

export interface Cell {
  readonly row: number;
  readonly column: number;
}

export interface ActivePiece {
  readonly type: PieceType;
  readonly row: number;
  readonly column: number;
  readonly rotation: Rotation;
}

export type BoardCell = PieceType | null;

export type Board = readonly (readonly BoardCell[])[];
