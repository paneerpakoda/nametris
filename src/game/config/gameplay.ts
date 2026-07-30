export const spawnRow = 0;
export const spawnColumn = 3;
export const lockDelayMilliseconds = 500;
export const lockResetLimit = 15;
export const minimumGravityMilliseconds = 80;

export function getGravityMilliseconds(level: number): number {
  const interval = 800 * 0.85 ** Math.max(0, level - 1);
  return Math.max(minimumGravityMilliseconds, Math.round(interval));
}
