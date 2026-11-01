import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

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
    expect(screen.getByText("Your name stays on this device.")).toBeInTheDocument();
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
});
