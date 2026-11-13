import { approvedTokens } from "../design/tokenContract";
import { playerTitles } from "../game/config/titles";
import type { LossResult, RunResult } from "../game/engine/result";
import type { PieceType } from "../game/model/types";

export type TokenName = keyof typeof approvedTokens;

export interface Swatch {
  readonly token: TokenName;
  readonly role: string;
}

export interface SwatchGroup {
  readonly id: string;
  readonly title: string;
  readonly note: string;
  readonly swatches: readonly Swatch[];
}

export const catalogNav = [
  {
    label: "Foundations",
    items: [
      ["materials", "Materials"],
      ["color", "Color"],
      ["pieces", "Pieces"],
      ["type", "Type"],
      ["space", "Space"],
      ["shape", "Shape"],
      ["motion", "Motion"],
      ["focus", "Focus"],
    ],
  },
  {
    label: "Components",
    items: [
      ["buttons", "Buttons"],
      ["field", "Name field"],
      ["keys", "Keys"],
      ["metrics", "Metrics"],
      ["boards", "Boards"],
      ["dialog", "Help"],
      ["reward", "Reward card"],
      ["mark", "Mark"],
    ],
  },
  {
    label: "Patterns",
    items: [
      ["welcome", "Welcome"],
      ["play", "Play"],
      ["result", "Result"],
      ["voice", "Voice"],
    ],
  },
] as const;

export const colorGroups: readonly SwatchGroup[] = [
  {
    id: "ivory",
    title: "Ivory and ink",
    note: "Plastic, CRT text, and the letters a player types.",
    swatches: [
      { token: "color-ivory-50", role: "Text on a primary button" },
      { token: "color-ivory-100", role: "CRT text" },
      { token: "color-ivory-200", role: "Line-clear sweep" },
      { token: "color-ivory-300", role: "Cabinet edge" },
      { token: "color-ivory-400", role: "Cabinet face" },
      { token: "color-ivory-500", role: "Cabinet shade" },
      { token: "color-cream", role: "Exported name" },
      { token: "color-muted", role: "Secondary CRT text" },
      { token: "color-muted-dim", role: "Exported metric labels" },
      { token: "color-ink", role: "Text on ivory" },
      { token: "color-plaque-ink", role: "Text on the win plaque" },
      { token: "color-name", role: "Typed name" },
    ],
  },
  {
    id: "gold",
    title: "Gold and amber",
    note: "Titles use the gold gradient. Amber is the warning light.",
    swatches: [
      { token: "color-gold-50", role: "Gradient top" },
      { token: "color-gold-200", role: "Gradient middle" },
      { token: "color-gold-500", role: "Gradient foot" },
      { token: "color-gold-400", role: "Flat gold" },
      { token: "color-amber", role: "Warnings and a full bank" },
      { token: "color-amber-deep", role: "Win plaque" },
      { token: "color-focus", role: "Focus ring on the CRT" },
      { token: "color-title", role: "Title on the exported card" },
      { token: "color-finish", role: "Finish-prompt copy" },
      { token: "color-lost", role: "Stencil cells that will not stay" },
    ],
  },
  {
    id: "signal",
    title: "Signal reds",
    note: "Each red has one job. Phosphor is light. The button is paint. Signal frames the card.",
    swatches: [
      { token: "color-phosphor", role: "CRT text and open stencil" },
      { token: "color-signal", role: "Reward frame and export" },
      { token: "color-signal-hot", role: "Gameplay hairlines" },
      { token: "color-button", role: "Primary action" },
      { token: "color-button-hover", role: "Primary hover" },
      { token: "color-danger-solid", role: "Too-high tag" },
      { token: "color-ember", role: "Welcome glow" },
      { token: "color-ember-shadow", role: "Shadow under gold type" },
      { token: "color-welcome", role: "Welcome supporting copy" },
      { token: "color-welcome-deep", role: "Name-field underline" },
      { token: "color-error", role: "Field error" },
      { token: "color-disabled-label", role: "Disabled welcome label" },
    ],
  },
  {
    id: "route",
    title: "Route blue",
    note: "Route blue means send this piece to the name.",
    swatches: [
      { token: "color-route", role: "Deadline and route prompt" },
      { token: "color-route-deep", role: "Route label chip" },
      { token: "color-route-ink", role: "Text on the route chip" },
      { token: "color-mark-glow", role: "Welcome mark glow only" },
    ],
  },
  {
    id: "surfaces",
    title: "Surfaces",
    note: "The room, the glass, and the wells controls sit in.",
    swatches: [
      { token: "color-stage", role: "Page behind the cabinet" },
      { token: "color-crt", role: "Screen" },
      { token: "color-screen", role: "Board well" },
      { token: "color-crt-surface", role: "Exported screen" },
      { token: "color-surface", role: "Raised CRT surface" },
      { token: "color-surface-high", role: "Header controls" },
      { token: "color-dialog", role: "Help dialog" },
      { token: "color-field", role: "Name field" },
      { token: "color-overlay", role: "Pause and help scrim" },
      { token: "color-void", role: "Block shadow" },
    ],
  },
];

