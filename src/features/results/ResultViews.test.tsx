import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { playerTitles } from "../../game/config/titles";
import type { LossResult, RunResult } from "../../game/engine/result";
import { updateJuicePreferences } from "../juice/preferences";
import { resetParticles } from "../juice/particles";
import { LossScreen } from "./LossScreen";
import { SuccessScreen } from "./SuccessScreen";

const base = {
  name: "HARSH",
  completionRatio: 0.8,
  displayPercent: 80,
  score: 8_000,
  activeMilliseconds: 120_000,
  linesCleared: 10,
  level: 2,
  fourLineClears: 0,
  routedAttempts: 5,
  successfulStencilLocks: 4,
  canceledRoutes: 1,
  distinctStencilPieceTypes: 3,
  maximumBoardStackHeight: 10,
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
} as const;

describe("result views", () => {
  it.each([
    ["success", "Success display"],
    ["loss", "Loss display"],
  ] as const)("renders the %s view inside the shared cabinet", (view, displayLabel) => {
    const result =
      view === "success"
        ? ({ ...base, outcome: "won", title: playerTitles.blockPoet } as RunResult)
        : ({ ...base, outcome: "lost" } as LossResult);

    render(
      view === "success" ? (
        <SuccessScreen
          result={result as RunResult}
          onPlayAgain={vi.fn()}
          onNewName={vi.fn()}
        />
      ) : (
        <LossScreen
          result={result as LossResult}
          onPlayAgain={vi.fn()}
          onNewName={vi.fn()}
        />
      ),
    );

    expect(
      screen.getByRole("region", { name: "Nametris arcade cabinet" }),
    ).toBeVisible();
    expect(screen.getByRole("region", { name: displayLabel })).toBeVisible();

    const deck = screen.getByLabelText("Cabinet controls");
    expect(deck.querySelectorAll("kbd")).toHaveLength(8);
    expect(within(deck).queryAllByRole("button")).toHaveLength(0);
  });

  it("keeps every result action outside the success card", () => {
    const result: RunResult = {
      ...base,
      outcome: "won",
      title: playerTitles.blockPoet,
    };

    render(<SuccessScreen result={result} onPlayAgain={vi.fn()} onNewName={vi.fn()} />);
    const card = screen.getByRole("article", { name: "Nametris reward card" });

    for (const name of [
      "Play again",
      "Try another name",
      "Download card",
      "Copy result",
      "Share",
    ]) {
      const button = screen.getByRole("button", { name });
      expect(card.contains(button)).toBe(false);
    }
  });

  it("shows loss metrics without issuing a success title", async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    const onNewName = vi.fn();
    const result: LossResult = { ...base, outcome: "lost" };

    render(
      <LossScreen result={result} onPlayAgain={onPlayAgain} onNewName={onNewName} />,
    );

    expect(screen.getByRole("heading", { name: "STACK OVERFLOW" })).toBeVisible();
    expect(screen.getByText("HARSH")).toBeVisible();
    expect(screen.getByText("80%")).toBeVisible();
    expect(
      screen.getByRole("img", { name: "HARSH block composition at 80%" }),
    ).toBeVisible();
    expect(screen.getByText("Level").closest("div")).toHaveTextContent("Level2");
    expect(
      within(screen.getByRole("main")).queryByText(playerTitles.blockPoet),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Play again" }));
    await user.click(screen.getByRole("button", { name: "Try another name" }));
    expect(onPlayAgain).toHaveBeenCalledOnce();
    expect(onNewName).toHaveBeenCalledOnce();
  });

  it("drops at most sixty confetti squares above the actions", () => {
    resetParticles();
    const result: RunResult = {
      ...base,
      outcome: "won",
      title: playerTitles.blockPoet,
    };

    render(<SuccessScreen result={result} onPlayAgain={vi.fn()} onNewName={vi.fn()} />);

    expect(document.querySelectorAll(".speck").length).toBeLessThanOrEqual(60);
    expect(document.querySelectorAll(".speck").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("win-plaque")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play again" })).toBeVisible();
  });

  it("shows a gold name plaque when motion is reduced", () => {
    updateJuicePreferences({ reducedMotion: true });
    const result: RunResult = {
      ...base,
      outcome: "won",
      title: playerTitles.blockPoet,
    };

    render(<SuccessScreen result={result} onPlayAgain={vi.fn()} onNewName={vi.fn()} />);

    expect(screen.getByTestId("win-plaque")).toHaveTextContent("HARSH");
    expect(document.querySelector(".speck")).not.toBeInTheDocument();
    updateJuicePreferences({ reducedMotion: false });
  });
});
