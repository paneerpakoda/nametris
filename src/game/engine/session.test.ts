import { describe, expect, it } from "vitest";

import type { PieceType } from "../model/types";
import { BOARD_HEIGHT } from "./board";
import { createBoardSession, getGhostPiece, reduceBoardSession } from "./session";

const queue: readonly PieceType[] = ["T", "I", "O", "J", "L", "S", "Z"];

describe("normal-board session", () => {
  it("spawns the active and next pieces from an injected queue", () => {
    const state = createBoardSession(queue);

    expect(state.activePiece.type).toBe("T");
    expect(state.nextPiece).toBe("I");
    expect(state.pieceQueue).toEqual(["I", "O", "J", "L", "S", "Z"]);
  });

  it("moves and rotates using pure actions", () => {
    const state = createBoardSession(queue);
    const moved = reduceBoardSession(state, { type: "move", columnDelta: -1 });
    const rotated = reduceBoardSession(moved, {
      type: "rotate",
      direction: "clockwise",
    });

    expect(moved.activePiece.column).toBe(state.activePiece.column - 1);
    expect(rotated.activePiece.rotation).toBe(1);
  });

  it("hard drops, scores distance, locks, and spawns the next piece", () => {
    const state = createBoardSession(queue);
    const dropped = reduceBoardSession(state, { type: "hard-drop" });

    expect(dropped.score).toBeGreaterThan(0);
    expect(dropped.activePiece.type).toBe("I");
    expect(
      dropped.board
        .slice(0, BOARD_HEIGHT)
        .some((row) => row.some((cell) => cell === "T")),
    ).toBe(true);
  });

  it("shows the active piece at its landing position as the ghost", () => {
    const state = createBoardSession(queue);
    const ghost = getGhostPiece(state.board, state.activePiece);

    expect(ghost.row).toBeGreaterThan(state.activePiece.row);
  });

  it("uses a 500ms grounded lock delay", () => {
    const state = {
      ...createBoardSession(queue),
      activePiece: {
        type: "O" as const,
        rotation: 0 as const,
        row: BOARD_HEIGHT - 2,
        column: 3,
      },
    };
    const waiting = reduceBoardSession(state, {
      type: "tick",
      elapsedMilliseconds: 499,
    });
    const locked = reduceBoardSession(waiting, {
      type: "tick",
      elapsedMilliseconds: 1,
    });

    expect(waiting.activePiece.type).toBe("O");
    expect(locked.activePiece.type).toBe("I");
  });

  it("does not advance while paused", () => {
    const state = createBoardSession(queue);
    const paused = reduceBoardSession(state, { type: "pause", reason: "player" });
    const afterTick = reduceBoardSession(paused, {
      type: "tick",
      elapsedMilliseconds: 10_000,
    });

    expect(afterTick).toEqual(paused);
  });
});
