import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DesignSite } from "./DesignSite";

describe("DesignSite", () => {
  it("shows foundations, components, patterns, and a way back to the game", async () => {
    const user = userEvent.setup();
    render(<DesignSite />);

    expect(screen.getByRole("heading", { name: "Design system" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Materials" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pieces" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    expect(document.getElementById("pieces")?.textContent).toContain("#36cdd7");
    expect(
      screen.getAllByRole("button", { name: "Play again" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Play the game" })[0]).toHaveAttribute(
      "href",
      import.meta.env.BASE_URL,
    );

    await user.click(screen.getByRole("button", { name: "Replay motion" }));
    expect(screen.getByText("1800ms")).toBeInTheDocument();
  });
});
