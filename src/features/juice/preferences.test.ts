import { afterEach, describe, expect, it } from "vitest";

import {
  defaultJuicePreferences,
  getJuicePreferences,
  juicePreferenceKey,
  readJuicePreferences,
  resetJuicePreferenceMemory,
  updateJuicePreferences,
  writeJuicePreferences,
} from "./preferences";

afterEach(() => {
  resetJuicePreferenceMemory();
});

describe("juice preferences", () => {
  it("defaults to sound on, half volume, motion on, and move sounds off", () => {
    expect(readJuicePreferences()).toEqual(defaultJuicePreferences);
    expect(defaultJuicePreferences).toEqual({
      muted: false,
      volume: 0.5,
      reducedMotion: false,
      moveSounds: false,
    });
  });

  it("saves mute, volume, reduced motion, and move sounds in one key", () => {
    updateJuicePreferences({
      muted: true,
      volume: 0.25,
      reducedMotion: true,
      moveSounds: true,
    });

    expect(JSON.parse(window.localStorage.getItem(juicePreferenceKey) ?? "")).toEqual({
      muted: true,
      volume: 0.25,
      reducedMotion: true,
      moveSounds: true,
    });
    window.localStorage.clear();
    resetJuicePreferenceMemory();
    expect(getJuicePreferences()).toEqual(defaultJuicePreferences);
  });

  it("clamps volume and ignores corrupt stored values", () => {
    writeJuicePreferences({ ...defaultJuicePreferences, volume: 4 });
    expect(readJuicePreferences().volume).toBe(1);

    window.localStorage.setItem(juicePreferenceKey, "{");
    expect(readJuicePreferences()).toEqual(defaultJuicePreferences);
    window.localStorage.setItem(juicePreferenceKey, "null");
    expect(readJuicePreferences()).toEqual(defaultJuicePreferences);
  });

  it("does not throw when storage is blocked", () => {
    const blocked = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    } as unknown as Storage;

    expect(readJuicePreferences(blocked)).toEqual(defaultJuicePreferences);
    expect(writeJuicePreferences(defaultJuicePreferences, blocked)).toBe(false);
    expect(() =>
      writeJuicePreferences({ ...defaultJuicePreferences, muted: true }, blocked),
    ).not.toThrow();

    const setItem = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error("blocked");
    };
    expect(() => updateJuicePreferences({ muted: true })).not.toThrow();
    expect(getJuicePreferences().muted).toBe(true);
    window.localStorage.setItem = setItem;
  });
});
