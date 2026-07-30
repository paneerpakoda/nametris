import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";

describe("player-name privacy boundary", () => {
  it("keeps a custom name out of storage, URLs, logs, and requests", async () => {
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
    await user.type(screen.getByLabelText("Your name (optional)"), "Private");
    await user.click(screen.getByRole("button", { name: "Start building" }));

    expect(
      screen.getByRole("grid", { name: "Name stencil for PRIVATE" }),
    ).toBeInTheDocument();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(pushState).not.toHaveBeenCalled();
    expect(replaceState).not.toHaveBeenCalled();
    expect(xhrOpen).not.toHaveBeenCalled();
    expect(window.location.href).not.toContain("PRIVATE");
    for (const logger of [consoleLog, consoleInfo, consoleWarn, consoleError]) {
      expect(logger).not.toHaveBeenCalled();
    }
  });
});
