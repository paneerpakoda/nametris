import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { composeNameMask } from "../../game/glyphs/alphabet";
import { minimumLinesForName, nameLengthBand } from "./nameStats";
import { WelcomeScreen } from "./WelcomeScreen";

describe("WelcomeScreen", () => {
  it("presents onboarding inside the powered cabinet with a keyboard reference", () => {
    render(<WelcomeScreen onStart={vi.fn()} />);

    expect(
      screen.getByRole("region", { name: "Nametris arcade cabinet" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Welcome display" })).toBeInTheDocument();
    expect(screen.getByText("SHIFT").closest("kbd")).not.toBeNull();
    expect(screen.getByLabelText("Your name")).toBeVisible();
  });

  it("keeps Start disabled until the name has two letters", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);
    const start = screen.getByRole("button", { name: "Start building" });

    expect(start).toBeDisabled();
    await user.type(screen.getByLabelText("Your name"), "J");
    expect(start).toBeDisabled();
    await user.type(screen.getByLabelText("Your name"), "O");
    expect(start).toBeEnabled();
    await user.click(start);
    expect(onStart).toHaveBeenCalledWith("JO");
  });

  it("strips non-letters, caps the field at 5, and explains the specific rule", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<WelcomeScreen onStart={onStart} />);
    const input = screen.getByLabelText("Your name");
    const start = screen.getByRole("button", { name: "Start building" });

    await user.type(input, "A1");
    expect(input).toHaveValue("A");
    expect(screen.getByRole("alert")).toHaveTextContent(/^Letters A-Z only$/);
    expect(start).toBeDisabled();

    await user.clear(input);
    await user.type(input, "ABCDEF");
    expect(input).toHaveValue("ABCDE");
    expect(screen.getByRole("alert")).toHaveTextContent(/^Maximum 5 letters$/);

    await user.clear(input);
    await user.click(input);
    await user.paste("ABCDEF");
    expect(input).toHaveValue("ABCDE");
    expect(screen.getByRole("alert")).toHaveTextContent(/^Maximum 5 letters$/);

    await user.clear(input);
    await user.click(input);
    await user.paste("AB1");
    expect(input).toHaveValue("AB");
    expect(screen.getByRole("alert")).toHaveTextContent(/^Letters A-Z only$/);

    expect(start).toBeEnabled();
    await user.click(start);
    expect(onStart).toHaveBeenCalledWith("AB");
  });

  it("shows the maximum-length alert once when a stored name was trimmed", () => {
    render(
      <WelcomeScreen onStart={vi.fn()} initialName="HARSH" initialNameTrimmed />,
    );

    expect(screen.getByLabelText("Your name")).toHaveValue("HARSH");
    expect(screen.getByRole("alert")).toHaveTextContent(/^Maximum 5 letters$/);
  });

  it("shows a live cell count, length band, and a minimum line estimate", async () => {
    const user = userEvent.setup();
    render(<WelcomeScreen onStart={vi.fn()} />);

    await user.type(screen.getByLabelText("Your name"), "JO");
    const cells = composeNameMask("JO").cells.size;

    expect(
      screen.getByText(`JO - ${cells} cells - ${nameLengthBand(cells)}`),
    ).toBeVisible();
    expect(
      screen.getByText(`needs at least about ${minimumLinesForName(cells)} lines`),
    ).toBeVisible();
  });
});
