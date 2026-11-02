import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createBoardSession } from "../../game/engine/session";
import { RunGuidance } from "./RunGuidance";

describe("RunGuidance", () => {
  it("teaches from the first piece, then the first name piece, then name mode", async () => {
    const user = userEvent.setup();
    const session = createBoardSession(["I", "O", "T"]);
    const { rerender } = render(<RunGuidance state={session} />);

    expect(
      screen.getByText("Fill a row to clear it. Each clear gives you a name piece."),
    ).toBeVisible();

    rerender(<RunGuidance state={{ ...session, transferCount: 1 }} />);
    expect(
      screen.getByText(
        "You earned a name piece. Press Shift while the piece is still above the blue line.",
      ),
    ).toBeVisible();

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
    expect(
      screen.getByText(
        "Move it onto your name and press Enter. Parts outside the outline are lost. Esc keeps the piece.",
      ),
    ).toBeVisible();

    rerender(<RunGuidance state={{ ...session, transferCount: 1 }} />);
    expect(screen.getByText("Fill 80% of your name to win.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Dismiss guidance" }));
    expect(screen.queryByText("Fill 80% of your name to win.")).not.toBeInTheDocument();

    rerender(<RunGuidance state={{ ...session, transferCount: 1 }} />);
    expect(screen.queryByLabelText("Current guidance")).not.toBeInTheDocument();
  });

  it("reopens the hint when Help asks", async () => {
    const user = userEvent.setup();
    const session = createBoardSession(["I", "O", "T"]);
    const { rerender } = render(<RunGuidance state={session} replayKey={0} />);

    await user.click(screen.getByRole("button", { name: "Dismiss guidance" }));
    expect(screen.queryByLabelText("Current guidance")).not.toBeInTheDocument();

    rerender(<RunGuidance state={session} replayKey={1} />);
    expect(
      screen.getByText("Fill a row to clear it. Each clear gives you a name piece."),
    ).toBeVisible();
  });
});
