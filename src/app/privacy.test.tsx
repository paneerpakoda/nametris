import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { howItWorksSeenKey } from "../features/onboarding/howItWorksStorage";
import { playerNameKey } from "../features/onboarding/playerNameStorage";
import { App } from "./App";

describe("player-name privacy boundary", () => {
  it("stores only the name string and keeps it out of URLs, logs, and requests", async () => {
    const user = userEvent.setup();
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    const pushState = vi.spyOn(history, "pushState");
    const replaceState = vi.spyOn(history, "replaceState");
    const xhrOpen = vi.spyOn(XMLHttpRequest.prototype, "open");
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<App />);
    await user.type(screen.getByLabelText("Your name"), "Private");
    await user.click(screen.getByRole("button", { name: "Start building" }));
    await user.click(screen.getByRole("button", { name: "Skip" }));

    expect(
      screen.getByRole("grid", { name: "Name outline for PRIVATE" }),
    ).toBeInTheDocument();
    const storedKeys = storageWrite.mock.calls.map(([key]) => key);
    if (storedKeys.length > 0) {
      expect([...storedKeys].sort()).toEqual([howItWorksSeenKey, playerNameKey].sort());
    }
    expect(localStorage.getItem(howItWorksSeenKey)).toBe("1");
    expect(localStorage.getItem(playerNameKey)).toBe("PRIVATE");
    expect(localStorage.length).toBe(2);
    for (let index = 0; index < localStorage.length; index += 1) {
      expect([howItWorksSeenKey, playerNameKey]).toContain(localStorage.key(index));
    }
    expect(pushState).not.toHaveBeenCalled();
    expect(replaceState).not.toHaveBeenCalled();
    expect(xhrOpen).not.toHaveBeenCalled();
    expect(window.location.href).not.toContain("PRIVATE");
    for (const logger of [consoleLog, consoleInfo, consoleWarn, consoleError]) {
      expect(logger).not.toHaveBeenCalled();
    }
  });
});
