import type { ActivePiece, Cell, PieceType, Rotation } from "../model/types";
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

export function getStencilContributionCells(
  state: StencilState,
  piece: ActivePiece,
): readonly Cell[] {
  return getPieceCells(piece).filter((cell) => {
    const key = stencilCellKey(cell);
    return state.mask.has(key) && !state.filledCells.has(key);
  });
}

export function canLockIntoStencil(state: StencilState, piece: ActivePiece): boolean {
  return getStencilContributionCells(state, piece).length > 0;
}

export function lockIntoStencil(
  state: StencilState,
  piece: ActivePiece,
): StencilLockResult {
  if (!canLockIntoStencil(state, piece)) {
    return { state, locked: false };
  }

  const filledCells = new Map(state.filledCells);
  getStencilContributionCells(state, piece).forEach((cell) => {
    filledCells.set(stencilCellKey(cell), piece.type);
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

function getPartiallyVisibleOriginBounds(
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
  let bestContribution = 0;

  for (const rotation of rotations) {
    const bounds = getPartiallyVisibleOriginBounds(state, { type, rotation });

    for (let row = bounds.minimumRow; row <= bounds.maximumRow; row += 1) {
      for (
        let column = bounds.minimumColumn;
        column <= bounds.maximumColumn;
        column += 1
      ) {
        const candidate = { type, rotation, row, column };
        const contribution = getStencilContributionCells(state, candidate).length;

        if (contribution > bestContribution) {
          bestPlacement = candidate;
          bestContribution = contribution;
          if (contribution === 4) {
            return candidate;
          }
        }
      }
    }
  }

  return bestPlacement;
}

function clampPieceToStencil(state: StencilState, piece: ActivePiece): ActivePiece {
  const bounds = getPartiallyVisibleOriginBounds(state, piece);

  return {
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
