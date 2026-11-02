import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HIDDEN_BOARD_ROWS, createEmptyBoard } from "../../game/engine/board";
import { createBoardSession } from "../../game/engine/session";
import { stackNearDeadline, useJuiceFrame } from "./frame";

describe("danger edge", () => {
  it("lights when the stack is within three rows of the top", () => {
    const safe = createEmptyBoard().map((row) => [...row]);
    const dangerRow = safe[HIDDEN_BOARD_ROWS + 2];
    expect(dangerRow).toBeDefined();
    if (dangerRow !== undefined) {
      dangerRow[0] = "I";
    }
    expect(stackNearDeadline(safe)).toBe(true);

    const low = createEmptyBoard().map((row) => [...row]);
    const lowRow = low[HIDDEN_BOARD_ROWS + 3];
    if (lowRow !== undefined) {
      lowRow[0] = "I";
    }
    expect(stackNearDeadline(low)).toBe(false);
  });

  it("counts down from three and shows the new level as text", async () => {
    const session = createBoardSession(["O", "I", "T"]);
    const { result, rerender } = renderHook(({ state }) => useJuiceFrame(state), {
      initialProps: { state: session },
    });

    await waitFor(() => expect(result.current.countdown).toMatch(/3|Ready/));
    rerender({ state: { ...session, level: 2 } });
    await waitFor(() => expect(result.current.levelUp).toBe(2));
    expect(result.current.danger).toBe(false);
  });
});
