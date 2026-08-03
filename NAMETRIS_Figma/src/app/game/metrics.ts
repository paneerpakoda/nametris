// ─── Performance metrics tracked locally for the final player title ─────────────

import { PieceType } from "./pieces";

export interface Metrics {
  completion: number;
  score: number;
  activeMs: number;
  rowsCleared: number;
  level: number;
  tetrisCount: number; // number of four-row clears
  routingAttempts: number;
  successfulPlacements: number;
  canceledPlacements: number;
  placedTypes: PieceType[]; // distinct piece types placed in the stencil
  maxStackHeight: number;
}

export interface DerivedMetrics extends Metrics {
  activeSeconds: number;
  secondsPerStencilPiece: number;
  scorePerClearedLine: number;
  placementEfficiency: number;
  distinctTypes: number;
}

export function derive(m: Metrics): DerivedMetrics {
  const activeSeconds = m.activeMs / 1000;
  return {
    ...m,
    activeSeconds,
    secondsPerStencilPiece: activeSeconds / Math.max(m.successfulPlacements, 1),
    scorePerClearedLine: m.score / Math.max(m.rowsCleared, 1),
    placementEfficiency: m.successfulPlacements / Math.max(m.routingAttempts, 1),
    distinctTypes: m.placedTypes.length,
  };
}
