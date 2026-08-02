import {
  fullBankSlowZoneGravityMultiplier,
  getGravityMilliseconds,
  lockDelayMilliseconds,
  lockResetLimit,
  maximumTransferCount,
  routeZoneVisibleRows,
  spawnColumn,
  spawnRow,
} from "../config/gameplay";
import { composeNameMask } from "../glyphs/alphabet";
import type { ActivePiece, Board, PieceType } from "../model/types";
import {
  HIDDEN_BOARD_ROWS,
  createEmptyBoard,
  getBoardStackHeight,
  lockAndClearPiece,
} from "./board";
import { canPlacePiece, movePiece } from "./collision";
import { getPieceCells } from "./pieces";
import { rotatePiece, type RotationDirection } from "./rotation";
import { getHardDropScore, getLevel, getSoftDropScore } from "./scoring";
import { addActiveMilliseconds } from "../runtime/clock";
import {
  canLockIntoStencil,
  createStencilPlacementPiece,
  createStencilState,
  getStencilCompletion,
  lockIntoStencil,
  moveStencilPiece,
  rotateStencilPiece,
  type StencilState,
} from "./stencil";

export type BoardPhase = "playing" | "paused" | "placing-stencil" | "won" | "lost";
export type PauseReason = "player" | "hidden" | "help";

export interface BoardSession {
  readonly name: string;
  readonly phase: BoardPhase;
  readonly pauseReason: PauseReason | null;
  readonly pausedPhase: "playing" | "placing-stencil" | null;
  readonly board: Board;
  readonly activePiece: ActivePiece;
  readonly nextPiece: PieceType;
  readonly pieceQueue: readonly PieceType[];
  readonly score: number;
  readonly linesCleared: number;
  readonly level: number;
  readonly fourLineClears: number;
  readonly maximumBoardStackHeight: number;
  readonly transferCount: number;
  readonly stencil: StencilState;
  readonly stencilPiece: ActivePiece | null;
  readonly canFinish: boolean;
  readonly routedAttempts: number;
  readonly successfulStencilLocks: number;
  readonly canceledRoutes: number;
  readonly distinctStencilPieceTypes: ReadonlySet<PieceType>;
  readonly activeMilliseconds: number;
  readonly gravityAccumulatorMilliseconds: number;
  readonly lockAccumulatorMilliseconds: number;
  readonly lockResetCount: number;
}

export type BoardAction =
  | { readonly type: "move"; readonly columnDelta: -1 | 1 }
  | { readonly type: "soft-drop" }
  | { readonly type: "hard-drop" }
  | {
      readonly type: "rotate";
      readonly direction: RotationDirection;
    }
  | { readonly type: "tick"; readonly elapsedMilliseconds: number }
  | { readonly type: "pause"; readonly reason: PauseReason }
  | { readonly type: "resume" }
  | { readonly type: "route-to-stencil" }
  | {
      readonly type: "stencil-move";
      readonly rowDelta: -1 | 0 | 1;
      readonly columnDelta: -1 | 0 | 1;
    }
  | {
      readonly type: "stencil-rotate";
      readonly direction: RotationDirection;
    }
  | { readonly type: "stencil-lock" }
  | { readonly type: "stencil-cancel" }
  | { readonly type: "finish-run" };

function spawnPiece(type: PieceType): ActivePiece {
  return {
    type,
    row: spawnRow,
    column: spawnColumn,
    rotation: 0,
  };
}

export function createGameSession(
  name: string,
  pieceQueue: readonly PieceType[],
): BoardSession {
  const activeType = pieceQueue[0];
  const nextType = pieceQueue[1];

  if (activeType === undefined || nextType === undefined) {
    throw new Error("A board session requires at least two queued pieces.");
  }

  const mask = composeNameMask(name);

  return {
    name,
    phase: "playing",
    pauseReason: null,
    pausedPhase: null,
    board: createEmptyBoard(),
    activePiece: spawnPiece(activeType),
    nextPiece: nextType,
    pieceQueue: pieceQueue.slice(1),
    score: 0,
    linesCleared: 0,
    level: 1,
    fourLineClears: 0,
    maximumBoardStackHeight: 0,
    transferCount: 0,
    stencil: createStencilState(mask.cells, mask.rows, mask.columns),
    stencilPiece: null,
    canFinish: false,
    routedAttempts: 0,
    successfulStencilLocks: 0,
    canceledRoutes: 0,
    distinctStencilPieceTypes: new Set(),
    activeMilliseconds: 0,
    gravityAccumulatorMilliseconds: 0,
    lockAccumulatorMilliseconds: 0,
    lockResetCount: 0,
  };
}

