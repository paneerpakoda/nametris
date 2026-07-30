import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createBoardSession } from "../../game/engine/session";
import { createStencilState } from "../../game/engine/stencil";
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

  it("routes with N, shows stencil controls, and locks with Enter", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
      stencil: createStencilState(new Set(["0:0", "0:1", "1:0", "1:1"]), 2, 2),
    };

    render(<GameplayScreen initialSession={initialSession} />);
    const game = screen.getByRole("application", { name: "Nametris game" });

    fireEvent.keyDown(game, { key: "n" });

    expect(screen.getByText("PLACE THE O")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: "Name stencil for HARSH" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(game, { key: "Enter" });

    expect(screen.getByText("NAME COMPLETE")).toBeInTheDocument();
    expect(screen.getByTestId("transfers")).toHaveTextContent("0");
  });

  it("reports one frozen success result when a run is won", async () => {
    const onWon = vi.fn();
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
      stencil: createStencilState(new Set(["0:0", "0:1", "1:0", "1:1"]), 2, 2),
    };

    render(<GameplayScreen initialSession={initialSession} onWon={onWon} />);
    const game = screen.getByRole("application", { name: "Nametris game" });
    fireEvent.keyDown(game, { key: "n" });
    fireEvent.keyDown(game, { key: "Enter" });

    await waitFor(() => expect(onWon).toHaveBeenCalledOnce());
    expect(onWon.mock.calls[0]?.[0]).toMatchObject({
      outcome: "won",
      name: "HARSH",
      displayPercent: 100,
    });
  });

  it("reports loss without creating a success title", async () => {
    const onLost = vi.fn();
    const initialSession = {
      ...createBoardSession(["O", "I"]),
      phase: "lost" as const,
    };

    render(<GameplayScreen initialSession={initialSession} onLost={onLost} />);

    await waitFor(() => expect(onLost).toHaveBeenCalledOnce());
    expect(onLost.mock.calls[0]?.[0]).not.toHaveProperty("title");
  });

  it("offers a real route button only when the piece is eligible", async () => {
    const user = userEvent.setup();
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
    };

    render(<GameplayScreen initialSession={initialSession} />);
    const routeButton = screen.getByRole("button", { name: "Route O to stencil" });

    expect(routeButton).toBeEnabled();
    await user.click(routeButton);
    expect(screen.getByText("PLACE THE O")).toBeInTheDocument();
  });
});
