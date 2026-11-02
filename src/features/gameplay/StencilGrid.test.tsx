import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createStencilState } from "../../game/engine/stencil";
import { StencilGrid } from "./StencilGrid";

const squareMask = new Set(["0:0", "0:1", "1:0", "1:1"]);

describe("StencilGrid", () => {
  it("renders the exact mask and a legal active-piece preview", () => {
    const stencil = createStencilState(squareMask, 2, 2);

    render(
      <StencilGrid
        name="HARSH"
        stencil={stencil}
        activePiece={{ type: "O", rotation: 0, row: 0, column: -1 }}
      />,
    );

    expect(
      screen.getByRole("grid", { name: "Name outline for HARSH" }),
    ).toHaveAttribute("aria-colcount", "2");
    expect(screen.getAllByTestId("stencil-cell")).toHaveLength(4);
    expect(screen.getAllByTestId("stencil-cell")[0]).toHaveAttribute(
      "data-status",
      "preview-valid",
    );
  });

  it("flies the locked piece and keeps a finished letter brighter", () => {
    const stencil = createStencilState(new Set(["0:0", "0:1"]), 1, 6);

    render(
      <StencilGrid
        name="A"
        stencil={stencil}
        activePiece={null}
        brightLetters={new Set([0])}
        flashLetters={new Set([0])}
        fly={{
          id: 1,
          piece: { type: "O", rotation: 0, row: 0, column: 0 },
          kept: new Set(["0:0"]),
          lost: new Set(["0:1"]),
        }}
      />,
    );

    expect(screen.getByTestId("piece-fly")).toBeInTheDocument();
    expect(document.querySelectorAll(".is-letter-done")).toHaveLength(2);
    expect(document.querySelectorAll(".is-letter-flash")).toHaveLength(2);
    expect(document.querySelectorAll(".fly-cell").length).toBeGreaterThan(0);
  });

  it("distinguishes cells that will stay from cells that will be lost", () => {
    const stencil = createStencilState(new Set(["0:0"]), 2, 2);

    render(
      <StencilGrid
        name="HARSH"
        stencil={stencil}
        activePiece={{ type: "O", rotation: 0, row: 0, column: -1 }}
      />,
    );

    expect(
      screen
        .getAllByTestId("stencil-cell")
        .filter((cell) => cell.dataset.status === "preview-valid"),
    ).toHaveLength(1);
    expect(
      screen
        .getAllByTestId("stencil-cell")
        .filter((cell) => cell.dataset.status === "preview-lost"),
    ).toHaveLength(3);
  });
});
