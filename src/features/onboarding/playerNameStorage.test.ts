import { describe, expect, it } from "vitest";

import {
  playerNameKey,
  readStoredPlayerName,
  storePlayerName,
} from "./playerNameStorage";

describe("player name storage", () => {
  it("trims a leftover name longer than 5 letters and persists the prefix", () => {
    window.localStorage.setItem(playerNameKey, "HARSHDEEPS");

    expect(readStoredPlayerName()).toEqual({ name: "HARSH", trimmed: true });
    expect(window.localStorage.getItem(playerNameKey)).toBe("HARSH");
    expect(readStoredPlayerName()).toEqual({ name: "HARSH", trimmed: true });
  });

  it("keeps a stored 5-letter name and refuses to write a longer one", () => {
    storePlayerName("HARSH");
    expect(readStoredPlayerName()).toEqual({ name: "HARSH", trimmed: false });

    storePlayerName("HARSHDEEPS");
    expect(window.localStorage.getItem(playerNameKey)).toBe("HARSH");
  });
});
