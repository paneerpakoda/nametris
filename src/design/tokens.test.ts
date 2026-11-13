import { describe, expect, it } from "vitest";

import cabinetCss from "../styles/cabinet.css?raw";
import gameplayCss from "../styles/gameplay.css?raw";
import globalsCss from "../styles/globals.css?raw";
import rewardCss from "../styles/reward.css?raw";
import tokenCss from "../styles/tokens.css?raw";
import { approvedAliases, approvedTokens } from "./tokenContract";
import {
  durationNames,
  ms,
  pieceFill,
  readDesignTokens,
  token,
  unitless,
  unitlessNames,
} from "./tokens";

const declarations = readDesignTokens(tokenCss);

describe("Nametris design tokens", () => {
  it("matches the approved palette, materials, type, space, and motion", () => {
    const actual: Record<string, string> = {};
    const aliases: Record<string, string> = {};

    for (const [name, value] of declarations) {
      if (/^var\(--[a-z0-9-]+\)$/.test(value)) {
        aliases[name] = value;
      } else {
        actual[name] = value;
      }
    }

    expect(actual).toEqual(approvedTokens);
    expect(aliases).toEqual(approvedAliases);
  });

  it("points every screen alias at a real palette token", () => {
    for (const value of Object.values(approvedAliases)) {
      const target = value.match(/^var\(--([a-z0-9-]+)\)$/)?.[1];
      expect(target, value).toEqual(expect.any(String));
      if (target === undefined) {
        return;
      }
      expect(approvedTokens).toHaveProperty(target);
    }
  });

  it("serves the same values to SVG and motion code", () => {
    expect(token("color-piece-i")).toBe(pieceFill.I);
    expect(pieceFill).toEqual({
      I: "#36cdd7",
      O: "#f0c92e",
      T: "#a65bd5",
      S: "#46bf68",
      Z: "#e85555",
      J: "#377bd7",
      L: "#ed762d",
    });
    expect(ms("duration-clear")).toBe(900);
    expect(ms("duration-clear-reduced")).toBe(1_200);
    expect(ms("duration-pop")).toBe(180);
    expect(ms("duration-flight")).toBe(250);
    expect(unitless("spring-tilt-stiffness")).toBe(230);
    expect(unitless("spring-tilt-damping")).toBe(24);
    expect(unitless("spring-tilt-degrees")).toBe(7);
    expect(unitless("spring-tilt-perspective")).toBe(900);

    for (const name of durationNames) {
      expect(token(name)).toMatch(/^\d+ms$/);
    }
    for (const name of unitlessNames) {
      expect(token(name)).toMatch(/^\d+$/);
    }
  });

  it("keeps piece fills, screen layers, and breakpoints wired to the contract", () => {
    for (const piece of ["i", "o", "t", "s", "z", "j", "l"]) {
      expect(gameplayCss).toContain(`background: var(--color-piece-${piece});`);
    }

    expect(gameplayCss).toContain("z-index: var(--z-dialog);");
    expect(gameplayCss).toContain("z-index: var(--z-modal);");
    expect(cabinetCss).toContain("z-index: var(--z-crt);");
    expect(cabinetCss).toContain("min(var(--cabinet-max), 100%)");
    expect(globalsCss).toContain("max-width: 699px");
    expect(globalsCss).toContain("--chrome: var(--chrome-compact);");
    expect(globalsCss).toContain("--side: var(--side-compact);");
    expect(cabinetCss).toContain("max-width: 1099px");
    expect(cabinetCss).toContain("max-height: 800px");
    expect(gameplayCss).toContain("max-height: 800px");
    expect(rewardCss).toContain("max-height: 800px");
    expect(approvedTokens["breakpoint-compact"]).toBe("699px");
    expect(approvedTokens["font-display"]).toContain("PP NeueBit");
    expect(approvedTokens["font-ui"]).toContain("Space Mono");
  });
});