export const stateSwatches: readonly Swatch[] = [
  { token: "color-stencil-open", role: "Open stencil cell" },
  { token: "color-stencil-open-border", role: "Open stencil edge" },
  { token: "color-stencil-edge", role: "Filled mino edge" },
  { token: "color-ghost", role: "Ghost fill" },
  { token: "color-ghost-border", role: "Ghost edge" },
  { token: "color-board-line", role: "Board grid" },
  { token: "color-board-well", role: "Empty cell" },
  { token: "color-signal-hot-frame", role: "Board frame" },
  { token: "color-danger-edge", role: "Top-out inset" },
  { token: "color-metric-fill", role: "Metric fill" },
];

export const pieceSwatches: readonly {
  readonly type: PieceType;
  readonly token: TokenName;
  readonly columns: number;
  readonly rows: number;
  readonly filled: readonly number[];
}[] = [
  { type: "I", token: "color-piece-i", columns: 4, rows: 1, filled: [0, 1, 2, 3] },
  { type: "O", token: "color-piece-o", columns: 2, rows: 2, filled: [0, 1, 2, 3] },
  { type: "T", token: "color-piece-t", columns: 3, rows: 2, filled: [0, 1, 2, 4] },
  { type: "S", token: "color-piece-s", columns: 3, rows: 2, filled: [1, 2, 3, 4] },
  { type: "Z", token: "color-piece-z", columns: 3, rows: 2, filled: [0, 1, 4, 5] },
  { type: "J", token: "color-piece-j", columns: 3, rows: 2, filled: [0, 3, 4, 5] },
  { type: "L", token: "color-piece-l", columns: 3, rows: 2, filled: [2, 3, 4, 5] },
];

export const markSwatches: readonly Swatch[] = [
  { token: "color-mark-lime", role: "Mark, top" },
  { token: "color-mark-red", role: "Mark, middle left" },
  { token: "color-mark-yellow", role: "Mark, middle right" },
  { token: "color-mark-blue", role: "Mark, bottom" },
];

export const layoutMeasures = [
  ["chrome", "Playfield chrome"],
  ["side", "Side column"],
  ["cell", "Board cell, before a specimen pins it"],
  ["cabinet-max", "Cabinet width"],
  ["chrome-compact", "Chrome below 699px"],
  ["side-compact", "Side column below 699px"],
] as const satisfies readonly (readonly [TokenName, string])[];

export const breakpoints = [
  ["breakpoint-compact", "Cabinet chrome drops"],
  ["breakpoint-console", "Control deck tightens"],
  ["breakpoint-short", "Short cabinet"],
  ["breakpoint-design-width", "Designed width"],
  ["breakpoint-design-height", "Designed height"],
] as const satisfies readonly (readonly [TokenName, string])[];

export const spaceSteps = [
  "space-2xs",
  "space-xs",
  "space-sm",
  "space-md",
  "space-lg",
  "space-xl",
  "space-2xl",
  "space-3xl",
] as const satisfies readonly TokenName[];

