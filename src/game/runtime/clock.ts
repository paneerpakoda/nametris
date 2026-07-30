export function addActiveMilliseconds(
  currentMilliseconds: number,
  elapsedMilliseconds: number,
  isActive: boolean,
): number {
  return isActive
    ? currentMilliseconds + Math.max(0, elapsedMilliseconds)
    : currentMilliseconds;
}

export function formatActiveTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
