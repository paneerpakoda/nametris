import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createEmptyBoard } from "../../game/engine/board";
import { BoardGrid } from "./BoardGrid";

describe("BoardGrid", () => {
  it("shows the seven-row routing zone and its deadline", () => {
    const activePiece = {
      type: "O" as const,
      rotation: 0 as const,
      row: 0,
      column: 3,
    };

    render(
      <BoardGrid
        board={createEmptyBoard()}
        activePiece={activePiece}
        ghostPiece={{ ...activePiece, row: 20 }}
      />,
    );

    expect(screen.getByTestId("route-zone-label")).toHaveTextContent(
      /SEND ZONE\s*TOP 7 ROWS · SHIFT/,
    );
    expect(screen.getByText("SEND LINE")).toBeInTheDocument();
  });

  it("shows a wider sweep tier and the triple word without covering input", () => {
    const activePiece = {
      type: "T" as const,
      rotation: 0 as const,
      row: 0,
      column: 3,
    };

    render(
      <BoardGrid
        board={createEmptyBoard()}
        activePiece={activePiece}
        ghostPiece={{ ...activePiece, row: 18 }}
        clearedRows={[16, 17, 18]}
        clearing
      />,
    );

    const sweeps = screen.getAllByTestId("cleared-row");
    expect(sweeps).toHaveLength(3);
    expect(sweeps[0]).toHaveAttribute("data-tier", "3");
    expect(sweeps[0]).toHaveClass("clear-row");
    expect(screen.getByTestId("clear-word")).toHaveTextContent("TRIPLE");
  });

  it("greys every visible row and keeps the word when motion is reduced", () => {
    const activePiece = {
      type: "O" as const,
      rotation: 0 as const,
      row: 0,
      column: 4,
    };

    render(
      <BoardGrid
        board={createEmptyBoard()}
        activePiece={activePiece}
        ghostPiece={activePiece}
        clearedRows={[17, 18, 19]}
        reducedMotion
        lossGrey="instant"
      />,
    );

    expect(screen.queryByTestId("cleared-row")).not.toBeInTheDocument();
    expect(screen.getByTestId("clear-word")).toHaveTextContent("TRIPLE");
    expect(screen.getAllByTestId("grey-row")).toHaveLength(20);
    expect(screen.getAllByTestId("grey-row")[0]).toHaveClass("is-static");
  });
});
