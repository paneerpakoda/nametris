import { describe, expect, it } from "vitest";

import { juicePreferenceKey } from "../features/juice/preferences";
import { howItWorksSeenKey } from "../features/onboarding/howItWorksStorage";
import { playerNameKey } from "../features/onboarding/playerNameStorage";
import { resetAllGameData } from "./resetGameData";

describe("resetAllGameData", () => {
  it("removes every nametris storage key and the trim notice", () => {
    localStorage.setItem(playerNameKey, "JO");
    localStorage.setItem(howItWorksSeenKey, "1");
    localStorage.setItem(juicePreferenceKey, '{"muted":true}');
    localStorage.setItem("other.app", "keep");
    sessionStorage.setItem("nametris.nameTrimNotice", "1");

    resetAllGameData();

    expect(localStorage.getItem(playerNameKey)).toBeNull();
    expect(localStorage.getItem(howItWorksSeenKey)).toBeNull();
    expect(localStorage.getItem(juicePreferenceKey)).toBeNull();
    expect(localStorage.getItem("other.app")).toBe("keep");
    expect(sessionStorage.getItem("nametris.nameTrimNotice")).toBeNull();
  });
});
