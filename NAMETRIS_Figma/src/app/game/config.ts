// ─── Centralized tunable configuration ─────────────────────────────────────────

export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;

// Scoring — kept centralized so values can be tuned easily.
export const SCORING = {
  lineClear: { 1: 100, 2: 300, 3: 700, 4: 1500 } as Record<number, number>,
  softDropPerCell: 1,
  hardDropPerCell: 2,
};

// Gravity progression.
export const GRAVITY = {
  baseInterval: 800, // ms per gravity step at level 1
  minInterval: 90, // playable minimum interval
  perLevelFactor: 0.84, // multiplied per level above 1
};

export function gravityInterval(level: number): number {
  const interval = GRAVITY.baseInterval * Math.pow(GRAVITY.perLevelFactor, level - 1);
  return Math.max(GRAVITY.minInterval, interval);
}

export const ROWS_PER_LEVEL = 10;

export function levelForRows(rows: number): number {
  return Math.floor(rows / ROWS_PER_LEVEL) + 1;
}

// Lock delay — short grace period before a resting piece locks, with a reset cap
// so a player cannot stall indefinitely.
export const LOCK_DELAY_MS = 500;
export const LOCK_RESET_CAP = 15;

// Completion loop.
export const FINISH_THRESHOLD = 80; // % at which finishing is unlocked
export const PERFECT_COMPLETION = 100;

// Title thresholds — centralized.
export const TITLE_CONFIG = {
  stencilSorcererMinCompletion: 95,
  turboSecondsPerPiece: 15,
  lineDanceScorePerLine: 450,
  shapeWhispererEfficiency: 0.8,
  shapeWhispererDistinctTypes: 6,
  perfectTurboSecondsPerPiece: 13,
  perfectAlchemistScorePerLine: 550,
};
