// ─── Player title evaluation ────────────────────────────────────────────────────

import { TITLE_CONFIG, PERFECT_COMPLETION } from "./config";
import { DerivedMetrics } from "./metrics";

export interface Title {
  name: string;
  blurb: string;
}

// Perfect (exactly 100%) titles are evaluated first, then 80–99% titles.
export function evaluateTitle(m: DerivedMetrics): Title {
  const c = TITLE_CONFIG;

  if (m.completion >= PERFECT_COMPLETION) {
    if (m.secondsPerStencilPiece <= c.perfectTurboSecondsPerPiece)
      return { name: "THE ONE-HUNDRED WONDER", blurb: "A perfect name, delivered at blistering speed." };
    if (m.scorePerClearedLine >= c.perfectAlchemistScorePerLine)
      return { name: "PIXEL-PERFECT NAME ALCHEMIST", blurb: "You turned cleared lines into pure gold." };
    return { name: "CROWNED BLOCKSMITH", blurb: "A flawless build, forged block by block." };
  }

  if (m.completion >= c.stencilSorcererMinCompletion)
    return { name: "STENCIL SORCERER", blurb: "Almost perfect — the stencil bends to your will." };
  if (m.secondsPerStencilPiece <= c.turboSecondsPerPiece)
    return { name: "TURBO TYPESETTER", blurb: "You set your name faster than most can read it." };
  if (m.tetrisCount >= 1 || m.scorePerClearedLine >= c.lineDanceScorePerLine)
    return { name: "LINE-DANCE LEGEND", blurb: "Big clears, bigger style." };
  if (m.placementEfficiency >= c.shapeWhispererEfficiency && m.distinctTypes >= c.shapeWhispererDistinctTypes)
    return { name: "SHAPE WHISPERER", blurb: "Every shape found its perfect home." };
  return { name: "BLOCK-POET", blurb: "You built your name with quiet craft." };
}
