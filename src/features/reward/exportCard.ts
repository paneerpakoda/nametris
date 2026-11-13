import type { RunResult } from "../../game/engine/result";
import { pieceFill, token } from "../../design/tokens";
import { formatActiveTime } from "../../game/runtime/clock";

export { formatActiveTime } from "../../game/runtime/clock";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createStencilRects(result: RunResult): string {
  const gap = 3;
  const cellSize = Math.min(
    24,
    Math.max(
      8,
      Math.floor((1000 - (result.stencil.columns - 1) * gap) / result.stencil.columns),
    ),
  );
  const width = result.stencil.columns * cellSize + (result.stencil.columns - 1) * gap;
  const startX = (1200 - width) / 2;
  const startY = 215;
  const filled = new Map(result.stencil.filledCells);

  return result.stencil.mask
    .map((key) => {
      const [rowText, columnText] = key.split(":");
      const row = Number(rowText);
      const column = Number(columnText);
      const piece = filled.get(key);
      const fill = piece === undefined ? token("color-crt-surface") : pieceFill[piece];
      const stroke =
        piece === undefined ? token("color-signal") : token("color-plastic-shine");
      const opacity = piece === undefined ? "0.42" : "0.94";
      const x = startX + column * (cellSize + gap);
      const y = startY + row * (cellSize + gap);
      return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${fill}" stroke="${stroke}" stroke-opacity="${opacity}"/>`;
    })
    .join("");
}

export function createRewardSvg(result: RunResult): string {
  const badge =
    result.displayPercent === 100
      ? "PERFECT · 100%"
      : `NAME COMPLETE · ${result.displayPercent}%`;
  const stencilBottom = 215 + result.stencil.rows * 27;
  const plasticShine = token("color-plastic-shine");
  const plasticShade = token("color-plastic-shade");
  const crtSurface = token("color-crt-surface");
  const screen = token("color-screen");
  const ink = token("color-ink");
  const signal = token("color-signal");
  const cream = token("color-cream");
  const title = token("color-title");
  const muted = token("color-muted-dim");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="Nametris reward for ${escapeXml(result.name)}">
<defs><linearGradient id="plastic" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${plasticShine}"/><stop offset="1" stop-color="${plasticShade}"/></linearGradient><linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${crtSurface}"/><stop offset="1" stop-color="${screen}"/></linearGradient><pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse"><rect y="2" width="4" height="1" fill="#000000" fill-opacity="0.24"/></pattern></defs>
<rect width="1200" height="675" rx="42" fill="url(#plastic)"/><rect x="34" y="34" width="1132" height="607" rx="34" fill="${token("color-bezel")}"/><rect x="47" y="47" width="1106" height="581" rx="27" fill="url(#screen)" stroke="${ink}" stroke-width="5"/><rect x="47" y="47" width="1106" height="581" rx="27" fill="url(#scanlines)"/><rect x="65" y="65" width="1070" height="545" rx="18" fill="none" stroke="${signal}" stroke-opacity="0.58" stroke-width="2"/>
<text x="92" y="104" fill="${signal}" font-family="'Space Mono',monospace" font-size="22" font-weight="800" letter-spacing="7">NAMETRIS</text>
<text x="600" y="175" text-anchor="middle" fill="${cream}" font-family="'Space Mono',monospace" font-size="${Math.min(76, Math.floor(760 / result.name.length))}" font-weight="900" letter-spacing="9">${escapeXml(result.name)}</text>
${createStencilRects(result)}
<text x="600" y="${Math.max(430, stencilBottom + 62)}" text-anchor="middle" fill="${title}" font-family="'Space Mono',monospace" font-size="42" font-weight="850">${escapeXml(result.title)}</text>
<rect x="438" y="484" width="324" height="50" rx="5" fill="${signal}" fill-opacity="0.12" stroke="${signal}" stroke-opacity="0.8"/><text x="600" y="517" text-anchor="middle" fill="${signal}" font-family="'Space Mono',monospace" font-size="18" font-weight="800" letter-spacing="2">${badge}</text>
<text x="92" y="574" fill="${muted}" font-family="'Space Mono',monospace" font-size="18" font-weight="700">SCORE</text><text x="92" y="607" fill="${cream}" font-family="'Space Mono',monospace" font-size="30" font-weight="900">${result.score.toLocaleString("en-US")}</text>
<text x="1108" y="574" text-anchor="end" fill="${muted}" font-family="'Space Mono',monospace" font-size="18" font-weight="700">ACTIVE TIME</text><text x="1108" y="607" text-anchor="end" fill="${cream}" font-family="'Space Mono',monospace" font-size="30" font-weight="900">${formatActiveTime(result.activeMilliseconds)}</text>
</svg>`;
}
