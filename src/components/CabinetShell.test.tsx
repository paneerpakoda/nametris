import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CabinetShell } from "./CabinetShell";

describe("CabinetShell", () => {
  it("frames screen content and a control deck as one labelled machine", () => {
    render(
      <CabinetShell screenLabel="Welcome display" controlDeck={<p>Keyboard deck</p>}>
        <h1>NAMETRIS</h1>
      </CabinetShell>,
    );

    expect(
      screen.getByRole("region", { name: "Nametris arcade cabinet" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Welcome display" })).toContainElement(
      screen.getByRole("heading", { name: "NAMETRIS" }),
    );
    expect(screen.getByText("Keyboard deck")).toBeVisible();
    expect(screen.getByLabelText("Power on")).toBeInTheDocument();
  });
});
