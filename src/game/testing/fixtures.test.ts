import { describe, expect, it } from "vitest";

import { getStencilCompletion } from "../engine/stencil";
import { createBoardSession, reduceBoardSession } from "../engine/session";
import { createE2EFixture } from "./fixtures";

const baseSession = createBoardSession(["O", "I", "T", "J", "L"]);

describe("deterministic browser fixtures", () => {
  it("earns one transfer from a deterministic line clear", () => {
    const fixture = createE2EFixture(baseSession, "line-clear");
    const cleared = reduceBoardSession(fixture, { type: "hard-drop" });

    expect(cleared.linesCleared).toBe(fixture.linesCleared + 1);
    expect(cleared.transferCount).toBe(1);
  });

  it("routes, locks, and returns to normal play", () => {
    const fixture = createE2EFixture(baseSession, "route-return");
    const placing = reduceBoardSession(fixture, { type: "route-to-stencil" });
    const locked = reduceBoardSession(placing, { type: "stencil-lock" });

    expect(placing.phase).toBe("placing-stencil");
    expect(locked.phase).toBe("playing");
    expect(locked.transferCount).toBe(0);
    expect(getStencilCompletion(locked.stencil).displayPercent).toBe(50);
  });

  it("keeps exact-80 fixture gameplay active until finish is claimed", () => {
    const fixture = createE2EFixture(baseSession, "eighty");
    const continued = reduceBoardSession(fixture, { type: "hard-drop" });
    const finished = reduceBoardSession(continued, { type: "finish-run" });

    expect(getStencilCompletion(fixture.stencil).ratio).toBe(0.8);
    expect(fixture.phase).toBe("playing");
    expect(continued.phase).toBe("playing");
    expect(finished.phase).toBe("won");
  });

  it("auto-finishes the perfect-ready fixture after one legal lock", () => {
    const fixture = createE2EFixture(baseSession, "perfect-ready");
    const placing = reduceBoardSession(fixture, { type: "route-to-stencil" });
    const locked = reduceBoardSession(placing, { type: "stencil-lock" });

    expect(locked.phase).toBe("won");
    expect(getStencilCompletion(locked.stencil).perfect).toBe(true);
  });

  it("loses the topout fixture despite finish already being available", () => {
    const fixture = createE2EFixture(baseSession, "topout-eighty");
    const lost = reduceBoardSession(fixture, { type: "hard-drop" });

    expect(fixture.canFinish).toBe(true);
    expect(lost.phase).toBe("lost");
  });
});
