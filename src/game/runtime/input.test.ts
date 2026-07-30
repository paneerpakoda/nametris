import { describe, expect, it } from "vitest";

import { getGameAction } from "./input";

describe("game keyboard input", () => {
  it("routes a newly spawned piece with N during normal play", () => {
    expect(getGameAction("n", "playing")).toEqual({ type: "route-to-stencil" });
  });

  it("maps four-direction stencil movement without gravity", () => {
    expect(getGameAction("ArrowLeft", "placing-stencil")).toEqual({
      type: "stencil-move",
      rowDelta: 0,
      columnDelta: -1,
    });
    expect(getGameAction("d", "placing-stencil")).toEqual({
      type: "stencil-move",
      rowDelta: 0,
      columnDelta: 1,
    });
    expect(getGameAction("w", "placing-stencil")).toEqual({
      type: "stencil-move",
      rowDelta: -1,
      columnDelta: 0,
    });
    expect(getGameAction("ArrowDown", "placing-stencil")).toEqual({
      type: "stencil-move",
      rowDelta: 1,
      columnDelta: 0,
    });
  });

  it("maps stencil rotation, locking, and cancellation", () => {
    expect(getGameAction("x", "placing-stencil")).toEqual({
      type: "stencil-rotate",
      direction: "clockwise",
    });
    expect(getGameAction("z", "placing-stencil")).toEqual({
      type: "stencil-rotate",
      direction: "counterclockwise",
    });
    expect(getGameAction("Enter", "placing-stencil")).toEqual({
      type: "stencil-lock",
    });
    expect(getGameAction(" ", "placing-stencil")).toEqual({
      type: "stencil-lock",
    });
    expect(getGameAction("Escape", "placing-stencil")).toEqual({
      type: "stencil-cancel",
    });
  });

  it("allows explicit pause during stencil placement", () => {
    expect(getGameAction("p", "placing-stencil")).toEqual({
      type: "pause",
      reason: "player",
    });
  });
});
