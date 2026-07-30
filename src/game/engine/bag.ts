import type { PieceType } from "../model/types";

export type RandomSource = () => number;

const pieceTypes: readonly PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export function createSevenBag(random: RandomSource): readonly PieceType[] {
  const bag = [...pieceTypes];

  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.min(index, Math.floor(Math.max(0, random()) * (index + 1)));
    const current = bag[index];
    const swap = bag[swapIndex];

    if (current !== undefined && swap !== undefined) {
      bag[index] = swap;
      bag[swapIndex] = current;
    }
  }

  return bag;
}

export function createSeededRandom(seed: number): RandomSource {
  let value = seed >>> 0;

  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}
