import { describe, expect, it } from "vitest";

import { composeNameMask } from "../../game/glyphs/alphabet";
import {
  describePlayerName,
  mediumNameMaxCells,
  minimumLinesForName,
  nameLengthBand,
  shortNameMaxCells,
} from "./nameStats";

describe("name length bands", () => {
  it("splits short, medium, and long at the provisional cell cut-offs", () => {
    expect(nameLengthBand(shortNameMaxCells)).toBe("Short");
    expect(nameLengthBand(shortNameMaxCells + 1)).toBe("Medium");
    expect(nameLengthBand(mediumNameMaxCells)).toBe("Medium");
    expect(nameLengthBand(mediumNameMaxCells + 1)).toBe("Long");
  });

  it("estimates lines as at least ceil(0.22 × cells)", () => {
    expect(minimumLinesForName(0)).toBe(0);
    expect(minimumLinesForName(10)).toBe(3);
    expect(minimumLinesForName(50)).toBe(11);
    expect(minimumLinesForName(86)).toBe(19);
  });

  it("describes a real name from its outline", () => {
    const described = describePlayerName("JO");
    const cells = composeNameMask("JO").cells.size;

    expect(described).toEqual({
      name: "JO",
      cells,
      band: nameLengthBand(cells),
      minimumLines: minimumLinesForName(cells),
    });
  });
});
