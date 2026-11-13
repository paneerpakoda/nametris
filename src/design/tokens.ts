import raw from "../styles/tokens.css?raw";

import type { PieceType } from "../game/model/types";

/** Collapse authoring whitespace so a wrapped declaration matches its one-line form. */
export function normalizeTokenValue(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function readDesignTokens(css: string): ReadonlyMap<string, string> {
  const declarations = new Map<string, string>();

  for (const match of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    const name = match[1];
    const rawValue = match[2];
    if (name === undefined || rawValue === undefined) {
      continue;
    }
    if (declarations.has(name)) {
      throw new Error(`Design token --${name} is declared more than once.`);
    }
    declarations.set(name, normalizeTokenValue(rawValue));
  }

  return declarations;
}

const declarations = readDesignTokens(raw);

export function token(name: string): string {
  const value = declarations.get(name);
  if (value === undefined) {
    throw new Error(`Missing design token --${name}.`);
  }
  return value;
}

export const durationNames = [
  "duration-instant",
  "duration-press",
  "duration-lock",
  "duration-bump",
  "duration-trail",
  "duration-key",
  "duration-flash",
  "duration-shine",
  "duration-pop",
  "duration-tick",
  "duration-sweep",
  "duration-flight",
  "duration-letter",
  "duration-level",
  "duration-grey",
  "duration-word",
  "duration-clear",
  "duration-clear-reduced",
  "duration-pulse",
  "duration-shift",
  "duration-bank",
] as const;

export type DurationName = (typeof durationNames)[number];

export function ms(name: DurationName): number {
  const value = token(name);
  if (!/^\d+ms$/.test(value)) {
    throw new Error(`--${name} must be a millisecond duration.`);
  }
  return Number.parseInt(value, 10);
}

export const unitlessNames = [
  "spring-tilt-stiffness",
  "spring-tilt-damping",
  "spring-tilt-degrees",
  "spring-tilt-perspective",
] as const;

export type UnitlessName = (typeof unitlessNames)[number];

export function unitless(name: UnitlessName): number {
  const value = token(name);
  if (!/^-?\d+$/.test(value)) {
    throw new Error(`--${name} must be a unitless number.`);
  }
  return Number(value);
}

export const pieceFill = {
  I: token("color-piece-i"),
  O: token("color-piece-o"),
  T: token("color-piece-t"),
  S: token("color-piece-s"),
  Z: token("color-piece-z"),
  J: token("color-piece-j"),
  L: token("color-piece-l"),
} as const satisfies Record<PieceType, string>;
