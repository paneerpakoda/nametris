import type { PlayerTitle } from "../config/titles";
import type { PieceType } from "../model/types";
import type { BoardSession } from "./session";
import { getStencilCompletion } from "./stencil";
import { selectPlayerTitle } from "./titles";

export interface FinalStencilSnapshot {
  readonly rows: number;
  readonly columns: number;
  readonly mask: readonly string[];
  readonly filledCells: readonly (readonly [string, PieceType])[];
}

interface FinalResultBase {
  readonly name: string;
  readonly completionRatio: number;
  readonly displayPercent: number;
  readonly score: number;
  readonly activeMilliseconds: number;
  readonly linesCleared: number;
  readonly level: number;
  readonly fourLineClears: number;
  readonly routedAttempts: number;
  readonly successfulStencilLocks: number;
  readonly canceledRoutes: number;
  readonly distinctStencilPieceTypes: number;
  readonly maximumBoardStackHeight: number;
  readonly stencilCellsFilled: number;
  readonly stencil: FinalStencilSnapshot;
}

export interface RunResult extends FinalResultBase {
  readonly outcome: "won";
  readonly title: PlayerTitle;
}

export interface LossResult extends FinalResultBase {
  readonly outcome: "lost";
}

function createResultBase(state: BoardSession): FinalResultBase {
  const completion = getStencilCompletion(state.stencil);
  const mask = [...state.stencil.mask].sort();
  const filledCells = [...state.stencil.filledCells.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return {
    name: state.name,
    completionRatio: completion.ratio,
    displayPercent: completion.displayPercent,
    score: state.score,
    activeMilliseconds: state.activeMilliseconds,
    linesCleared: state.linesCleared,
    level: state.level,
    fourLineClears: state.fourLineClears,
    routedAttempts: state.routedAttempts,
    successfulStencilLocks: state.successfulStencilLocks,
    canceledRoutes: state.canceledRoutes,
    distinctStencilPieceTypes: state.distinctStencilPieceTypes.size,
    maximumBoardStackHeight: state.maximumBoardStackHeight,
    stencilCellsFilled: state.stencil.filledCells.size,
    stencil: {
      rows: state.stencil.rows,
      columns: state.stencil.columns,
      mask,
      filledCells,
    },
  };
}

export function createRunResult(state: BoardSession): RunResult {
  const result = createResultBase(state);
  const title = selectPlayerTitle({
    completionRatio: result.completionRatio,
    score: result.score,
    activeSeconds: result.activeMilliseconds / 1000,
    linesCleared: result.linesCleared,
    fourLineClears: result.fourLineClears,
    routedAttempts: result.routedAttempts,
    successfulStencilLocks: result.successfulStencilLocks,
    distinctStencilPieceTypes: result.distinctStencilPieceTypes,
  });

  return { ...result, outcome: "won", title };
}

export function createLossResult(state: BoardSession): LossResult {
  return { ...createResultBase(state), outcome: "lost" };
}
