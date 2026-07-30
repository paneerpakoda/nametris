import type { ActivePiece, PieceType, Rotation } from "../model/types";
import { getPieceCells } from "./pieces";
import { stencilCellKey } from "../glyphs/alphabet";

export interface StencilState {
  readonly mask: ReadonlySet<string>;
  readonly rows: number;
  readonly columns: number;
  readonly filledCells: ReadonlyMap<string, PieceType>;
}

export interface StencilCompletion {
  readonly ratio: number;
  readonly displayPercent: number;
  readonly canFinish: boolean;
  readonly perfect: boolean;
}

export interface StencilLockResult {
  readonly state: StencilState;
  readonly locked: boolean;
}

export interface StencilPieceProjection {
  readonly keptCellKeys: ReadonlySet<string>;
  readonly trimmedCellKeys: ReadonlySet<string>;
}

export function createStencilState(
  mask: ReadonlySet<string>,
  rows: number,
  columns: number,
): StencilState {
  return {
    mask: new Set(mask),
    rows,
    columns,
    filledCells: new Map(),
  };
}

export function getStencilPieceProjection(
  state: StencilState,
  piece: ActivePiece,
): StencilPieceProjection {
  const keptCellKeys = new Set<string>();
  const trimmedCellKeys = new Set<string>();

  getPieceCells(piece).forEach((cell) => {
    const key = stencilCellKey(cell);
    if (state.mask.has(key) && !state.filledCells.has(key)) {
      keptCellKeys.add(key);
    } else {
      trimmedCellKeys.add(key);
    }
  });

  return { keptCellKeys, trimmedCellKeys };
}

export function canLockIntoStencil(state: StencilState, piece: ActivePiece): boolean {
  return getStencilPieceProjection(state, piece).keptCellKeys.size > 0;
}

export function lockIntoStencil(
  state: StencilState,
  piece: ActivePiece,
): StencilLockResult {
  if (!canLockIntoStencil(state, piece)) {
    return { state, locked: false };
  }

  const filledCells = new Map(state.filledCells);
  getStencilPieceProjection(state, piece).keptCellKeys.forEach((key) => {
    filledCells.set(key, piece.type);
  });

  return {
    state: { ...state, filledCells },
    locked: true,
  };
}

export function getStencilCompletion(state: StencilState): StencilCompletion {
  const ratio = state.mask.size === 0 ? 0 : state.filledCells.size / state.mask.size;

  return {
    ratio,
    displayPercent: Math.floor(ratio * 100),
    canFinish: ratio >= 0.8,
    perfect: ratio === 1,
  };
}

const rotations: readonly Rotation[] = [0, 1, 2, 3];

function getOriginBounds(
  state: StencilState,
  piece: Pick<ActivePiece, "type" | "rotation">,
) {
  const cells = getPieceCells({ ...piece, row: 0, column: 0 });
  const minimumRow = Math.min(...cells.map(({ row }) => row));
  const maximumRow = Math.max(...cells.map(({ row }) => row));
  const minimumColumn = Math.min(...cells.map(({ column }) => column));
  const maximumColumn = Math.max(...cells.map(({ column }) => column));

  return {
    minimumRow: -maximumRow,
    maximumRow: state.rows - 1 - minimumRow,
    minimumColumn: -maximumColumn,
    maximumColumn: state.columns - 1 - minimumColumn,
  };
}

export function findFirstLegalStencilPlacement(
  state: StencilState,
  type: PieceType,
): ActivePiece | null {
  let bestPlacement: ActivePiece | null = null;
  let bestKeptCellCount = 0;

  for (const rotation of rotations) {
    const bounds = getOriginBounds(state, { type, rotation });

    for (let row = bounds.minimumRow; row <= bounds.maximumRow; row += 1) {
      for (
        let column = bounds.minimumColumn;
        column <= bounds.maximumColumn;
        column += 1
      ) {
        const candidate = { type, rotation, row, column };
        const keptCellCount = getStencilPieceProjection(state, candidate).keptCellKeys
          .size;

        if (keptCellCount > bestKeptCellCount) {
          bestPlacement = candidate;
          bestKeptCellCount = keptCellCount;
        }

        if (keptCellCount === 4) {
          return candidate;
        }
      }
    }
  }

  return bestPlacement;
}

function pieceTouchesStencilCanvas(state: StencilState, piece: ActivePiece): boolean {
  return getPieceCells(piece).some(
    ({ row, column }) =>
      row >= 0 && row < state.rows && column >= 0 && column < state.columns,
  );
}

function clampPieceToStencil(state: StencilState, piece: ActivePiece): ActivePiece {
  const bounds = getOriginBounds(state, piece);
  const clampedPiece = {
    ...piece,
    row:
      bounds.maximumRow < bounds.minimumRow
        ? bounds.minimumRow
        : Math.min(bounds.maximumRow, Math.max(bounds.minimumRow, piece.row)),
    column:
      bounds.maximumColumn < bounds.minimumColumn
        ? bounds.minimumColumn
        : Math.min(bounds.maximumColumn, Math.max(bounds.minimumColumn, piece.column)),
  };

  if (pieceTouchesStencilCanvas(state, clampedPiece)) {
    return clampedPiece;
  }

  let nearestVisiblePiece = clampedPiece;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let row = bounds.minimumRow; row <= bounds.maximumRow; row += 1) {
    for (
      let column = bounds.minimumColumn;
      column <= bounds.maximumColumn;
      column += 1
    ) {
      const candidate = { ...piece, row, column };
      if (!pieceTouchesStencilCanvas(state, candidate)) {
        continue;
      }

      const distance =
        Math.abs(piece.row - candidate.row) + Math.abs(piece.column - candidate.column);
      if (distance < nearestDistance) {
        nearestVisiblePiece = candidate;
        nearestDistance = distance;
      }
    }
  }

  return nearestVisiblePiece;
}

export function createStencilPlacementPiece(
  state: StencilState,
  type: PieceType,
): ActivePiece {
  return (
    findFirstLegalStencilPlacement(state, type) ??
    clampPieceToStencil(state, {
      type,
      rotation: 0,
      row: Math.floor(state.rows / 2) - 1,
      column: Math.floor(state.columns / 2) - 1,
    })
  );
}

export function moveStencilPiece(
  state: StencilState,
  piece: ActivePiece,
  rowDelta: number,
  columnDelta: number,
): ActivePiece {
  return clampPieceToStencil(state, {
    ...piece,
    row: piece.row + rowDelta,
    column: piece.column + columnDelta,
  });
}

export function rotateStencilPiece(
  state: StencilState,
  piece: ActivePiece,
  direction: "clockwise" | "counterclockwise",
): ActivePiece {
  const delta = direction === "clockwise" ? 1 : 3;

  return clampPieceToStencil(state, {
    ...piece,
    rotation: ((piece.rotation + delta) % 4) as Rotation,
  });
}
