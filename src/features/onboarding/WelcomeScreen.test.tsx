import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WelcomeScreen } from "./WelcomeScreen";

describe("WelcomeScreen", () => {
  it("presents onboarding inside the powered cabinet with a keyboard reference", () => {
    render(<WelcomeScreen onStart={vi.fn()} />);

    expect(
      screen.getByRole("region", { name: "Nametris arcade cabinet" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Welcome display" })).toBeInTheDocument();
    expect(screen.getByText("SHIFT").closest("kbd")).not.toBeNull();
  });

  it("starts HARSH when the optional field is empty", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);

    await user.click(screen.getByRole("button", { name: "Start building" }));

    expect(onStart).toHaveBeenCalledWith("HARSH");
  });

  it("normalizes a custom name before starting", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);

    await user.type(screen.getByLabelText("Your name (optional)"), " anmol ");
    await user.click(screen.getByRole("button", { name: "Start building" }));

    expect(onStart).toHaveBeenCalledWith("ANMOL");
  });

  it("associates an accessible error with invalid input", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);

    const input = screen.getByLabelText("Your name (optional)");
    await user.type(input, "A1");
    await user.click(screen.getByRole("button", { name: "Start building" }));

    expect(input).toHaveAccessibleErrorMessage(
      "Use 2–10 English letters without spaces or symbols.",
    );
    expect(onStart).not.toHaveBeenCalled();
  });
});
