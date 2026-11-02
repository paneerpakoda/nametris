import { describe, expect, it } from "vitest";

import { createBoardSession, reduceBoardSession } from "../../game/engine/session";
import { createStencilState } from "../../game/engine/stencil";
import { completedLetterIndexes, deriveJuiceCues } from "./cues";

const quiet = { hardDrop: false, emptySend: false };

describe("juice cues", () => {
  it("orders a clear, a name piece, and a level up for the reward queue", () => {
    const previous = createBoardSession(["I", "O", "T"]);
    const next = {
      ...previous,
      linesCleared: 4,
      transferCount: 1,
      level: 2,
      pieceQueue: previous.pieceQueue.slice(1),
    };

    expect(
      deriveJuiceCues(previous, next, { hardDrop: true, emptySend: false }),
    ).toEqual({
      immediate: ["hard-drop"],
      rewards: ["clear-4", "name-piece", "level-up"],
    });
  });

  it("keeps gravity, moves, rotates, sends, and empty sends apart", () => {
    const previous = createBoardSession(["O", "I", "T"]);
    const piece = previous.activePiece;

    expect(
      deriveJuiceCues(
        previous,
        { ...previous, activePiece: { ...piece, row: piece.row + 1 } },
        quiet,
      ).immediate,
    ).toEqual([]);
    expect(
      deriveJuiceCues(
        previous,
        { ...previous, activePiece: { ...piece, column: piece.column + 1 } },
        quiet,
      ).immediate,
    ).toEqual(["move"]);
    expect(
      deriveJuiceCues(
        previous,
        { ...previous, activePiece: { ...piece, rotation: 1 } },
        quiet,
      ).immediate,
    ).toEqual(["rotate"]);
    expect(
      deriveJuiceCues(previous, { ...previous, phase: "placing-stencil" }, quiet)
        .immediate,
    ).toEqual(["send"]);
    expect(
      deriveJuiceCues(previous, previous, { hardDrop: false, emptySend: true })
        .immediate,
    ).toEqual(["nope"]);
  });

  it("prefers the outcome sound when a run ends", () => {
    const previous = createBoardSession(["O", "I"]);
    const lost = deriveJuiceCues(
      previous,
      { ...previous, phase: "lost", pieceQueue: previous.pieceQueue.slice(1) },
      quiet,
    );
    expect(lost.immediate).toEqual(["game-over"]);
    expect(lost.rewards).toEqual([]);

    const won = deriveJuiceCues(
      { ...previous, canFinish: false },
      { ...previous, canFinish: true, phase: "won" },
      quiet,
    );
    expect(won.rewards).toEqual(["win", "eighty"]);
  });

  it("stamps a name lock and notices a finished letter", () => {
    const mask = new Set(["0:0", "0:1", "0:6"]);
    expect(
      completedLetterIndexes(
        "AB",
        mask,
        new Set(["0:0"]),
        new Map([
          ["0:0", "I"],
          ["0:1", "I"],
        ]),
      ),
    ).toEqual([0]);

    const previous = {
      ...createBoardSession(["T", "O", "I"]),
      phase: "placing-stencil" as const,
      stencil: createStencilState(mask, 1, 8),
    };
    const next = {
      ...previous,
      phase: "playing" as const,
      stencil: {
        ...previous.stencil,
        filledCells: new Map([
          ["0:0", "T" as const],
          ["0:1", "T" as const],
          ["0:6", "T" as const],
        ]),
      },
    };

    expect(deriveJuiceCues(previous, next, quiet).rewards).toEqual(["letter", "stamp"]);
  });

  it("keeps cue work beside a move under a millisecond", () => {
    const session = createBoardSession(["O", "I", "T"]);
    const off: number[] = [];
    const on: number[] = [];

    for (let index = 0; index < 80; index += 1) {
      let started = performance.now();
      reduceBoardSession(session, { type: "move", columnDelta: -1 });
      off.push(performance.now() - started);

      started = performance.now();
      const next = reduceBoardSession(session, { type: "move", columnDelta: -1 });
      deriveJuiceCues(session, next, quiet);
      on.push(performance.now() - started);
    }

    const median = (values: number[]) =>
      [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)] ??
      0;
    const plain = median(off);
    const withCues = median(on);
    console.info(
      `key-to-move median ms logic=${plain.toFixed(4)} logic+cues=${withCues.toFixed(4)}`,
    );
    expect(withCues).toBeLessThan(plain + 1);
  });
});
