import { BOARD_HEIGHT } from "../engine/board";
import type { BoardSession } from "../engine/session";
import { createStencilState } from "../engine/stencil";
import { maximumTransferCount } from "../config/gameplay";

export type E2EFixtureKind =
  | "route-return"
  | "line-clear-ready"
  | "transfer-full"
  | "eighty"
  | "eighty-real"
  | "perfect-ready"
  | "topout-eighty";

function progressStencil(filledCount: number) {
  const mask = new Set(Array.from({ length: 20 }, (_, index) => `0:${index}`));
  return {
    ...createStencilState(mask, 1, 20),
    filledCells: new Map(
      Array.from({ length: filledCount }, (_, index) => [`0:${index}`, "I" as const]),
    ),
  };
}

function progressRealStencil(state: BoardSession) {
  const mask = Array.from(state.stencil.mask);
  const filledCount = Math.ceil(mask.length * 0.8);
  return {
    ...state.stencil,
    filledCells: new Map(mask.slice(0, filledCount).map((key) => [key, "I" as const])),
  };
}

function resetPlacement(state: BoardSession): BoardSession {
  return {
    ...state,
    phase: "playing",
    pauseReason: null,
    pausedPhase: null,
    stencilPiece: null,
  };
}

export function createE2EFixture(
  state: BoardSession,
  kind: E2EFixtureKind,
): BoardSession {
  const base = resetPlacement(state);

  switch (kind) {
    case "line-clear-ready": {
      const board = base.board.map((row, rowIndex) =>
        row.map((cell, columnIndex) =>
          rowIndex === BOARD_HEIGHT - 1 && columnIndex !== 5 ? "J" : cell,
        ),
      );
      return {
        ...base,
        board,
        activePiece: {
          type: "I",
          rotation: 1,
          row: 0,
          column: 3,
        },
        transferCount: 0,
      };
    }
    case "transfer-full":
      return {
        ...base,
        activePiece: {
          type: "T",
          rotation: 0,
          row: 0,
          column: 3,
        },
        transferCount: maximumTransferCount,
        canFinish: false,
      };
    case "route-return":
      return {
        ...base,
        activePiece: {
          type: "O",
          rotation: 0,
          row: 0,
          column: 3,
        },
        transferCount: 1,
        canFinish: false,
        stencil: createStencilState(
          new Set(["0:0", "0:1", "1:0", "1:1", "0:4", "0:5", "0:6", "0:7"]),
          2,
          8,
        ),
      };
    case "eighty":
      return {
        ...base,
        canFinish: true,
        stencil: progressStencil(16),
      };
    case "eighty-real":
      return {
        ...base,
        canFinish: true,
        stencil: progressRealStencil(base),
      };
    case "perfect-ready":
      return {
        ...base,
        activePiece: {
          type: "I",
          rotation: 0,
          row: 0,
          column: 3,
        },
        transferCount: 1,
        canFinish: true,
        stencil: progressStencil(16),
      };
    case "topout-eighty": {
      const board = base.board.map((row, rowIndex) =>
        row.map((cell, columnIndex) =>
          rowIndex === 1 && columnIndex === 3 ? "J" : cell,
        ),
      );
      return {
        ...base,
        board,
        activePiece: {
          type: "O",
          rotation: 0,
          row: BOARD_HEIGHT - 2,
          column: 3,
        },
        canFinish: true,
        stencil: progressStencil(16),
      };
    }
  }
}
