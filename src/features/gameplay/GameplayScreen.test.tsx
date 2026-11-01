import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createBoardSession } from "../../game/engine/session";
import { createStencilState } from "../../game/engine/stencil";
import { BOARD_HEIGHT } from "../../game/engine/board";
import { GameplayScreen } from "./GameplayScreen";

describe("GameplayScreen", () => {
  it("renders the game inside the cabinet with a live three-arrow transfer rail", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T"]),
      transferCount: 2,
    };

    render(<GameplayScreen initialSession={initialSession} />);

    expect(
      screen.getByRole("region", { name: "Nametris arcade cabinet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Gameplay display" }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("transfer-arrow")).toHaveLength(3);
    expect(
      screen.getAllByTestId("transfer-arrow").map((arrow) => arrow.dataset.status),
    ).toEqual(["stored", "stored", "empty"]);
  });

  it("hard drops through the cabinet deck and restores game focus", async () => {
    const user = userEvent.setup();
    render(<GameplayScreen seed={7} />);
    const game = screen.getByRole("application", { name: "Nametris game" });

    await user.click(screen.getByRole("button", { name: "Hard drop" }));

    expect(Number(screen.getByTestId("score").textContent)).toBeGreaterThan(0);
    expect(game).toHaveAttribute("data-impact", "a");
    await waitFor(() => expect(game).toHaveFocus());
  });

  it("hard drops the active piece and retriggers a subtle surface impact", () => {
    render(<GameplayScreen seed={7} />);
    const game = screen.getByRole("application", { name: "Nametris game" });

    expect(game).toHaveAttribute("data-impact", "idle");
    fireEvent.keyDown(game, { key: " " });

    expect(Number(screen.getByTestId("score").textContent)).toBeGreaterThan(0);
    expect(game).toHaveAttribute("data-impact", "a");

    fireEvent.keyDown(game, { key: " " });

    expect(game).toHaveAttribute("data-impact", "b");
  });

  it("shows active playtime as a normal metric", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T"]),
      activeMilliseconds: 125_000,
    };

    render(<GameplayScreen initialSession={initialSession} />);

    expect(screen.getByTestId("active-time")).toHaveTextContent("02:05");
  });

  it("announces a line clear and the earned transfer", () => {
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
      "1 line cleared. 1 name piece earned.",
    );
    const feedback = screen.getByTestId("line-clear-feedback");
    expect(feedback).toHaveAttribute("data-kind", "earned");
    expect(
      screen.getByRole("grid", { name: "Normal Tetris board" }).closest(".board-panel"),
    ).toContainElement(feedback);
    expect(
      screen.getByRole("complementary", {
        name: "Name pieces and next piece",
      }),
    ).not.toContainElement(feedback);
    expect(screen.getByText("1 ROW CLEARED")).toBeVisible();
    expect(screen.getByText("+1 NAME PIECE · 1/3")).toBeVisible();
    expect(screen.getByTestId("score-delta")).toHaveTextContent(
      `+${screen.getByTestId("score").textContent}`,
    );
    expect(screen.getByTestId("cleared-row")).toBeInTheDocument();
    expect(screen.getByTestId("name-piece-token")).toBeInTheDocument();
    expect(document.querySelector(".board-frame")).toHaveClass("is-clear-pulse");
    expect(document.querySelector(".metric.is-score-pop")).toBeTruthy();
    expect(document.querySelector(".board-cell.is-drop-trail")).toBeTruthy();
  });

  it("announces that a full transfer bank cannot store another clear", () => {
    const session = createBoardSession(["I", "O", "T"]);
    const board = session.board.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex === BOARD_HEIGHT - 1 && columnIndex !== 5 ? "J" : cell,
      ),
    );
    const initialSession = {
      ...session,
      board,
      transferCount: 3,
      activePiece: {
        type: "I" as const,
        rotation: 1 as const,
        row: 0,
        column: 3,
      },
    };

    render(<GameplayScreen initialSession={initialSession} />);
    fireEvent.keyDown(screen.getByRole("application"), { key: " " });

    expect(screen.getByTestId("transfers")).toHaveTextContent("3 / 3");
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 line cleared. 1 name piece lost because you already have 3. Use Shift before your next clear.",
    );
    const feedback = screen.getByTestId("line-clear-feedback");
    expect(feedback).toHaveAttribute("data-kind", "wasted");
    expect(
      screen.getByRole("grid", { name: "Normal Tetris board" }).closest(".board-panel"),
    ).toContainElement(feedback);
    expect(
      screen.getByRole("complementary", {
        name: "Name pieces and next piece",
      }),
    ).not.toContainElement(feedback);
    expect(screen.getByText("1 ROW CLEARED")).toBeVisible();
    expect(screen.getByText("NAME PIECE LOST · FULL · USE SHIFT")).toBeVisible();
  });

  it("pauses and resumes from real buttons", async () => {
    const user = userEvent.setup();
    render(<GameplayScreen seed={7} />);

    await user.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.getByText("Game paused")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Resume game" }));
    expect(screen.queryByText("Game paused")).not.toBeInTheDocument();
  });

  it("traps pause focus and restores the game after a keyboard resume", async () => {
    const user = userEvent.setup();
    render(<GameplayScreen seed={7} />);
    const game = screen.getByRole("application", { name: "Nametris game" });

    await user.click(screen.getByRole("button", { name: "Pause game" }));
    const resume = screen.getByRole("button", { name: "Resume game" });
    expect(screen.getByRole("dialog", { name: "Game paused" })).toContainElement(
      resume,
    );
    await waitFor(() => expect(resume).toHaveFocus());

    await user.tab();
    expect(screen.getByRole("button", { name: "Restart run" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(resume).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "How to play" })).toHaveFocus();

    await user.keyboard("p");
    await waitFor(() =>
      expect(screen.queryByText("Game paused")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(game).toHaveFocus());
  });

  it("pauses for controls help and resumes the exact placement mode", async () => {
    const user = userEvent.setup();
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
    };

    render(<GameplayScreen initialSession={initialSession} />);
    const game = screen.getByRole("application", { name: "Nametris game" });
    fireEvent.keyDown(game, { key: "Shift" });

    await user.click(screen.getByRole("button", { name: "Open controls help" }));
    expect(
      screen.getByRole("dialog", { name: "How to play Nametris" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Resume game" }));
    expect(
      screen.queryByRole("dialog", { name: "How to play Nametris" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("PLACE THE O")).toBeInTheDocument();
  });

  it("routes with Shift, shows stencil controls, and locks with Enter", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
      stencil: createStencilState(new Set(["0:0", "0:1", "1:0", "1:1"]), 2, 2),
    };

    render(<GameplayScreen initialSession={initialSession} />);
    const game = screen.getByRole("application", { name: "Nametris game" });

    fireEvent.keyDown(game, { key: "Shift" });

    expect(screen.getByText("PLACE THE O")).toBeInTheDocument();
    expect(
      screen.getByRole("grid", { name: "Name outline for HARSH" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(game, { key: "Enter" });

    expect(screen.getByText("NAME COMPLETE")).toBeInTheDocument();
    expect(screen.getByTestId("transfers")).toHaveTextContent("0");
  });

  it("locks the usable part of a piece and explains what will be lost", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
      stencil: createStencilState(new Set(["0:0"]), 2, 2),
    };

    render(<GameplayScreen initialSession={initialSession} />);
    const game = screen.getByRole("application", { name: "Nametris game" });

    fireEvent.keyDown(game, { key: "Shift" });

    expect(screen.getByText("1 kept, 3 lost")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "LOCK · ENTER" })).toBeEnabled();

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
    fireEvent.keyDown(game, { key: "Shift" });
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
    const routeButton = screen.getByRole("button", { name: "Send O" });

    expect(routeButton).toBeEnabled();
    await user.click(routeButton);
    expect(screen.getByText("PLACE THE O")).toBeInTheDocument();
  });

  it("persistently highlights a full transfer bank and directs play to NAME", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 3,
    };

    render(<GameplayScreen initialSession={initialSession} />);

    expect(screen.getByTestId("transfer-metric")).toHaveAttribute(
      "data-status",
      "full",
    );
    expect(screen.getByTestId("transfers")).toHaveTextContent("3 / 3");
    expect(screen.getByText("FULL")).toBeVisible();
    expect(screen.getByTestId("route-zone-label")).toHaveTextContent(
      /SLOW ZONE\s*FULL BANK · 50%/,
    );
    expect(screen.getByText("NAME PIECES FULL · SEND ONE")).toBeVisible();
    expect(screen.getByText("Extra line clears cannot add name pieces.")).toBeVisible();
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
    const finish = screen.getByRole("button", { name: "FINISH NAME · 80%" });
    expect(
      screen.getByRole("progressbar", { name: "Name completion" }),
    ).toHaveAttribute("aria-valuetext", "80% complete. Finish unlocks at 80%.");
    expect(screen.getByRole("dialog", { name: "80% reached" })).toBeInTheDocument();

    fireEvent.keyDown(game, { key: "ArrowDown" });
    expect(screen.getByTestId("score").textContent).toBe("0");
    fireEvent.keyDown(game, { key: " " });
    expect(Number(screen.getByTestId("score").textContent)).toBeGreaterThan(0);
    expect(finish).toBeEnabled();

    await user.click(finish);
    await waitFor(() => expect(onWon).toHaveBeenCalledOnce());
    expect(onWon.mock.calls[0]?.[0]).toMatchObject({ displayPercent: 80 });
  });

  it("explains Shift when there are no name pieces yet", () => {
    render(<GameplayScreen seed={7} />);

    expect(screen.getByRole("button", { name: "Clear a row first" })).toBeEnabled();
    fireEvent.keyDown(screen.getByRole("application"), { key: "Shift" });

    expect(screen.getByTestId("empty-send-notice")).toHaveTextContent(
      "No name pieces yet. Clear a row first.",
    );
    expect(screen.getByTestId("empty-send-notice")).toHaveClass("is-flash");
  });

  it("finishes from the 80% prompt, including while placing a name piece", async () => {
    const onWon = vi.fn();
    const mask = new Set(Array.from({ length: 20 }, (_, index) => `0:${index}`));
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      canFinish: true,
      transferCount: 1,
      stencil: {
        ...createStencilState(mask, 1, 20),
        filledCells: new Map(
          Array.from({ length: 16 }, (_, index) => [`0:${index}`, "I"] as const),
        ),
      },
    };

    render(
      <GameplayScreen
        initialSession={{
          ...initialSession,
          phase: "placing-stencil",
          stencilPiece: { type: "O", row: 0, column: 0, rotation: 0 },
        }}
        onWon={onWon}
      />,
    );
    expect(screen.getByText("PLACE THE O")).toBeInTheDocument();
    expect(screen.getByTestId("finish-banner")).toHaveTextContent("80% reached");

    fireEvent.keyDown(window, { key: "Enter" });

    await waitFor(() => expect(onWon).toHaveBeenCalledOnce());
    expect(onWon.mock.calls[0]?.[0]).toMatchObject({ displayPercent: 80 });
    expect(screen.getByTestId("transfers")).toHaveTextContent("1");
  });

  it("lets the player keep going after 80% and leaves the banner up", () => {
    const onWon = vi.fn();
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      canFinish: true,
    };

    render(<GameplayScreen initialSession={initialSession} onWon={onWon} />);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(
      screen.queryByRole("dialog", { name: "80% reached" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("finish-banner")).toBeInTheDocument();
    expect(onWon).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "FINISH NAME · 0%" })).toBeEnabled();
  });

  it("shows the remaining think time beside the piece", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
    };

    render(<GameplayScreen initialSession={initialSession} />);
    fireEvent.keyDown(screen.getByRole("application"), { key: "Shift" });

    const meter = screen.getByRole("meter", { name: "Think time" });
    expect(meter).toHaveAttribute("aria-valuemax", "5000");
    expect(Number(meter.getAttribute("aria-valuenow"))).toBeGreaterThan(0);
    expect(Number(meter.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(5000);
  });

  it("asks before restarting, resumes on Escape, and can leave for a new name", async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();
    const onNewName = vi.fn();
    render(
      <GameplayScreen seed={20260730} onRestart={onRestart} onNewName={onNewName} />,
    );

    await user.click(screen.getByRole("button", { name: "Pause game" }));
    expect(screen.getByTestId("run-seed")).toHaveTextContent("Seed 20260730");
    await user.click(screen.getByRole("button", { name: "Restart run" }));
    expect(
      screen.getByRole("dialog", { name: "End this run and start again?" }),
    ).toBeVisible();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("Game paused")).not.toBeInTheDocument();
    expect(onRestart).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Pause game" }));
    await user.click(screen.getByRole("button", { name: "Restart run" }));
    await user.click(screen.getByRole("button", { name: "No" }));
    expect(screen.getByRole("dialog", { name: "Game paused" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "How to play" }));
    expect(screen.getByRole("dialog", { name: "How to play Nametris" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Resume game" }));

    await user.click(screen.getByRole("button", { name: "Pause game" }));
    await user.click(screen.getByRole("button", { name: "Restart run" }));
    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(onRestart).toHaveBeenCalledOnce();
    fireEvent.keyDown(window, { key: "Escape" });

    await user.click(screen.getByRole("button", { name: "Pause game" }));
    await user.click(screen.getByRole("button", { name: "New name" }));
    expect(onNewName).toHaveBeenCalledOnce();
  });

  it("keeps moving when a cabinet button has focus and warns before unload", () => {
    render(<GameplayScreen seed={7} />);
    screen.getByRole("button", { name: "Move left" }).focus();
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(screen.getByTestId("score").textContent).toBe("1");

    const leaving = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(leaving);
    expect(leaving.defaultPrevented).toBe(true);
  });

  it("does not warn before unload after the run is over", () => {
    render(
      <GameplayScreen
        initialSession={{ ...createBoardSession(["O", "I"]), phase: "lost" }}
      />,
    );

    const leaving = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(leaving);
    expect(leaving.defaultPrevented).toBe(false);
  });

  it("does not warn that a fresh piece is too high", () => {
    render(<GameplayScreen seed={7} />);

    expect(screen.queryByTestId("too-high")).not.toBeInTheDocument();
  });

  it("warns when the ghost would lock in the top two rows", () => {
    const session = createBoardSession(["T", "O", "I"]);
    const board = session.board.map((row, rowIndex) =>
      row.map(() => (rowIndex === 4 ? "J" : null)),
    );

    render(
      <GameplayScreen
        initialSession={{
          ...session,
          board,
          activePiece: { type: "T", rotation: 0, row: 2, column: 3 },
        }}
      />,
    );

    expect(screen.getByTestId("too-high")).toHaveTextContent("TOO HIGH");
    expect(document.querySelector(".too-high-wash")).toBeTruthy();
  });

  it("pops the name cells that just locked", () => {
    const initialSession = {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
      stencil: createStencilState(new Set(["0:0", "0:1", "1:0", "1:1"]), 2, 2),
    };

    render(<GameplayScreen initialSession={initialSession} />);
    const game = screen.getByRole("application", { name: "Nametris game" });
    fireEvent.keyDown(game, { key: "Shift" });
    fireEvent.keyDown(game, { key: "Enter" });

    expect(
      screen.getAllByTestId("stencil-cell").some((cell) => cell.dataset.pop === "new"),
    ).toBe(true);
  });

  it("flashes a soft lock and then drops the row message", () => {
    vi.useFakeTimers();
    const session = createBoardSession(["O", "I", "T"]);
    render(
      <GameplayScreen
        initialSession={{
          ...session,
          activePiece: { type: "O", rotation: 0, row: 20, column: 3 },
          lockAccumulatorMilliseconds: 499,
        }}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(document.querySelector(".board-cell.is-lock-flash")).not.toBeNull();
    expect(document.querySelector(".board-cell.is-drop-trail")).toBeNull();

    const clearSession = createBoardSession(["I", "O", "T"]);
    const board = clearSession.board.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex === BOARD_HEIGHT - 1 && columnIndex !== 5 ? "J" : cell,
      ),
    );
    render(
      <GameplayScreen
        initialSession={{
          ...clearSession,
          board,
          activePiece: { type: "I", rotation: 1, row: 0, column: 3 },
        }}
      />,
    );
    const games = screen.getAllByRole("application");
    const clearingGame = games[1];
    expect(clearingGame).toBeDefined();
    fireEvent.keyDown(clearingGame as HTMLElement, { key: " " });
    expect(screen.getAllByText("1 ROW CLEARED").length).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(screen.queryByText("1 ROW CLEARED")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not move the piece while help is open", async () => {
    const user = userEvent.setup();
    render(<GameplayScreen seed={7} />);

    await user.click(screen.getByRole("button", { name: "Open controls help" }));
    fireEvent.keyDown(window, { key: "ArrowDown" });

    expect(screen.getByTestId("score").textContent).toBe("0");
    expect(screen.getByRole("dialog", { name: "How to play Nametris" })).toBeVisible();
  });
});
