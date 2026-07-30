import { describe, expect, it } from "vitest";

import type { ActivePiece } from "../model/types";
import {
  canLockIntoStencil,
  createStencilState,
  getStencilCompletion,
  getStencilContributionCells,
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

  it("clips cells outside the mask and locks the retained cells", () => {
    const state = createStencilState(squareMask, 2, 2);
    const clipped = { ...squarePiece, column: 0 };
    const result = lockIntoStencil(state, clipped);

    expect(canLockIntoStencil(state, clipped)).toBe(true);
    expect(getStencilContributionCells(state, clipped)).toHaveLength(2);
    expect(result.locked).toBe(true);
    expect([...result.state.filledCells.keys()].sort()).toEqual(["0:1", "1:1"]);
  });

  it("clips overlap and retains only newly filled cells", () => {
    const state = {
      ...createStencilState(squareMask, 2, 2),
      filledCells: new Map([["0:0", "T" as const]]),
    };
    const overlap = lockIntoStencil(state, squarePiece);

    expect(overlap.locked).toBe(true);
    expect(getStencilContributionCells(state, squarePiece)).toHaveLength(3);
    expect(overlap.state.filledCells.size).toBe(4);
    expect(overlap.state.filledCells.get("0:0")).toBe("T");
  });

  it("rejects a lock only when it adds no new stencil cells", () => {
    const state = {
      ...createStencilState(squareMask, 2, 2),
      filledCells: new Map([...squareMask].map((key) => [key, "O" as const])),
    };

    expect(canLockIntoStencil(state, squarePiece)).toBe(false);
    expect(lockIntoStencil(state, squarePiece)).toEqual({
      state,
      locked: false,
    });
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

  it("prefers a placement that retains all four cells when one exists", () => {
    const lineState = createStencilState(new Set(["0:0", "0:1", "0:2", "0:3"]), 1, 4);

    expect(findFirstLegalStencilPlacement(lineState, "I")).toEqual({
      type: "I",
      rotation: 0,
      row: -1,
      column: 0,
    });
    expect(findFirstLegalStencilPlacement(lineState, "O")).not.toBeNull();
  });

  it("allows movement beyond the canvas while one piece cell remains visible", () => {
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

    expect(moved.row).toBe(3);
    expect(moved.column).toBe(3);
    expect(rotated.rotation).toBe(3);
  });
});
