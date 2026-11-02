import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ControlDeck } from "./ControlDeck";

describe("ControlDeck", () => {
  it("renders non-interactive keyboard references without an input handler", () => {
    render(<ControlDeck />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByText("SHIFT").closest("kbd")).not.toBeNull();
    expect(screen.getByText("SPACE").closest("kbd")).not.toBeNull();
    expect(
      screen.getByLabelText("Cabinet controls").querySelectorAll("svg.lucide"),
    ).toHaveLength(8);
  });

  it("emits real keyboard inputs from the playing controls", async () => {
    const user = userEvent.setup();
    const onInput = vi.fn();
    render(<ControlDeck phase="playing" canRoute canLock onInput={onInput} />);

    await user.click(screen.getByRole("button", { name: "Move left" }));
    await user.click(screen.getByRole("button", { name: "Hard drop" }));
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onInput.mock.calls.map(([key]) => key)).toEqual(["ArrowLeft", " ", "Shift"]);
  });

  it("disables routing when the active piece cannot be routed", () => {
    render(
      <ControlDeck
        phase="playing"
        canRoute={false}
        canLock={false}
        onInput={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("switches to placement controls while the stencil is active", async () => {
    const user = userEvent.setup();
    const onInput = vi.fn();
    render(
      <ControlDeck
        phase="placing-stencil"
        canRoute={false}
        canLock
        onInput={onInput}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Move piece up" }));
    await user.click(screen.getByRole("button", { name: "Lock piece" }));
    await user.click(screen.getByRole("button", { name: "Cancel placement" }));

    expect(onInput.mock.calls.map(([key]) => key)).toEqual([
      "ArrowUp",
      "Enter",
      "Escape",
    ]);
    expect(screen.queryByRole("button", { name: "Hard drop" })).not.toBeInTheDocument();
  });

  it("disables locking when placement would keep no cells", () => {
    render(
      <ControlDeck
        phase="placing-stencil"
        canRoute={false}
        canLock={false}
        onInput={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Lock piece" })).toBeDisabled();
  });

  it("offers a resume key while paused", async () => {
    const user = userEvent.setup();
    const onInput = vi.fn();
    render(
      <ControlDeck phase="paused" canRoute={false} canLock={false} onInput={onInput} />,
    );

    await user.click(screen.getByRole("button", { name: "Resume using cabinet key" }));

    expect(onInput).toHaveBeenCalledWith("p");
  });
});
