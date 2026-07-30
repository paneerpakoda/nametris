import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { playerTitles } from "../../game/config/titles";
import type { RunResult } from "../../game/engine/result";
import { RewardCard } from "./RewardCard";

const result = {
  outcome: "won",
  name: "HARSH",
  completionRatio: 1,
  displayPercent: 100,
  score: 22_000,
  activeMilliseconds: 182_000,
  title: playerTitles.crownedBlocksmith,
  linesCleared: 20,
  level: 3,
  fourLineClears: 1,
  routedAttempts: 5,
  successfulStencilLocks: 5,
  canceledRoutes: 0,
  distinctStencilPieceTypes: 5,
  maximumBoardStackHeight: 9,
  stencilCellsFilled: 4,
  stencil: {
    rows: 1,
    columns: 4,
    mask: ["0:0", "0:1", "0:2", "0:3"],
    filledCells: [
      ["0:0", "I"],
      ["0:1", "I"],
      ["0:2", "I"],
      ["0:3", "I"],
    ],
  },
} satisfies RunResult;

describe("RewardCard", () => {
  it("contains the earned artifact content and no action controls", () => {
    render(<RewardCard result={result} reducedMotion={false} />);
    const card = screen.getByRole("article", { name: "Nametris reward card" });

    expect(card).toHaveTextContent("NAMETRIS");
    expect(card).toHaveTextContent("HARSH");
    expect(card).toHaveTextContent("Crowned Blocksmith");
    expect(card).toHaveTextContent("22,000");
    expect(card).toHaveTextContent("03:02");
    expect(card).toHaveTextContent("PERFECT · 100%");
    expect(card.querySelector("button")).toBeNull();
    expect(card).toHaveAttribute("data-motion", "interactive");
  });

  it("uses a static premium state for reduced motion", () => {
    render(<RewardCard result={result} reducedMotion />);
    const card = screen.getByRole("article", { name: "Nametris reward card" });

    fireEvent.pointerMove(card, { clientX: 1, clientY: 1 });

    expect(card).toHaveAttribute("data-motion", "static");
    expect(card).toHaveStyle({ "--shine-x": "50%", "--shine-y": "50%" });
  });
});
