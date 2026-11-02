import { glyphColumns, glyphSpacing } from "../../game/glyphs/alphabet";
import type { BoardSession } from "../../game/engine/session";
import type { SoundName } from "./mixer";

export interface JuiceCueOptions {
  readonly hardDrop: boolean;
  readonly emptySend: boolean;
}

export interface JuiceCues {
  readonly immediate: readonly SoundName[];
  readonly rewards: readonly SoundName[];
}

const noCues: JuiceCues = { immediate: [], rewards: [] };

export function completedLetterIndexes(
  name: string,
  mask: ReadonlySet<string>,
  before: ReadonlySet<string>,
  after: ReadonlyMap<string, unknown>,
): number[] {
  const span = glyphColumns + glyphSpacing;
  const indexes: number[] = [];

  for (let index = 0; index < name.length; index += 1) {
    const start = index * span;
    let total = 0;
    let filledBefore = 0;
    let filledAfter = 0;

    for (const key of mask) {
      const column = Number(key.slice(key.indexOf(":") + 1));
      if (column < start || column >= start + glyphColumns) {
        continue;
      }
      total += 1;
      if (before.has(key)) {
        filledBefore += 1;
      }
      if (after.has(key)) {
        filledAfter += 1;
      }
    }

    if (total > 0 && filledAfter === total && filledBefore < total) {
      indexes.push(index);
    }
  }

  return indexes;
}

export function deriveJuiceCues(
  previous: BoardSession,
  next: BoardSession,
  options: JuiceCueOptions,
): JuiceCues {
  if (previous === next && !options.hardDrop && !options.emptySend) {
    return noCues;
  }

  const immediate: SoundName[] = [];
  const rewards: SoundName[] = [];
  const cleared = Math.max(0, next.linesCleared - previous.linesCleared);
  const queueShrunk = next.pieceQueue.length < previous.pieceQueue.length;

  if (next.phase === "lost" && previous.phase !== "lost") {
    immediate.push("game-over");
  }
  if (next.phase === "won" && previous.phase !== "won") {
    rewards.push("win");
  }
  if (next.canFinish && !previous.canFinish) {
    rewards.push("eighty");
  }
  if (cleared >= 4) {
    rewards.push("clear-4");
  } else if (cleared === 3) {
    rewards.push("clear-3");
  } else if (cleared === 2) {
    rewards.push("clear-2");
  } else if (cleared === 1) {
    rewards.push("clear-1");
  }
  if (next.transferCount > previous.transferCount) {
    rewards.push("name-piece");
  }
  if (next.level > previous.level) {
    rewards.push("level-up");
  }

  const filledGrew = next.stencil.filledCells.size > previous.stencil.filledCells.size;
  if (previous.phase === "placing-stencil" && filledGrew) {
    const before = new Set(previous.stencil.filledCells.keys());
    if (
      completedLetterIndexes(
        next.name,
        next.stencil.mask,
        before,
        next.stencil.filledCells,
      ).length > 0
    ) {
      rewards.push("letter");
    }
    rewards.push("stamp");
  }

  if (next.phase === "placing-stencil" && previous.phase !== "placing-stencil") {
    immediate.push("send");
  }
  if (options.emptySend) {
    immediate.push("nope");
  }

  if (queueShrunk && previous.phase === "playing" && next.phase !== "lost") {
    immediate.push(options.hardDrop ? "hard-drop" : "soft-lock");
  } else if (next.phase === "playing" && previous.phase === "playing") {
    const before = previous.activePiece;
    const after = next.activePiece;
    if (after.rotation !== before.rotation && !queueShrunk) {
      immediate.push("rotate");
    } else if (
      after.column !== before.column &&
      after.row === before.row &&
      after.rotation === before.rotation &&
      !queueShrunk
    ) {
      immediate.push("move");
    }
  }

  return { immediate, rewards };
}
