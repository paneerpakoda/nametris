import { BOARD_HEIGHT } from "../engine/board";
import type { BoardSession } from "../engine/session";
import { createStencilState } from "../engine/stencil";
import { composeNameMask } from "../glyphs/alphabet";

export type E2EFixtureKind =
  "line-clear" | "route-return" | "eighty" | "perfect-ready" | "topout-eighty";

function progressStencil(filledCount: number) {
  const mask = new Set(Array.from({ length: 20 }, (_, index) => `0:${index}`));
  return {
    ...createStencilState(mask, 1, 20),
    filledCells: new Map(
      Array.from({ length: filledCount }, (_, index) => [`0:${index}`, "I" as const]),
    ),
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
    case "line-clear": {
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
    case "route-return": {
      const mask = composeNameMask("AB");
      return {
        ...base,
        activePiece: {
          type: "O",
          rotation: 0,
          row: 8,
          column: 3,
        },
        transferCount: 1,
        canFinish: false,
        stencil: createStencilState(mask.cells, mask.rows, mask.columns),
      };
    }
    case "eighty":
      return {
        ...base,
        canFinish: true,
        stencil: progressStencil(16),
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