export function createBoardSession(pieceQueue: readonly PieceType[]): BoardSession {
  return createGameSession("HARSH", pieceQueue);
}

export function getGhostPiece(board: Board, activePiece: ActivePiece): ActivePiece {
  let ghost = activePiece;

  while (true) {
    const moved = { ...ghost, row: ghost.row + 1 };
    if (!canPlacePiece(board, moved)) {
      return ghost;
    }
    ghost = moved;
  }
}

function spawnNextPiece(
  state: BoardSession,
  board: Board,
): Pick<BoardSession, "activePiece" | "nextPiece" | "pieceQueue" | "phase"> {
  const activeType = state.pieceQueue[0];

  if (activeType === undefined) {
    return {
      activePiece: state.activePiece,
      nextPiece: state.nextPiece,
      pieceQueue: state.pieceQueue,
      phase: "lost",
    };
  }

  const remainingQueue = state.pieceQueue.slice(1);
  const activePiece = spawnPiece(activeType);

  return {
    activePiece,
    nextPiece: remainingQueue[0] ?? activeType,
    pieceQueue: remainingQueue,
    phase: canPlacePiece(board, activePiece) ? "playing" : "lost",
  };
}

function lockActivePiece(state: BoardSession, extraScore = 0): BoardSession {
  const lockResult = lockAndClearPiece(state.board, state.activePiece, state.level);
  const linesCleared = state.linesCleared + lockResult.linesCleared;
  const spawned = spawnNextPiece(state, lockResult.board);

  return {
    ...state,
    ...spawned,
    phase: lockResult.toppedOut ? "lost" : spawned.phase,
    pauseReason: null,
    pausedPhase: null,
    board: lockResult.board,
    score: state.score + extraScore + lockResult.scoreEarned,
    linesCleared,
    level: getLevel(linesCleared),
    fourLineClears: state.fourLineClears + (lockResult.linesCleared === 4 ? 1 : 0),
    maximumBoardStackHeight: Math.max(
      state.maximumBoardStackHeight,
      getBoardStackHeight(lockResult.board),
    ),
    transferCount: Math.min(
      maximumTransferCount,
      state.transferCount + lockResult.transfersEarned,
    ),
    gravityAccumulatorMilliseconds: 0,
    lockAccumulatorMilliseconds: 0,
    lockResetCount: 0,
  };
}

function isGrounded(state: BoardSession, piece = state.activePiece): boolean {
  return !canPlacePiece(state.board, { ...piece, row: piece.row + 1 });
}

function moveOrRotate(state: BoardSession, candidate: ActivePiece): BoardSession {
  if (candidate === state.activePiece) {
    return state;
  }

  const canReset = isGrounded(state) && state.lockResetCount < lockResetLimit;

  return {
    ...state,
    activePiece: candidate,
    lockAccumulatorMilliseconds: canReset ? 0 : state.lockAccumulatorMilliseconds,
    lockResetCount: canReset ? state.lockResetCount + 1 : state.lockResetCount,
  };
}

function tickPlayingSession(
  state: BoardSession,
  elapsedMilliseconds: number,
): BoardSession {
  const safeElapsed = Math.max(0, elapsedMilliseconds);

  if (isGrounded(state)) {
    const lockAccumulatorMilliseconds = state.lockAccumulatorMilliseconds + safeElapsed;

    if (lockAccumulatorMilliseconds >= lockDelayMilliseconds) {
      return lockActivePiece(state);
    }

    return { ...state, lockAccumulatorMilliseconds };
  }

  const gravityMilliseconds = getGravityMilliseconds(state.level);
  const gravityElapsed =
    state.transferCount >= maximumTransferCount && canRouteActivePiece(state)
      ? safeElapsed * fullBankSlowZoneGravityMultiplier
      : safeElapsed;
  let gravityAccumulatorMilliseconds =
    state.gravityAccumulatorMilliseconds + gravityElapsed;
  let activePiece = state.activePiece;

  while (gravityAccumulatorMilliseconds >= gravityMilliseconds) {
    const moved = movePiece(state.board, activePiece, 0, 1);
    gravityAccumulatorMilliseconds -= gravityMilliseconds;

    if (moved === activePiece) {
      break;
    }
    activePiece = moved;
  }

  return {
    ...state,
    activePiece,
    gravityAccumulatorMilliseconds,
    lockAccumulatorMilliseconds: 0,
  };
}

