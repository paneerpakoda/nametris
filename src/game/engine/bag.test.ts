import { describe, expect, it } from "vitest";

import type { PieceType } from "../model/types";
import { createPieceQueue, createSevenBag, createSeededRandom } from "./bag";

const allPieceTypes: readonly PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

describe("seven-bag generator", () => {
  it("returns every tetromino exactly once", () => {
    const bag = createSevenBag(createSeededRandom(42));

    expect([...bag].sort()).toEqual([...allPieceTypes].sort());
  });

  it("replays the same sequence for the same seed", () => {
    const firstRandom = createSeededRandom(938);
    const secondRandom = createSeededRandom(938);

    const first = [...createSevenBag(firstRandom), ...createSevenBag(firstRandom)];
    const second = [...createSevenBag(secondRandom), ...createSevenBag(secondRandom)];

    expect(first).toEqual(second);
  });

  it("produces a different sequence for a different seed", () => {
    expect(createSevenBag(createSeededRandom(1))).not.toEqual(
      createSevenBag(createSeededRandom(2)),
    );
  });

  it("builds a requested number of complete bags", () => {
    const pieces = createPieceQueue(createSeededRandom(99), 5);

    expect(pieces).toHaveLength(35);
    for (let index = 0; index < pieces.length; index += 7) {
      expect([...pieces.slice(index, index + 7)].sort()).toEqual(
        [...allPieceTypes].sort(),
      );
    }
  });
});
