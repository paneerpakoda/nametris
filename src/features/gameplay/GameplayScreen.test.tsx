import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { GameplayScreen } from "./GameplayScreen";

describe("GameplayScreen", () => {
  it("hard drops the active piece from the focused game surface", () => {
    render(<GameplayScreen seed={7} />);
    const game = screen.getByRole("application", { name: "Nametris game" });

    fireEvent.keyDown(game, { key: " " });

    expect(Number(screen.getByTestId("score").textContent)).toBeGreaterThan(0);
  });

  it("pauses and resumes from real buttons", async () => {
    const user = userEvent.setup();
    render(<GameplayScreen seed={7} />);

    await user.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.getByText("Game paused")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Resume game" }));
    expect(screen.queryByText("Game paused")).not.toBeInTheDocument();
  });
});
