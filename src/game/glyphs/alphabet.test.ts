import { describe, expect, it } from "vitest";

import { alphabet, composeNameMask, getGlyphPattern } from "./alphabet";
import { isMaskTileable } from "./exactCover";

describe("Nametris glyph alphabet", () => {
  it("contains all 26 uppercase English glyphs", () => {
    expect(Object.keys(alphabet).sort().join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  });

  it.each(Object.keys(alphabet))(
    "%s is divisible by four and exactly tileable",
    (letter) => {
      const glyph = alphabet[letter as keyof typeof alphabet];

      expect(glyph.cells.size % 4).toBe(0);
      expect(isMaskTileable(glyph.cells)).toBe(true);
    },
  );

  it.each(["AB", "HARSH", "ABCDEFGHIJ"])("composes a tileable mask for %s", (name) => {
    const mask = composeNameMask(name);

    expect(mask.cells.size % 4).toBe(0);
    expect(isMaskTileable(mask.cells)).toBe(true);
    expect(mask.columns).toBe(name.length * 5 + (name.length - 1));
  });

  it("keeps a reviewable glyph fixture", () => {
    expect(
      Object.keys(alphabet)
        .map((letter) => `${letter}\n${getGlyphPattern(letter).join("\n")}`)
        .join("\n\n"),
    ).toMatchSnapshot();
  });
});
