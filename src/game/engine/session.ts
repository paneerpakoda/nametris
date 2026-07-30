import {
  getGravityMilliseconds,
  lockDelayMilliseconds,
  lockResetLimit,
  spawnColumn,
  spawnRow,
} from "../config/gameplay";
import type { ActivePiece, Board, PieceType } from "../model/types";
import { lockAndClearPiece, createEmptyBoard } from "./board";
import { canPlacePiece, movePiece } from "./collision";
import { rotatePiece, type RotationDirection } from "./rotation";
import { getHardDropScore, getLevel, getSoftDropScore } from "./scoring";

export type BoardPhase = "playing" | "paused" | "lost";
export type PauseReason = "player" | "hidden" | "help";

export interface BoardSession {
  readonly phase: BoardPhase;
  readonly pauseReason: PauseReason | null;
  readonly board: Board;
  readonly activePiece: ActivePiece;
  readonly nextPiece: PieceType;
  readonly pieceQueue: readonly PieceType[];
  readonly score: number;
  readonly linesCleared: number;
  readonly level: number;
  readonly transferCount: number;
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
  | { readonly type: "resume" };

function spawnPiece(type: PieceType): ActivePiece {
  return {
    type,
    row: spawnRow,
    column: spawnColumn,
    rotation: 0,
  };
}

export function createBoardSession(pieceQueue: readonly PieceType[]): BoardSession {
  const activeType = pieceQueue[0];
  const nextType = pieceQueue[1];

  if (activeType === undefined || nextType === undefined) {
    throw new Error("A board session requires at least two queued pieces.");
  }

  return {
    phase: "playing",
    pauseReason: null,
    board: createEmptyBoard(),
    activePiece: spawnPiece(activeType),
    nextPiece: nextType,
    pieceQueue: pieceQueue.slice(1),
    score: 0,
    linesCleared: 0,
    level: 1,
    transferCount: 0,
    gravityAccumulatorMilliseconds: 0,
    lockAccumulatorMilliseconds: 0,
    lockResetCount: 0,
  };
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
    board: lockResult.board,
    score: state.score + extraScore + lockResult.scoreEarned,
    linesCleared,
    level: getLevel(linesCleared),
    transferCount: state.transferCount + lockResult.transfersEarned,
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
  let gravityAccumulatorMilliseconds =
    state.gravityAccumulatorMilliseconds + safeElapsed;
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

export function reduceBoardSession(
  state: BoardSession,
  action: BoardAction,
): BoardSession {
  if (action.type === "resume") {
    return state.phase === "paused"
      ? { ...state, phase: "playing", pauseReason: null }
      : state;
  }

  if (action.type === "pause") {
    return state.phase === "playing"
      ? { ...state, phase: "paused", pauseReason: action.reason }
      : state;
  }

  if (state.phase !== "playing") {
    return state;
  }

  switch (action.type) {
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
    case "tick":
      return tickPlayingSession(state, action.elapsedMilliseconds);
  }
}
