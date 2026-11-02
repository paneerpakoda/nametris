import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { PauseSoundSettings } from "./JuiceControls";
import { juicePreferenceKey, resetJuicePreferenceMemory } from "./preferences";

afterEach(() => {
  resetJuicePreferenceMemory();
});

describe("pause sound settings", () => {
  it("toggles mute, volume, reduced motion, and move sounds from the keyboard", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PauseSoundSettings />);

    expect(screen.getByRole("button", { name: "Mute sound" })).toHaveAttribute(
      "aria-keyshortcuts",
      "M",
    );
    await user.click(screen.getByRole("button", { name: "Mute sound" }));
    expect(screen.getByRole("button", { name: "Unmute sound" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    const volume = screen.getByLabelText("Volume");
    expect(volume).toHaveAttribute("type", "range");
    volume.focus();
    expect(volume).toHaveFocus();
    fireEvent.change(volume, { target: { value: "0.8" } });
    expect(volume).toHaveValue("0.8");

    await user.click(screen.getByRole("button", { name: "Reduced motion" }));
    expect(screen.getByRole("button", { name: "Reduced motion" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Move sounds" }));
    expect(screen.getByRole("button", { name: "Move sounds" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    expect(
      JSON.parse(window.localStorage.getItem(juicePreferenceKey) ?? ""),
    ).toMatchObject({
      muted: true,
      volume: 0.8,
      reducedMotion: true,
      moveSounds: true,
    });

    unmount();
    render(<PauseSoundSettings />);
    expect(screen.getByRole("button", { name: "Unmute sound" })).toBeInTheDocument();
    expect(screen.getByLabelText("Volume")).toHaveValue("0.8");
  });
});
