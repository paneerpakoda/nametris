import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TouchPad } from "./TouchPad";

describe("TouchPad", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("repeats held movement and fires hard drop once", () => {
    vi.useFakeTimers();
    const onInput = vi.fn();
    render(<TouchPad phase="playing" onInput={onInput} />);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Touch move left" }));
    expect(onInput).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(499);
    expect(onInput).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    vi.advanceTimersByTime(33);
    expect(onInput).toHaveBeenCalledTimes(2);
    fireEvent.pointerUp(screen.getByRole("button", { name: "Touch move left" }));
    vi.advanceTimersByTime(200);
    expect(onInput).toHaveBeenCalledTimes(2);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Touch hard drop" }));
    vi.advanceTimersByTime(800);
    expect(onInput).toHaveBeenCalledTimes(3);
    expect(onInput).toHaveBeenLastCalledWith(" ");
  });

  it("adds an up key and lock or cancel while placing a name piece", () => {
    const onInput = vi.fn();
    render(<TouchPad phase="placing-stencil" onInput={onInput} />);

    expect(screen.getByRole("button", { name: "Touch move up" })).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Touch lock" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Touch cancel" }));
    expect(onInput).toHaveBeenNthCalledWith(1, "Enter");
    expect(onInput).toHaveBeenNthCalledWith(2, "Escape");
    expect(
      screen.queryByRole("button", { name: "Touch hard drop" }),
    ).not.toBeInTheDocument();
  });
});
