import {
  hardDropPointsPerCell,
  lineClearScores,
  linesPerLevel,
  softDropPointsPerCell,
} from "../config/scoring";

export function getLineClearScore(linesCleared: number, level: number): number {
  const safeLineCount = Math.max(0, Math.min(4, linesCleared));
  const baseScore = lineClearScores[safeLineCount as keyof typeof lineClearScores];
  return baseScore * Math.max(1, level);
}

export function getLevel(totalLinesCleared: number): number {
  return Math.floor(Math.max(0, totalLinesCleared) / linesPerLevel) + 1;
}

export function getSoftDropScore(distance: number): number {
  return Math.max(0, distance) * softDropPointsPerCell;
}

export function getHardDropScore(distance: number): number {
  return Math.max(0, distance) * hardDropPointsPerCell;
}
