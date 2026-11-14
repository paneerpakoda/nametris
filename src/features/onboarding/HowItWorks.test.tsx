import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HowItWorks } from "./HowItWorks";

describe("HowItWorks", () => {
  it("walks three skippable screens and remembers completion through onDone", async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(<HowItWorks onDone={onDone} />);

    expect(
      screen.getByRole("heading", { name: "Fill your name to 80% to win." }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("heading", {
        name: "Clear a row, then press Shift to stamp a name piece onto your name.",
      }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "The keys" })).toBeVisible();
    expect(screen.getByText("Move")).toBeVisible();
    expect(screen.getByText("Soft drop")).toBeVisible();
    expect(screen.getByText("Hard drop")).toBeVisible();
    expect(screen.getByText("Stamp a name piece")).toBeVisible();
    expect(screen.getByText("Pause")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("lets escape skip the first-run screens", async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(<HowItWorks onDone={onDone} />);

    await user.keyboard("{Escape}");
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("traps tab in the overlay and returns escape to help", async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    const onEscape = vi.fn();
    render(<HowItWorks overlay onDone={onDone} onEscape={onEscape} />);

    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Skip" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(onEscape).toHaveBeenCalledOnce();
    expect(onDone).not.toHaveBeenCalled();
  });
});
