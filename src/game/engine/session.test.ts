import { describe, expect, it } from "vitest";

import type { PieceType } from "../model/types";
import { BOARD_HEIGHT } from "./board";
import { createBoardSession, getGhostPiece, reduceBoardSession } from "./session";
import { createStencilState, getStencilCompletion } from "./stencil";

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

describe("piece routing", () => {
  function routableSquareSession() {
    return {
      ...createBoardSession(["O", "I", "T", "J"]),
      transferCount: 1,
      stencil: createStencilState(new Set(["0:0", "0:1", "1:0", "1:1"]), 2, 2),
    };
  }

  it("cancels back to the same spawned piece without spending a transfer", () => {
    const state = routableSquareSession();
    const placing = reduceBoardSession(state, { type: "route-to-stencil" });
    const canceled = reduceBoardSession(placing, { type: "stencil-cancel" });

    expect(placing.phase).toBe("placing-stencil");
    expect(placing.stencilPiece?.type).toBe("O");
    expect(canceled.phase).toBe("playing");
    expect(canceled.activePiece).toEqual(state.activePiece);
    expect(canceled.transferCount).toBe(1);
    expect(canceled.canceledRoutes).toBe(1);
  });

  it("spends one transfer only after a legal stencil lock", () => {
    const state = routableSquareSession();
    const placing = reduceBoardSession(state, { type: "route-to-stencil" });
    const locked = reduceBoardSession(placing, { type: "stencil-lock" });

    expect(locked.transferCount).toBe(0);
    expect(locked.successfulStencilLocks).toBe(1);
    expect(locked.stencil.filledCells.size).toBe(4);
    expect(locked.activePiece.type).toBe("I");
    expect(locked.phase).toBe("won");
  });

  it("ignores an invalid stencil lock without spending a transfer", () => {
    const state = {
      ...createBoardSession(["O", "I", "T"]),
      transferCount: 1,
      stencil: createStencilState(new Set(["0:0", "0:1", "0:2", "0:3"]), 1, 4),
    };
    const placing = reduceBoardSession(state, { type: "route-to-stencil" });
    const invalid = reduceBoardSession(placing, { type: "stencil-lock" });

    expect(invalid).toBe(placing);
    expect(invalid.transferCount).toBe(1);
  });

  it("keeps gameplay active when a legal lock reaches exact 80%", () => {
    const mask = new Set(Array.from({ length: 20 }, (_, index) => `0:${index}`));
    const state = {
      ...createBoardSession(["I", "O", "T"]),
      transferCount: 1,
      stencil: {
        ...createStencilState(mask, 1, 20),
        filledCells: new Map(
          Array.from({ length: 12 }, (_, index) => [`0:${index}`, "I"] as const),
        ),
      },
    };
    const placing = reduceBoardSession(state, { type: "route-to-stencil" });
    const locked = reduceBoardSession(placing, { type: "stencil-lock" });

    expect(getStencilCompletion(locked.stencil).ratio).toBe(0.8);
    expect(locked.canFinish).toBe(true);
    expect(locked.phase).toBe("playing");
    expect(locked.activePiece.type).toBe("O");
  });

  it("finishes an 80–99% result only after the player claims it", () => {
    const state = {
      ...routableSquareSession(),
      canFinish: true,
    };

    expect(reduceBoardSession(state, { type: "finish-run" }).phase).toBe("won");
  });
});
