import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createBoardSession } from "../../game/engine/session";
import { RunGuidance } from "./RunGuidance";

describe("RunGuidance", () => {
  it("advances through each contextual hint only once per run", async () => {
    const user = userEvent.setup();
    const session = createBoardSession(["I", "O", "T"]);
    const { rerender } = render(<RunGuidance state={session} />);

    expect(screen.getByText("CLEAR LINES → EARN TRANSFERS")).toBeVisible();

    rerender(<RunGuidance state={{ ...session, transferCount: 1 }} />);
    expect(screen.getByText("TRANSFER READY → ROUTE WITH N")).toBeVisible();

    rerender(
      <RunGuidance
        state={{
          ...session,
          transferCount: 1,
          phase: "placing-stencil",
          stencilPiece: session.activePiece,
        }}
      />,
    );
    expect(screen.getByText("STENCIL MODE → PLACE, LOCK, OR CANCEL")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Dismiss guidance" }));
    expect(screen.queryByText(/STENCIL MODE/)).not.toBeInTheDocument();

    rerender(
      <RunGuidance
        state={{
          ...session,
          transferCount: 1,
          phase: "placing-stencil",
          stencilPiece: session.activePiece,
        }}
      />,
    );
    expect(screen.queryByText(/STENCIL MODE/)).not.toBeInTheDocument();
  });
});
