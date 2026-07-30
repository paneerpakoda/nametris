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
      screen.getByRole("grid", { name: "Name stencil for HARSH" }),
    ).toHaveAttribute("aria-colcount", "2");
    expect(screen.getAllByTestId("stencil-cell")).toHaveLength(4);
    expect(screen.getAllByTestId("stencil-cell")[0]).toHaveAttribute(
      "data-status",
      "preview-valid",
    );
  });

  it("distinguishes cells that will stay from cells that will be trimmed", () => {
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
        .filter((cell) => cell.dataset.status === "preview-trimmed"),
    ).toHaveLength(3);
  });
});
