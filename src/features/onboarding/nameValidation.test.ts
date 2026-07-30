import { describe, expect, it } from "vitest";

import { validatePlayerName } from "./nameValidation";

describe("player-name validation", () => {
  it("uses HARSH for blank input", () => {
    expect(validatePlayerName("   ")).toEqual({
      valid: true,
      name: "HARSH",
    });
  });

  it("trims and uppercases valid ASCII letters", () => {
    expect(validatePlayerName("  anmol  ")).toEqual({
      valid: true,
      name: "ANMOL",
    });
  });

  it.each(["A", "ABCDEFGHIJK", "A B", "A1", "ÉVA", "<AB>"])(
    "rejects invalid non-empty input: %s",
    (input) => {
      expect(validatePlayerName(input)).toEqual({
        valid: false,
        message: "Use 2–10 English letters without spaces or symbols.",
      });
    },
  );
});
