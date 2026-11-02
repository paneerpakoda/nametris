import { describe, expect, it } from "vitest";

import { lettersOnlyName, nameRuleMessage, validatePlayerName } from "./nameValidation";

describe("player-name validation", () => {
  it("rejects a blank name", () => {
    expect(validatePlayerName("   ")).toEqual({
      valid: false,
      message: nameRuleMessage,
    });
  });

  it("keeps only A-Z letters and caps the length at 10", () => {
    expect(lettersOnlyName("  anmol! ")).toBe("ANMOL");
    expect(lettersOnlyName("ABCDEFGHIJKLMNOP")).toBe("ABCDEFGHIJ");
  });

  it("accepts 2 to 10 letters", () => {
    expect(validatePlayerName("jo")).toEqual({ valid: true, name: "JO" });
    expect(validatePlayerName("ABCDEFGHIJ")).toEqual({
      valid: true,
      name: "ABCDEFGHIJ",
    });
  });

  it("rejects a single letter after stripping", () => {
    expect(validatePlayerName("A1")).toEqual({
      valid: false,
      message: nameRuleMessage,
    });
  });
});
