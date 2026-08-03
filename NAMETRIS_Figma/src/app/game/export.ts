// ─── Local, in-browser reward export & sharing ──────────────────────────────────
// Everything is generated client-side from final result data. The player's name is
// never uploaded; downloads/shares are only initiated by an explicit player click.

import { NameGrid } from "./alphabet";
import { formatTime } from "./format";

export interface ResultData {
  name: string;
  grid: NameGrid;
  title: string;
  score: number;
  activeMs: number;
  completion: number;
  perfect: boolean;
}

function cellHue(r: number, cols: number, c: number): number {
  return ((r * cols + c) * 47) % 360;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Deterministic SVG assembled from the final result. No gradients — filled letter
// cells are solid colored rects. Contains no buttons or hover state.
export function buildResultSVG(data: ResultData): string {
  const { grid, name, title, score, activeMs, completion, perfect } = data;
  const W = 900;
  const H = 520;
  const pad = 48;

  // Layout the block-built name centered.
  const maxCellW = (W - pad * 2) / grid.cols;
  const cell = Math.max(4, Math.min(20, Math.floor(maxCellW)));
  const gridW = grid.cols * cell;
  const gridH = grid.rows * cell;
  const gx = (W - gridW) / 2;
  const gy = 150;

  const rects: string[] = [];
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (!grid.cells[r][c] || !grid.filled[r][c]) continue;
      const hue = cellHue(r, grid.cols, c);
      rects.push(
        `<rect x="${gx + c * cell}" y="${gy + r * cell}" width="${cell - 1}" height="${
          cell - 1
        }" fill="hsl(${hue},80%,55%)" />`
      );
    }
  }

  const badge = perfect ? `PERFECT · 100%` : `NAME COMPLETE · ${completion}%`;
  const badgeColor = perfect ? "#facc15" : "#4ade80";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0d0f1a" />
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" rx="14" />
  <text x="${pad}" y="60" fill="#facc15" font-family="'Press Start 2P', monospace" font-size="16" letter-spacing="4">NAMETRIS</text>
  <text x="${W - pad}" y="60" text-anchor="end" fill="${badgeColor}" font-family="'Press Start 2P', monospace" font-size="12">${badge}</text>
  ${rects.join("\n  ")}
  <text x="${W / 2}" y="${gy + gridH + 60}" text-anchor="middle" fill="#e8eaf0" font-family="'Press Start 2P', monospace" font-size="22">${esc(title)}</text>
  <text x="${W / 2}" y="${gy + gridH + 110}" text-anchor="middle" fill="#8890a8" font-family="'Rajdhani', sans-serif" font-size="22">SCORE ${score.toLocaleString()}  ·  TIME ${formatTime(
    activeMs
  )}  ·  NAME ${esc(name)}</text>
</svg>`;
}

export function buildResultText(data: ResultData): string {
  const badge = data.perfect ? `PERFECT · 100%` : `NAME COMPLETE · ${data.completion}%`;
  return `NAMETRIS — ${data.name}
${badge}
Title: ${data.title}
Score: ${data.score.toLocaleString()}
Playtime: ${formatTime(data.activeMs)}`;
}

export function downloadCard(data: ResultData): void {
  const svg = buildResultSVG(data);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nametris-${data.name.toLowerCase()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyResult(data: ResultData): Promise<boolean> {
  const text = buildResultText(data);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function canShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function shareResult(data: ResultData): Promise<boolean> {
  const text = buildResultText(data);
  if (canShare()) {
    try {
      await navigator.share({ title: "NAMETRIS", text });
      return true;
    } catch {
      return false;
    }
  }
  return copyResult(data);
}
