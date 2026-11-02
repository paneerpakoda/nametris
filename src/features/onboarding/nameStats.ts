import { composeNameMask } from "../../game/glyphs/alphabet";

export const shortNameMaxCells = 50;
export const mediumNameMaxCells = 100;
export const linesPerNameCell = 0.22;

export type NameLengthBand = "Short" | "Medium" | "Long";

export interface PlayerNameStats {
  readonly name: string;
  readonly cells: number;
  readonly band: NameLengthBand;
  readonly minimumLines: number;
}

export function nameLengthBand(cellCount: number): NameLengthBand {
  if (cellCount <= shortNameMaxCells) {
    return "Short";
  }
  if (cellCount <= mediumNameMaxCells) {
    return "Medium";
  }
  return "Long";
}

export function minimumLinesForName(cellCount: number): number {
  return Math.ceil(linesPerNameCell * Math.max(0, cellCount));
}

export function describePlayerName(name: string): PlayerNameStats | null {
  if (!/^[A-Z]{1,10}$/.test(name)) {
    return null;
  }

  const cells = composeNameMask(name).cells.size;
  return {
    name,
    cells,
    band: nameLengthBand(cells),
    minimumLines: minimumLinesForName(cells),
  };
}
