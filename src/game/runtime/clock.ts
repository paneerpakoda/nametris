export function addActiveMilliseconds(
  currentMilliseconds: number,
  elapsedMilliseconds: number,
  isActive: boolean,
): number {
  return isActive
    ? currentMilliseconds + Math.max(0, elapsedMilliseconds)
    : currentMilliseconds;
}
