import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("renders the Nametris welcome shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "NAMETRIS" })).toBeInTheDocument();
    expect(screen.getByText("Your name stays on this device.")).toBeInTheDocument();
  });
});
