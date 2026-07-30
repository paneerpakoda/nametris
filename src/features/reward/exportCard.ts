import type { PieceType } from "../../game/model/types";
import type { RunResult } from "../../game/engine/result";

const pieceColors: Readonly<Record<PieceType, string>> = {
  I: "#3de8df",
  O: "#f4dc58",
  T: "#aa7cff",
  S: "#9bea64",
  Z: "#ff6888",
  J: "#5c8dff",
  L: "#ff9f58",
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function formatActiveTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
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
      const fill = piece === undefined ? "#13182b" : pieceColors[piece];
      const stroke = piece === undefined ? "#42e8e0" : "#ffffff";
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
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#20284a"/><stop offset="0.55" stop-color="#111526"/><stop offset="1" stop-color="#090a12"/></linearGradient><radialGradient id="glow" cx="0.2" cy="0.1" r="0.9"><stop stop-color="#9b7cff" stop-opacity="0.45"/><stop offset="1" stop-color="#9b7cff" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="675" rx="42" fill="url(#bg)"/><rect width="1200" height="675" rx="42" fill="url(#glow)"/><rect x="20" y="20" width="1160" height="635" rx="30" fill="none" stroke="#42e8e0" stroke-opacity="0.35"/>
<text x="70" y="82" fill="#42e8e0" font-family="ui-monospace, monospace" font-size="22" font-weight="800" letter-spacing="7">NAMETRIS</text>
<text x="600" y="175" text-anchor="middle" fill="#f6f2ff" font-family="ui-monospace, monospace" font-size="${Math.min(76, Math.floor(760 / result.name.length))}" font-weight="900" letter-spacing="9">${escapeXml(result.name)}</text>
${createStencilRects(result)}
<text x="600" y="${Math.max(445, stencilBottom + 62)}" text-anchor="middle" fill="#b5f55a" font-family="ui-sans-serif, sans-serif" font-size="42" font-weight="850">${escapeXml(result.title)}</text>
<rect x="450" y="500" width="300" height="48" rx="24" fill="#b5f55a" fill-opacity="0.12" stroke="#b5f55a" stroke-opacity="0.55"/><text x="600" y="532" text-anchor="middle" fill="#b5f55a" font-family="ui-monospace, monospace" font-size="18" font-weight="800" letter-spacing="2">${badge}</text>
<text x="95" y="610" fill="#a9afc8" font-family="ui-sans-serif, sans-serif" font-size="18" font-weight="700">SCORE</text><text x="95" y="641" fill="#f6f2ff" font-family="ui-monospace, monospace" font-size="30" font-weight="900">${result.score.toLocaleString("en-US")}</text>
<text x="1105" y="610" text-anchor="end" fill="#a9afc8" font-family="ui-sans-serif, sans-serif" font-size="18" font-weight="700">ACTIVE TIME</text><text x="1105" y="641" text-anchor="end" fill="#f6f2ff" font-family="ui-monospace, monospace" font-size="30" font-weight="900">${formatActiveTime(result.activeMilliseconds)}</text>
</svg>`;
}
