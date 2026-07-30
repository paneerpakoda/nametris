import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("renders the Nametris welcome shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "NAMETRIS" })).toBeInTheDocument();
    expect(screen.getByText("Your name stays on this device.")).toBeInTheDocument();
  });

  it("starts a playable board from the welcome action", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start building" }));

    expect(
      screen.getByRole("grid", { name: "Normal Tetris board" }),
    ).toBeInTheDocument();
  });
});
