import type { PieceType } from "../../game/model/types";
import type { RunResult } from "../../game/engine/result";
import { formatActiveTime } from "../../game/runtime/clock";

export { formatActiveTime } from "../../game/runtime/clock";

const pieceColors: Readonly<Record<PieceType, string>> = {
  I: "#3c9ef5",
  O: "#f5c546",
  T: "#b261db",
  S: "#8fd43d",
  Z: "#f04434",
  J: "#286fc1",
  L: "#f3a232",
};

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
      const fill = piece === undefined ? "#10140f" : pieceColors[piece];
      const stroke = piece === undefined ? "#f04434" : "#f1d3a0";
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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="Nametris reward for ${escapeXml(result.name)}">
<defs><linearGradient id="plastic" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f1d3a0"/><stop offset="1" stop-color="#cba675"/></linearGradient><linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#10140f"/><stop offset="1" stop-color="#060806"/></linearGradient><pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse"><rect y="2" width="4" height="1" fill="#000000" fill-opacity="0.24"/></pattern></defs>
<rect width="1200" height="675" rx="42" fill="url(#plastic)"/><rect x="34" y="34" width="1132" height="607" rx="34" fill="#9f7a4e"/><rect x="47" y="47" width="1106" height="581" rx="27" fill="url(#screen)" stroke="#49341c" stroke-width="5"/><rect x="47" y="47" width="1106" height="581" rx="27" fill="url(#scanlines)"/><rect x="65" y="65" width="1070" height="545" rx="18" fill="none" stroke="#f04434" stroke-opacity="0.58" stroke-width="2"/>
<text x="92" y="104" fill="#f04434" font-family="monospace" font-size="22" font-weight="800" letter-spacing="7">NAMETRIS</text>
<text x="600" y="175" text-anchor="middle" fill="#ede6d3" font-family="monospace" font-size="${Math.min(76, Math.floor(760 / result.name.length))}" font-weight="900" letter-spacing="9">${escapeXml(result.name)}</text>
${createStencilRects(result)}
<text x="600" y="${Math.max(430, stencilBottom + 62)}" text-anchor="middle" fill="#f3a232" font-family="monospace" font-size="42" font-weight="850">${escapeXml(result.title)}</text>
<rect x="438" y="484" width="324" height="50" rx="5" fill="#f04434" fill-opacity="0.12" stroke="#f04434" stroke-opacity="0.8"/><text x="600" y="517" text-anchor="middle" fill="#f04434" font-family="monospace" font-size="18" font-weight="800" letter-spacing="2">${badge}</text>
<text x="92" y="574" fill="#958a76" font-family="monospace" font-size="18" font-weight="700">SCORE</text><text x="92" y="607" fill="#ede6d3" font-family="monospace" font-size="30" font-weight="900">${result.score.toLocaleString("en-US")}</text>
<text x="1108" y="574" text-anchor="end" fill="#958a76" font-family="monospace" font-size="18" font-weight="700">ACTIVE TIME</text><text x="1108" y="607" text-anchor="end" fill="#ede6d3" font-family="monospace" font-size="30" font-weight="900">${formatActiveTime(result.activeMilliseconds)}</text>
</svg>`;
}
