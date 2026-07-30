import { describe, expect, it } from "vitest";

import { alphabet, composeNameMask, getGlyphPattern } from "./alphabet";

describe("Nametris glyph alphabet", () => {
  it("contains all 26 uppercase English glyphs", () => {
    expect(Object.keys(alphabet).sort().join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  });

  it.each(Object.keys(alphabet))("%s is a non-empty 5 by 7 glyph", (letter) => {
    const pattern = getGlyphPattern(letter);
    expect(pattern).toHaveLength(7);
    expect(pattern.every((row) => row.length === 5)).toBe(true);
    expect(alphabet[letter as keyof typeof alphabet].cells.size).toBeGreaterThan(0);
  });

  it.each(["AB", "HARSH", "ABCDEFGHIJ"])("composes a legible mask for %s", (name) => {
    const mask = composeNameMask(name);

    expect(mask.cells.size).toBeGreaterThan(0);
    expect(mask.columns).toBe(name.length * 5 + (name.length - 1));
  });

  it("uses conventional forms for representative letters", () => {
    expect(getGlyphPattern("A")).toEqual([
      ".###.",
      "#...#",
      "#...#",
      "#####",
      "#...#",
      "#...#",
      "#...#",
    ]);
    expect(getGlyphPattern("N")).toEqual([
      "#...#",
      "##..#",
      "##..#",
      "#.#.#",
      "#..##",
      "#..##",
      "#...#",
    ]);
  });

  it("keeps a reviewable glyph fixture", () => {
    expect(
      Object.keys(alphabet)
        .map((letter) => `${letter}\n${getGlyphPattern(letter).join("\n")}`)
        .join("\n\n"),
    ).toMatchSnapshot();
  });

  it("rejects unsupported glyph and name-mask input", () => {
    expect(() => getGlyphPattern("?")).toThrow(/uppercase A–Z/);
    expect(() => composeNameMask("A?")).toThrow(/uppercase A–Z/);
  });
});
