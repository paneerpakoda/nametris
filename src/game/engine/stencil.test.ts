import { describe, expect, it } from "vitest";

import type { ActivePiece } from "../model/types";
import { getPieceCells } from "./pieces";
import {
  canLockIntoStencil,
  createStencilState,
  getStencilCompletion,
  lockIntoStencil,
  createStencilPlacementPiece,
  findFirstLegalStencilPlacement,
  moveStencilPiece,
  rotateStencilPiece,
} from "./stencil";

const squareMask = new Set(["0:0", "0:1", "1:0", "1:1"]);
const squarePiece: ActivePiece = {
  type: "O",
  row: 0,
  column: -1,
  rotation: 0,
};

describe("stencil placement", () => {
  it("locks all four cells when the piece fits the mask", () => {
    const state = createStencilState(squareMask, 2, 2);
    const result = lockIntoStencil(state, squarePiece);

    expect(result.locked).toBe(true);
    expect(result.state.filledCells.size).toBe(4);
    expect(getStencilCompletion(result.state)).toEqual({
      ratio: 1,
      displayPercent: 100,
      canFinish: true,
      perfect: true,
    });
  });

  it("clips cells outside the mask and locks the part that fits", () => {
    const state = createStencilState(squareMask, 2, 2);
    const partial = { ...squarePiece, column: 0 };
    const result = lockIntoStencil(state, partial);

    expect(canLockIntoStencil(state, partial)).toBe(true);
    expect(result.locked).toBe(true);
    expect([...result.state.filledCells.keys()].sort()).toEqual(["0:1", "1:1"]);
  });

  it("trims overlap and adds any remaining open stencil cells", () => {
    const state = {
      ...createStencilState(squareMask, 2, 2),
      filledCells: new Map([["0:0", "T" as const]]),
    };
    const result = lockIntoStencil(state, squarePiece);

    expect(canLockIntoStencil(state, squarePiece)).toBe(true);
    expect(result.locked).toBe(true);
    expect(result.state.filledCells.size).toBe(4);
    expect(result.state.filledCells.get("0:0")).toBe("T");
  });

  it("rejects overlap without changing the filled cells", () => {
    const state = createStencilState(squareMask, 2, 2);
    const first = lockIntoStencil(state, squarePiece);
    const overlap = lockIntoStencil(first.state, squarePiece);

    expect(overlap.locked).toBe(false);
    expect(overlap.state).toBe(first.state);
  });

  it("uses exact ratios rather than rounded display text at 80%", () => {
    const mask = new Set(Array.from({ length: 20 }, (_, index) => `0:${index}`));
    const state = {
      ...createStencilState(mask, 1, 20),
      filledCells: new Map(
        Array.from({ length: 16 }, (_, index) => [`0:${index}`, "I"] as const),
      ),
    };

    expect(getStencilCompletion(state)).toEqual({
      ratio: 0.8,
      displayPercent: 80,
      canFinish: true,
      perfect: false,
    });
  });

  it("does not unlock finish immediately below 80%", () => {
    const mask = new Set(Array.from({ length: 100 }, (_, index) => `0:${index}`));
    const state = {
      ...createStencilState(mask, 1, 100),
      filledCells: new Map(
        Array.from({ length: 79 }, (_, index) => [`0:${index}`, "I"] as const),
      ),
    };

    expect(getStencilCompletion(state).canFinish).toBe(false);
    expect(getStencilCompletion(state).displayPercent).toBe(79);
  });

  it("reports zero completion for an empty mask", () => {
    expect(getStencilCompletion(createStencilState(new Set(), 0, 0))).toEqual({
      ratio: 0,
      displayPercent: 0,
      canFinish: false,
      perfect: false,
    });
  });

  it("finds the placement with the largest usable overlap", () => {
    const lineState = createStencilState(new Set(["0:0", "0:1", "0:2", "0:3"]), 1, 4);

    expect(findFirstLegalStencilPlacement(lineState, "I")).toEqual({
      type: "I",
      rotation: 0,
      row: -1,
      column: 0,
    });
    expect(findFirstLegalStencilPlacement(lineState, "O")).toEqual({
      type: "O",
      rotation: 0,
      row: -1,
      column: -1,
    });
  });

  it("keeps at least one cell visible while allowing clipped overhang", () => {
    const state = createStencilState(
      new Set(
        Array.from(
          { length: 16 },
          (_, index) => `${Math.floor(index / 4)}:${index % 4}`,
        ),
      ),
      4,
      4,
    );
    const active = createStencilPlacementPiece(state, "T");
    const moved = moveStencilPiece(state, active, 99, 99);
    const rotated = rotateStencilPiece(state, moved, "counterclockwise");

    expect(
      getPieceCells(moved).some(
        ({ row, column }) => row >= 0 && row < 4 && column >= 0 && column < 4,
      ),
    ).toBe(true);
    expect(rotated.rotation).toBe(3);
  });
});
