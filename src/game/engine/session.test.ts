import { describe, expect, it } from "vitest";

import type { PieceType } from "../model/types";
import { BOARD_HEIGHT } from "./board";
import {
  canRouteActivePiece,
  createBoardSession,
  getGhostPiece,
  reduceBoardSession,
} from "./session";
import { createStencilState, getStencilCompletion } from "./stencil";

const queue: readonly PieceType[] = ["T", "I", "O", "J", "L", "S", "Z"];

describe("normal-board session", () => {
  it("requires at least two queued pieces", () => {
    expect(() => createBoardSession(["I"])).toThrow(/at least two/);
  });

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
    expect(dropped.maximumBoardStackHeight).toBeGreaterThan(0);
  });

  it("captures a four-line clear for final performance metrics", () => {
    const state = createBoardSession(["I", "O", "T"]);
    const board = state.board.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex >= BOARD_HEIGHT - 4 && columnIndex !== 4 ? "J" : cell,
      ),
    );
    const cleared = reduceBoardSession(
      {
        ...state,
        board,
        activePiece: {
          type: "I" as const,
          rotation: 1 as const,
          row: BOARD_HEIGHT - 4,
          column: 2,
        },
      },
      { type: "hard-drop" },
    );

    expect(cleared.fourLineClears).toBe(1);
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

  it("counts injected active time only while play is active", () => {
    const state = createBoardSession(queue);
    const active = reduceBoardSession(state, {
      type: "tick",
      elapsedMilliseconds: 250,
    });
    const paused = reduceBoardSession(active, {
      type: "pause",
      reason: "hidden",
    });
    const hidden = reduceBoardSession(paused, {
      type: "tick",
      elapsedMilliseconds: 1_000,
    });

    expect(active.activeMilliseconds).toBe(250);
    expect(hidden.activeMilliseconds).toBe(250);
  });

  it("soft drops for one point and rejects a blocked soft drop", () => {
    const state = createBoardSession(queue);
    const dropped = reduceBoardSession(state, { type: "soft-drop" });
    const grounded = {
      ...dropped,
      activePiece: {
        type: "O" as const,
        rotation: 0 as const,
        row: BOARD_HEIGHT - 2,
        column: 3,
      },
    };

    expect(dropped.score).toBe(1);
    expect(reduceBoardSession(grounded, { type: "soft-drop" })).toBe(grounded);
  });

  it("applies gravity from injected elapsed time", () => {
    const state = createBoardSession(queue);
    const ticked = reduceBoardSession(state, {
      type: "tick",
      elapsedMilliseconds: 800,
    });

    expect(ticked.activePiece.row).toBe(state.activePiece.row + 1);
  });

  it("caps grounded lock-delay resets", () => {
    const grounded = {
      ...createBoardSession(queue),
      activePiece: {
        type: "O" as const,
        rotation: 0 as const,
        row: BOARD_HEIGHT - 2,
        column: 3,
      },
      lockAccumulatorMilliseconds: 100,
    };
    const reset = reduceBoardSession(grounded, {
      type: "move",
      columnDelta: -1,
    });
    const capped = reduceBoardSession(
      { ...grounded, lockResetCount: 15 },
      { type: "move", columnDelta: -1 },
    );

    expect(reset.lockAccumulatorMilliseconds).toBe(0);
    expect(reset.lockResetCount).toBe(1);
    expect(capped.lockAccumulatorMilliseconds).toBe(100);
    expect(capped.lockResetCount).toBe(15);
  });

  it("loses safely when the injected queue is exhausted", () => {
    const first = reduceBoardSession(createBoardSession(["T", "I"]), {
      type: "hard-drop",
    });
    const exhausted = reduceBoardSession(first, { type: "hard-drop" });

    expect(first.nextPiece).toBe("I");
    expect(exhausted.phase).toBe("lost");
  });

  it("loses when the next piece cannot spawn", () => {
    const state = createBoardSession(["O", "I", "T"]);
    const board = state.board.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex === 1 && columnIndex === 3 ? "J" : cell,
      ),
    );
    const blocked = {
      ...state,
      board,
      activePiece: {
        type: "O" as const,
        rotation: 0 as const,
        row: BOARD_HEIGHT - 2,
        column: 3,
      },
    };

    expect(reduceBoardSession(blocked, { type: "hard-drop" }).phase).toBe("lost");
  });

  it("loses when a grounded lock occupies hidden rows", () => {
    const state = createBoardSession(["O", "I", "T"]);
    const board = state.board.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex === 2 && (columnIndex === 4 || columnIndex === 5) ? "J" : cell,
      ),
    );

    const toppedOut = reduceBoardSession(
      { ...state, board },
      { type: "tick", elapsedMilliseconds: 500 },
    );

    expect(toppedOut.phase).toBe("lost");
  });

  it("leaves invalid and terminal actions unchanged", () => {
    const state = createBoardSession(queue);
    const atWall = {
      ...state,
      activePiece: {
        type: "I" as const,
        rotation: 1 as const,
        row: 3,
        column: -2,
      },
    };
    const lost = { ...state, phase: "lost" as const };

    expect(reduceBoardSession(atWall, { type: "move", columnDelta: -1 })).toBe(atWall);
    expect(reduceBoardSession(state, { type: "resume" })).toBe(state);
    expect(
      reduceBoardSession(
        { ...state, phase: "paused" },
        {
          type: "pause",
          reason: "player",
        },
      ),
    ).toMatchObject({ phase: "paused" });
    expect(reduceBoardSession(state, { type: "finish-run" })).toBe(state);
    expect(reduceBoardSession(lost, { type: "hard-drop" })).toBe(lost);
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

  it("pauses hidden stencil placement and resumes the same piece", () => {
    const state = routableSquareSession();
    const placing = reduceBoardSession(state, { type: "route-to-stencil" });
    const active = reduceBoardSession(placing, {
      type: "tick",
      elapsedMilliseconds: 250,
    });
    const paused = reduceBoardSession(active, { type: "pause", reason: "hidden" });
    const hidden = reduceBoardSession(paused, {
      type: "tick",
      elapsedMilliseconds: 1_000,
    });
    const resumed = reduceBoardSession(hidden, { type: "resume" });

    expect(paused.phase).toBe("paused");
    expect(hidden.activeMilliseconds).toBe(250);
    expect(resumed.phase).toBe("placing-stencil");
    expect(resumed.stencilPiece).toEqual(placing.stencilPiece);
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

  it("locks a clipped piece and spends one transfer when any cell fits", () => {
    const state = {
      ...createBoardSession(["O", "I", "T"]),
      transferCount: 1,
      stencil: createStencilState(new Set(["0:0", "0:1", "0:2", "0:3"]), 1, 4),
    };
    const placing = reduceBoardSession(state, { type: "route-to-stencil" });
    const locked = reduceBoardSession(placing, { type: "stencil-lock" });

    expect(locked).not.toBe(placing);
    expect(locked.transferCount).toBe(0);
    expect(locked.stencil.filledCells.size).toBe(2);
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

  it("still loses after 80% if the next spawn tops out before finish", () => {
    const state = createBoardSession(["O", "I", "T"]);
    const board = state.board.map((row, rowIndex) =>
      row.map((cell, columnIndex) =>
        rowIndex === 1 && columnIndex === 3 ? "J" : cell,
      ),
    );
    const atRisk = {
      ...state,
      canFinish: true,
      board,
      activePiece: {
        type: "O" as const,
        rotation: 0 as const,
        row: BOARD_HEIGHT - 2,
        column: 3,
      },
    };

    expect(reduceBoardSession(atRisk, { type: "hard-drop" }).phase).toBe("lost");
  });

  it("moves, rotates, and counts time during stencil placement", () => {
    const mask = new Set(
      Array.from({ length: 16 }, (_, index) => `${Math.floor(index / 4)}:${index % 4}`),
    );
    const state = {
      ...createBoardSession(["T", "I", "O"]),
      transferCount: 1,
      stencil: createStencilState(mask, 4, 4),
    };
    const placing = reduceBoardSession(state, { type: "route-to-stencil" });
    const moved = reduceBoardSession(placing, {
      type: "stencil-move",
      rowDelta: 1,
      columnDelta: 0,
    });
    const rotated = reduceBoardSession(moved, {
      type: "stencil-rotate",
      direction: "clockwise",
    });
    const timed = reduceBoardSession(rotated, {
      type: "tick",
      elapsedMilliseconds: 200,
    });

    expect(moved.stencilPiece).not.toBeNull();
    expect(rotated.stencilPiece?.rotation).toBe(1);
    expect(timed.activeMilliseconds).toBe(200);
  });

  it("routes through the top seven visible rows and expires at the marked line", () => {
    const state = createBoardSession(queue);
    const noTransfer = reduceBoardSession(state, {
      type: "route-to-stencil",
    });
    const transferReady = { ...state, transferCount: 1 };
    const atLastEligibleRow = {
      ...transferReady,
      activePiece: { ...state.activePiece, row: 8 },
    };
    const tooLate = {
      ...transferReady,
      activePiece: { ...state.activePiece, row: 9 },
    };

    expect(noTransfer).toBe(state);
    expect(canRouteActivePiece(atLastEligibleRow)).toBe(true);
    expect(canRouteActivePiece(tooLate)).toBe(false);
    expect(
      reduceBoardSession(atLastEligibleRow, { type: "route-to-stencil" }).phase,
    ).toBe("placing-stencil");
    expect(reduceBoardSession(tooLate, { type: "route-to-stencil" })).toBe(tooLate);
  });

  it("fails safe if stencil mode has no active stencil piece", () => {
    const state = {
      ...createBoardSession(queue),
      phase: "placing-stencil" as const,
      stencilPiece: null,
    };

    expect(
      reduceBoardSession(state, {
        type: "stencil-move",
        rowDelta: 1,
        columnDelta: 0,
      }),
    ).toBe(state);
  });
});
