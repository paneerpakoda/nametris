import { playerTitles, titleThresholds, type PlayerTitle } from "../config/titles";

export interface PerformanceMetrics {
  readonly completionRatio: number;
  readonly score: number;
  readonly activeSeconds: number;
  readonly linesCleared: number;
  readonly fourLineClears: number;
  readonly routedAttempts: number;
  readonly successfulStencilLocks: number;
  readonly distinctStencilPieceTypes: number;
}

export interface NormalizedPerformance {
  readonly secondsPerStencilPiece: number;
  readonly scorePerClearedLine: number;
  readonly placementEfficiency: number;
}

export function normalizePerformance(
  metrics: PerformanceMetrics,
): NormalizedPerformance {
  return {
    secondsPerStencilPiece:
      metrics.activeSeconds / Math.max(metrics.successfulStencilLocks, 1),
    scorePerClearedLine: metrics.score / Math.max(metrics.linesCleared, 1),
    placementEfficiency:
      metrics.successfulStencilLocks / Math.max(metrics.routedAttempts, 1),
  };
}

export function selectPlayerTitle(metrics: PerformanceMetrics): PlayerTitle {
  const normalized = normalizePerformance(metrics);

  if (metrics.completionRatio >= 1) {
    if (normalized.secondsPerStencilPiece <= titleThresholds.perfectSecondsPerPiece) {
      return playerTitles.oneHundredWonder;
    }
    if (normalized.scorePerClearedLine >= titleThresholds.perfectScorePerLine) {
      return playerTitles.pixelPerfectAlchemist;
    }
    return playerTitles.crownedBlocksmith;
  }

  if (metrics.completionRatio >= titleThresholds.sorcererCompletion) {
    return playerTitles.stencilSorcerer;
  }
  if (normalized.secondsPerStencilPiece <= titleThresholds.regularSecondsPerPiece) {
    return playerTitles.turboTypesetter;
  }
  if (
    metrics.fourLineClears > 0 ||
    normalized.scorePerClearedLine >= titleThresholds.regularScorePerLine
  ) {
    return playerTitles.lineDanceLegend;
  }
  if (
    normalized.placementEfficiency >= titleThresholds.placementEfficiency &&
    metrics.distinctStencilPieceTypes >= titleThresholds.distinctPieceTypes
  ) {
    return playerTitles.shapeWhisperer;
  }
  return playerTitles.blockPoet;
}