export function canRouteActivePiece(state: BoardSession): boolean {
  const routeDeadlineRow = HIDDEN_BOARD_ROWS + routeZoneVisibleRows;

  return (
    state.phase === "playing" &&
    state.transferCount > 0 &&
    getPieceCells(state.activePiece).some(({ row }) => row < routeDeadlineRow)
  );
}

function reduceStencilPlacement(
  state: BoardSession,
  action: BoardAction,
): BoardSession {
  const stencilPiece = state.stencilPiece;
  if (stencilPiece === null) {
    return state;
  }

  switch (action.type) {
    case "tick":
      return {
        ...state,
        activeMilliseconds: addActiveMilliseconds(
          state.activeMilliseconds,
          action.elapsedMilliseconds,
          true,
        ),
      };
    case "stencil-move":
      return {
        ...state,
        stencilPiece: moveStencilPiece(
          state.stencil,
          stencilPiece,
          action.rowDelta,
          action.columnDelta,
        ),
      };
    case "stencil-rotate":
      return {
        ...state,
        stencilPiece: rotateStencilPiece(state.stencil, stencilPiece, action.direction),
      };
    case "stencil-cancel":
      return {
        ...state,
        phase: "playing",
        pausedPhase: null,
        stencilPiece: null,
        canceledRoutes: state.canceledRoutes + 1,
      };
    case "stencil-lock": {
      if (!canLockIntoStencil(state.stencil, stencilPiece)) {
        return state;
      }

      const stencil = lockIntoStencil(state.stencil, stencilPiece).state;
      const completion = getStencilCompletion(stencil);
      const spawned = spawnNextPiece(state, state.board);

      return {
        ...state,
        ...spawned,
        phase: completion.perfect ? "won" : spawned.phase,
        pausedPhase: null,
        stencil,
        stencilPiece: null,
        transferCount: state.transferCount - 1,
        canFinish: completion.canFinish,
        successfulStencilLocks: state.successfulStencilLocks + 1,
        distinctStencilPieceTypes: new Set([
          ...state.distinctStencilPieceTypes,
          stencilPiece.type,
        ]),
        gravityAccumulatorMilliseconds: 0,
        lockAccumulatorMilliseconds: 0,
        lockResetCount: 0,
      };
    }
    default:
      return state;
  }
}

export function reduceBoardSession(
  state: BoardSession,
  action: BoardAction,
): BoardSession {
  if (action.type === "resume") {
    return state.phase === "paused"
      ? {
          ...state,
          phase: state.pausedPhase ?? "playing",
          pauseReason: null,
          pausedPhase: null,
        }
      : state;
  }

  if (action.type === "pause") {
    return state.phase === "playing" || state.phase === "placing-stencil"
      ? {
          ...state,
          phase: "paused",
          pauseReason: action.reason,
          pausedPhase: state.phase,
        }
      : state;
  }

  if (action.type === "finish-run") {
    return state.phase === "playing" && state.canFinish
      ? { ...state, phase: "won" }
      : state;
  }

  if (state.phase === "placing-stencil") {
    return reduceStencilPlacement(state, action);
  }

  if (state.phase !== "playing") {
    return state;
  }

  switch (action.type) {
    case "route-to-stencil":
      return canRouteActivePiece(state)
        ? {
            ...state,
            phase: "placing-stencil",
            stencilPiece: createStencilPlacementPiece(
              state.stencil,
              state.activePiece.type,
            ),
            routedAttempts: state.routedAttempts + 1,
          }
        : state;
    case "move":
      return moveOrRotate(
        state,
        movePiece(state.board, state.activePiece, action.columnDelta, 0),
      );
    case "rotate":
      return moveOrRotate(
        state,
        rotatePiece(state.board, state.activePiece, action.direction),
      );
    case "soft-drop": {
      const moved = movePiece(state.board, state.activePiece, 0, 1);
      return moved === state.activePiece
        ? state
        : {
            ...state,
            activePiece: moved,
            score: state.score + getSoftDropScore(1),
          };
    }
    case "hard-drop": {
      const ghost = getGhostPiece(state.board, state.activePiece);
      const distance = ghost.row - state.activePiece.row;
      return lockActivePiece(
        { ...state, activePiece: ghost },
        getHardDropScore(distance),
      );
    }
    case "tick": {
      const ticked = tickPlayingSession(state, action.elapsedMilliseconds);
      return {
        ...ticked,
        activeMilliseconds: addActiveMilliseconds(
          state.activeMilliseconds,
          action.elapsedMilliseconds,
          true,
        ),
      };
    }
    default:
      return state;
  }
}
