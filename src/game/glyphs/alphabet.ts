import type { Cell } from "../model/types";

export const glyphRows = 7;
export const glyphColumns = 5;
export const glyphSpacing = 1;

const glyphPatterns = {
  A: [".###.", "##.##", "#...#", "#####", "#...#", "##..#", "#...."],
  B: ["####.", "#....", "#....", "#####", "#...#", "#..##", "####."],
  C: ["#####", "#....", "#....", "#....", "##...", "##...", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#..##", "#####"],
  E: ["#####", "##...", "#....", "####.", "#....", "##...", "#####"],
  F: ["#####", "##...", "#....", "####.", "#....", "##...", "#...."],
  G: ["#####", "#....", "#....", "#.###", "#...#", "##.##", ".###."],
  H: ["#...#", "##..#", "#...#", "#####", "#...#", "##.##", "#...#"],
  I: ["####.", "..#..", "..#..", "..#..", "..#..", "####.", "....."],
  J: ["..###", "....#", "....#", "#...#", "#...#", "#...#", "#####"],
  K: ["#..##", "#.##.", "#.#..", "###..", "#.##.", "##.##", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#.##.", "####."],
  M: ["#.#.#", "#####", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "##..#", "#.#.#", "#####", "#..##", "....#"],
  O: ["####.", "#...#", "#...#", "#...#", "#...#", "##.##", "####."],
  P: ["#####", "##..#", "##..#", "#####", "#....", "##...", "#...."],
  Q: ["####.", "#...#", "#...#", "#...#", "#####", "...#.", ".####"],
  R: ["####.", "#..##", "#...#", "####.", "#.##.", "#..##", "....#"],
  S: [".####", "##...", "##...", "#####", "....#", "....#", "#####"],
  T: ["####.", ".##..", ".##..", ".##..", ".##..", ".##..", ".##.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#####", "##.##", ".###."],
  V: ["#...#", "##.##", "##.##", "##.##", ".#.#.", ".###.", "..#.."],
  W: ["#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", "#####", "#...#"],
  X: ["#...#", "##.##", ".#.#.", "####.", ".#.#.", "##.##", "#...#"],
  Y: ["##.##", "#####", ".###.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "...##", "...#.", "####.", ".#...", "##...", "#####"],
} as const;

export type SupportedGlyph = keyof typeof glyphPatterns;

export interface Glyph {
  readonly rows: number;
  readonly columns: number;
  readonly cells: ReadonlySet<string>;
}

export interface NameMask extends Glyph {
  readonly name: string;
}

export function stencilCellKey(cell: Cell): string {
  return `${cell.row}:${cell.column}`;
}

function patternToCells(pattern: readonly string[]): ReadonlySet<string> {
  const cells = new Set<string>();

  pattern.forEach((row, rowIndex) => {
    [...row].forEach((cell, columnIndex) => {
      if (cell === "#") {
        cells.add(stencilCellKey({ row: rowIndex, column: columnIndex }));
      }
    });
  });

  return cells;
}

export const alphabet = Object.fromEntries(
  Object.entries(glyphPatterns).map(([letter, pattern]) => [
    letter,
    {
      rows: glyphRows,
      columns: glyphColumns,
      cells: patternToCells(pattern),
    },
  ]),
) as Readonly<Record<SupportedGlyph, Glyph>>;

function isSupportedGlyph(letter: string): letter is SupportedGlyph {
  return Object.hasOwn(glyphPatterns, letter);
}

export function getGlyphPattern(letter: string): readonly string[] {
  if (!isSupportedGlyph(letter)) {
    throw new Error("Only uppercase A–Z glyphs are supported.");
  }
  return glyphPatterns[letter];
}

export function composeNameMask(name: string): NameMask {
  const cells = new Set<string>();

  [...name].forEach((letter, letterIndex) => {
    if (!isSupportedGlyph(letter)) {
      throw new Error("A name mask requires only uppercase A–Z letters.");
    }

    const columnOffset = letterIndex * (glyphColumns + glyphSpacing);
    for (const key of alphabet[letter].cells) {
      const [rowText, columnText] = key.split(":");
      const row = Number(rowText);
      const column = Number(columnText);
      cells.add(stencilCellKey({ row, column: column + columnOffset }));
    }
  });

  return {
    name,
    rows: glyphRows,
    columns: name.length * glyphColumns + Math.max(0, name.length - 1) * glyphSpacing,
    cells,
  };
}
