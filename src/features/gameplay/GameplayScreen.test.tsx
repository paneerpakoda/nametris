import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createBoardSession } from "../../game/engine/session";
import { createStencilState } from "../../game/engine/stencil";
import { BOARD_HEIGHT } from "../../game/engine/board";
import { GameplayScreen } from "./GameplayScreen";

describe("GameplayScreen", () => {
  it("hard drops the active piece from the focused game surface", () => {
    render(<GameplayScreen seed={7} />);
    const game = screen.getByRole("application", { name: "Nametris game" });

    fireEvent.keyDown(game, { key: " " });

    expect(Number(screen.getByTestId("score").textContent)).toBeGreaterThan(0);
  });

  it("shows active playtime as a normal metric", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T"]),
      activeMilliseconds: 125_000,
    };

    render(<GameplayScreen initialSession={initialSession} />);

    expect(screen.getByTestId("active-time")).toHaveTextContent("02:05");
  });

  it("announces a line clear and the earned credit", () => {
    const session = createBoardSession(["I", "O", "T"]);
    const board = session.board.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex === BOARD_HEIGHT - 1 && columnIndex !== 5 ? "J" : cell,
      ),
    );
    const initialSession = {
      ...session,
      board,
      activePiece: {
        type: "I" as const,
        rotation: 1 as const,
        row: 0,
        column: 3,
      },
    };

    render(<GameplayScreen initialSession={initialSession} />);
    fireEvent.keyDown(screen.getByRole("application"), { key: " " });

    expect(screen.getByTestId("transfers")).toHaveTextContent("1");
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 line cleared. 1 credit earned.",
    );
  });

  it("pauses and resumes from real buttons", async () => {
    const user = userEvent.setup();
    render(<GameplayScreen seed={7} />);

    await user.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.getByText("Game paused")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume game" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Resume game" }));
    expect(screen.queryByText("Game paused")).not.toBeInTheDocument();
    expect(screen.getByRole("application", { name: "Nametris game" })).toHaveFocus();
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

  it("pauses and resumes the exact stencil placement", async () => {
    const user = userEvent.setup();
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
      stencil: createStencilState(new Set(["0:0", "0:1", "1:0", "1:1"]), 2, 2),
    };

    render(<GameplayScreen initialSession={initialSession} />);
    const game = screen.getByRole("application", { name: "Nametris game" });
    fireEvent.keyDown(game, { key: "n" });

    await user.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.getByText("Game paused")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume game" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Resume game" }));
    expect(screen.getByText("PLACE THE O")).toBeInTheDocument();
    expect(screen.getByTestId("transfers")).toHaveTextContent("1");
    expect(game).toHaveFocus();
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
    const routeButton = screen.getByRole("button", {
      name: "Route O to stencil using 1 credit",
    });

    expect(routeButton).toBeEnabled();
    await user.click(routeButton);
    expect(screen.getByText("PLACE THE O")).toBeInTheDocument();
  });

  it("routes with N even when focus is on a control outside the game surface", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
      activePiece: {
        type: "O" as const,
        rotation: 0 as const,
        row: 8,
        column: 3,
      },
    };

    render(<GameplayScreen initialSession={initialSession} />);
    const pause = screen.getByRole("button", { name: "Pause game" });
    pause.focus();
    fireEvent.keyDown(pause, { key: "n" });

    expect(screen.getByText("PLACE THE O")).toBeInTheDocument();
  });

  it("enables finish at exact 80% without interrupting board input", async () => {
    const user = userEvent.setup();
    const onWon = vi.fn();
    const mask = new Set(Array.from({ length: 20 }, (_, index) => `0:${index}`));
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      canFinish: true,
      stencil: {
        ...createStencilState(mask, 1, 20),
        filledCells: new Map(
          Array.from({ length: 16 }, (_, index) => [`0:${index}`, "I"] as const),
        ),
      },
    };

    render(<GameplayScreen initialSession={initialSession} onWon={onWon} />);
    const game = screen.getByRole("application", { name: "Nametris game" });
    const finish = screen.getByRole("button", { name: "FINISH AT 80%" });

    fireEvent.keyDown(game, { key: " " });
    expect(Number(screen.getByTestId("score").textContent)).toBeGreaterThan(0);
    expect(finish).toBeEnabled();

    await user.click(finish);
    await waitFor(() => expect(onWon).toHaveBeenCalledOnce());
    expect(onWon.mock.calls[0]?.[0]).toMatchObject({ displayPercent: 80 });
  });
});
