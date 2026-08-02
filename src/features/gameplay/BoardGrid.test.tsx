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
      /ROUTE ZONE\s*TOP 7 ROWS · SHIFT/,
    );
    expect(screen.getByText("ROUTE DEADLINE")).toBeInTheDocument();
  });
});
