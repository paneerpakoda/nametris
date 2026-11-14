import { describe, expect, it } from "vitest";

import {
  lettersOnlyName,
  nameLengthLimit,
  nameRuleMessage,
  validatePlayerName,
} from "./nameValidation";

describe("player-name validation", () => {
  it("rejects a blank name", () => {
    expect(validatePlayerName("   ")).toEqual({
      valid: false,
      message: nameRuleMessage,
    });
  });

  it("keeps only A-Z letters and caps the length at 5", () => {
    expect(nameLengthLimit).toBe(5);
    expect(lettersOnlyName("  anmol! ")).toBe("ANMOL");
    expect(lettersOnlyName("ABCDEFGHIJKLMNOP")).toBe("ABCDE");
  });

  it("accepts 2 to 5 letters and rejects a longer name", () => {
    expect(validatePlayerName("jo")).toEqual({ valid: true, name: "JO" });
    expect(validatePlayerName("HARSH")).toEqual({ valid: true, name: "HARSH" });
    expect(validatePlayerName("HARSHDEEPS")).toEqual({
      valid: false,
      message: nameRuleMessage,
    });
  });

  it("rejects a single letter", () => {
    expect(validatePlayerName("A1")).toEqual({
      valid: false,
      message: nameRuleMessage,
    });
  });
});