export const radii = [
  ["radius-cell", "Minos and the mark"],
  ["radius-hint", "Hints and metrics"],
  ["radius-control", "Help dialog"],
  ["radius-medium", "Cabinet keys"],
  ["radius-button", "Buttons and the name field"],
  ["radius-card", "Reward card"],
  ["radius-large", "Larger panels"],
  ["radius-bezel", "Glass and bezel"],
  ["radius-console", "Control deck"],
] as const satisfies readonly (readonly [TokenName, string])[];

export const motionSteps = [
  ["duration-instant", "Grey-in"],
  ["duration-press", "Key travel"],
  ["duration-lock", "Soft-lock flash"],
  ["duration-bump", "Hard-drop bump"],
  ["duration-trail", "Hard-drop trail"],
  ["duration-key", "Key brighten"],
  ["duration-flash", "Color flash"],
  ["duration-shine", "Reward shine"],
  ["duration-pop", "Score and name pop"],
  ["duration-tick", "Counter tick"],
  ["duration-sweep", "Cleared-row sweep"],
  ["duration-flight", "Piece flight"],
  ["duration-letter", "Letter flash"],
  ["duration-level", "Level ripple"],
  ["duration-grey", "Grey stack hold"],
  ["duration-word", "Clear word"],
  ["duration-clear", "Line-clear receipt"],
  ["duration-clear-reduced", "Receipt, reduced motion"],
  ["duration-pulse", "Danger pulse"],
  ["duration-shift", "Shift-ready glow"],
  ["duration-bank", "Full transfer bank"],
] as const satisfies readonly (readonly [TokenName, string])[];

export const depthSteps = [
  ["z-below", "Shine and keycap face"],
  ["z-raised", "Inside a board"],
  ["z-wash", "Inside a board"],
  ["z-route", "Route line"],
  ["z-tag", "Tags on the board"],
  ["z-flight", "Piece in flight"],
  ["z-feedback", "Clear feedback"],
  ["z-burst", "Burst"],
  ["z-crt", "Scanlines over the glass"],
  ["z-dialog", "Pause and help"],
  ["z-modal", "Finish prompt"],
] as const satisfies readonly (readonly [TokenName, string])[];

export const sampleResult: RunResult = {
  outcome: "won",
  name: "MAYA",
  completionRatio: 0.75,
  displayPercent: 75,
  score: 12840,
  activeMilliseconds: 186000,
  title: playerTitles.blockPoet,
  linesCleared: 14,
  level: 2,
  fourLineClears: 1,
  routedAttempts: 6,
  successfulStencilLocks: 5,
  canceledRoutes: 1,
  distinctStencilPieceTypes: 4,
  maximumBoardStackHeight: 9,
  stencilCellsFilled: 6,
  stencil: {
    rows: 2,
    columns: 4,
    mask: ["0:0", "0:1", "0:2", "0:3", "1:0", "1:1", "1:2", "1:3"],
    filledCells: [
      ["0:0", "T"],
      ["0:1", "T"],
      ["0:2", "O"],
      ["1:0", "J"],
      ["1:1", "L"],
      ["1:2", "S"],
    ],
  },
};

export const sampleLoss: LossResult = {
  outcome: "lost",
  name: "MAYA",
  completionRatio: 0.38,
  displayPercent: 38,
  score: 4200,
  activeMilliseconds: 96000,
  linesCleared: 6,
  level: 1,
  fourLineClears: 0,
  routedAttempts: 3,
  successfulStencilLocks: 2,
  canceledRoutes: 1,
  distinctStencilPieceTypes: 2,
  maximumBoardStackHeight: 20,
  stencilCellsFilled: 3,
  stencil: {
    rows: 2,
    columns: 4,
    mask: sampleResult.stencil.mask,
    filledCells: sampleResult.stencil.filledCells.slice(0, 3),
  },
};

export function tokenValue(token: TokenName): string {
  return approvedTokens[token];
}
