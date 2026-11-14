import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  getJuicePreferences,
  updateJuicePreferences,
} from "../features/juice/preferences";

import { playerTitles } from "../game/config/titles";
import type { RunResult } from "../game/engine/result";
import { App } from "./App";

const result: RunResult = {
  outcome: "won",
  name: "HARSH",
  completionRatio: 0.8,
  displayPercent: 80,
  score: 8_000,
  activeMilliseconds: 120_000,
  title: playerTitles.blockPoet,
  linesCleared: 8,
  level: 1,
  fourLineClears: 0,
  routedAttempts: 5,
  successfulStencilLocks: 4,
  canceledRoutes: 0,
  distinctStencilPieceTypes: 3,
  maximumBoardStackHeight: 8,
  stencilCellsFilled: 4,
  stencil: {
    rows: 1,
    columns: 5,
    mask: ["0:0", "0:1", "0:2", "0:3", "0:4"],
    filledCells: [
      ["0:0", "I"],
      ["0:1", "I"],
      ["0:2", "I"],
      ["0:3", "I"],
    ],
  },
};

describe("App", () => {
  it("renders the Nametris welcome shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "NAMETRIS" })).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
  });

  it("shows how it works on the first start, then a playable board", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Your name"), "JO");
    await user.click(screen.getByRole("button", { name: "Start building" }));
    expect(
      screen.getByRole("heading", { name: "Fill your name to 80% to win." }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Skip" }));

    expect(
      screen.getByRole("grid", { name: "Normal Tetris board" }),
    ).toBeInTheDocument();
  });

  it("replays a completed run with the same in-memory name", async () => {
    const user = userEvent.setup();
    render(<App initialOutcome={result} />);

    await user.click(screen.getByRole("button", { name: "Play again" }));

    expect(
      screen.getByRole("grid", { name: "Name outline for HARSH" }),
    ).toBeInTheDocument();
  });

  it("forgets the active name when returning to onboarding", async () => {
    const user = userEvent.setup();
    render(<App initialOutcome={result} />);

    await user.click(screen.getByRole("button", { name: "Try another name" }));

    expect(screen.getByRole("heading", { name: "NAMETRIS" })).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toHaveValue("");
  });

  it("keeps the name on this device and fills it in next time", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Your name"), "JO");
    await user.click(screen.getByRole("button", { name: "Start building" }));
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await user.click(screen.getByRole("button", { name: "Pause game" }));
    await user.click(screen.getByRole("button", { name: "Quit to title screen" }));

    expect(screen.getByLabelText("Your name")).toHaveValue("JO");
  });

  it("uses the address seed for every run in the visit", async () => {
    window.history.pushState(null, "", "/?seed=20260730");
    const random = vi.spyOn(Math, "random").mockReturnValue(0.9);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Your name"), "JO");
    await user.click(screen.getByRole("button", { name: "Start building" }));
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await user.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.getByTestId("run-seed")).toHaveTextContent("Seed 20260730");

    await user.click(screen.getByRole("button", { name: "Restart run" }));
    await user.click(screen.getByRole("button", { name: "Yes" }));
    await user.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.getByTestId("run-seed")).toHaveTextContent("Seed 20260730");
    expect(window.location.href).not.toContain("JO");
    random.mockRestore();
  });

  it("draws a different seed for the next run when the address has none", async () => {
    const random = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.4);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Your name"), "JO");
    await user.click(screen.getByRole("button", { name: "Start building" }));
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await user.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.getByTestId("run-seed")).toHaveTextContent("Seed 200000000");

    await user.click(screen.getByRole("button", { name: "Restart run" }));
    await user.click(screen.getByRole("button", { name: "Yes" }));
    await user.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.getByTestId("run-seed")).toHaveTextContent("Seed 400000000");
    random.mockRestore();
  });

  it("shows how it works again on the next start after quitting", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Your name"), "JO");
    await user.click(screen.getByRole("button", { name: "Start building" }));
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await user.click(screen.getByRole("button", { name: "Pause game" }));
    await user.click(screen.getByRole("button", { name: "Quit to title screen" }));
    await user.click(screen.getByRole("button", { name: "Start building" }));

    expect(
      screen.getByRole("heading", { name: "Fill your name to 80% to win." }),
    ).toBeVisible();
  });

  it("clears saved data from the welcome reset and leaves cancel alone", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Your name"), "JO");
    await user.click(screen.getByRole("button", { name: "Start building" }));
    await user.click(screen.getByRole("button", { name: "Skip" }));
    updateJuicePreferences({ muted: true });
    await user.click(screen.getByRole("button", { name: "Pause game" }));
    await user.click(screen.getByRole("button", { name: "Quit to title screen" }));

    expect(localStorage.getItem("nametris.playerName")).toBe("JO");
    expect(localStorage.getItem("nametris.howItWorksSeen")).toBe("1");
    expect(getJuicePreferences().muted).toBe(true);

    await user.click(screen.getByRole("button", { name: "Reset game" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reset game" })).toHaveFocus(),
    );
    expect(localStorage.getItem("nametris.playerName")).toBe("JO");
    expect(getJuicePreferences().muted).toBe(true);

    await user.click(screen.getByRole("button", { name: "Reset game" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Reset" })).toHaveFocus(),
    );
    await user.keyboard("{Enter}");

    expect(localStorage.getItem("nametris.playerName")).toBeNull();
    expect(localStorage.getItem("nametris.howItWorksSeen")).toBeNull();
    expect(localStorage.getItem("nametris.juice")).toBeNull();
    expect(
      [...Array(localStorage.length)].every(
        (_, index) => !localStorage.key(index)?.startsWith("nametris."),
      ),
    ).toBe(true);
    expect(screen.getByLabelText("Your name")).toHaveValue("");
    expect(getJuicePreferences().muted).toBe(false);
    expect(screen.queryByText(/Run over|STACK OVERFLOW/)).not.toBeInTheDocument();
  });

  it("resets a paused run back to welcome without a loss screen", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Your name"), "JO");
    await user.click(screen.getByRole("button", { name: "Start building" }));
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await user.click(screen.getByRole("button", { name: "Pause game" }));
    await user.click(screen.getByRole("button", { name: "Reset game" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Your name")).toHaveValue("");
    expect(screen.queryByRole("heading", { name: "Run over" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "STACK OVERFLOW" }),
    ).not.toBeInTheDocument();
  });
});
