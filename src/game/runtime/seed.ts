export function readSeedParam(search: string): number | null {
  const value = new URLSearchParams(search).get("seed");
  if (value === null || !/^[0-9]+$/.test(value)) {
    return null;
  }

  const seed = Number(value);
  return Number.isSafeInteger(seed) ? seed : null;
}

export function createRunSeed(
  search: string,
  random: () => number = Math.random,
): number {
  return readSeedParam(search) ?? Math.floor(random() * 1_000_000_000);
}
