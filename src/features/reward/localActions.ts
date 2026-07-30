import type { RunResult } from "../../game/engine/result";
import { createRewardSvg, formatActiveTime } from "./exportCard";

interface ClipboardWriter {
  readonly writeText: (text: string) => Promise<void>;
}

interface ShareEnvironment {
  readonly share?: (data: ShareData) => Promise<void>;
  readonly clipboard?: ClipboardWriter;
}

export function createResultSummary(result: RunResult): string {
  const badge =
    result.displayPercent === 100
      ? "PERFECT · 100%"
      : `NAME COMPLETE · ${result.displayPercent}%`;
  return `${result.name} is a ${result.title} — ${badge}, ${result.score.toLocaleString(
    "en-US",
  )} points in ${formatActiveTime(result.activeMilliseconds)}. Built locally in Nametris.`;
}

function getNativeClipboard(): ClipboardWriter | undefined {
  return typeof navigator !== "undefined" && navigator.clipboard !== undefined
    ? navigator.clipboard
    : undefined;
}

export async function copyResult(
  result: RunResult,
  clipboard = getNativeClipboard(),
): Promise<void> {
  if (clipboard === undefined) {
    throw new Error("Clipboard access is not available in this browser.");
  }
  await clipboard.writeText(createResultSummary(result));
}

export async function shareResult(
  result: RunResult,
  environment: ShareEnvironment = {},
): Promise<"shared" | "copied"> {
  const nativeShare =
    environment.share ??
    (typeof navigator !== "undefined" && navigator.share !== undefined
      ? navigator.share.bind(navigator)
      : undefined);

  if (nativeShare !== undefined) {
    await nativeShare({
      title: "Nametris result",
      text: createResultSummary(result),
    });
    return "shared";
  }

  await copyResult(result, environment.clipboard);
  return "copied";
}

export function downloadRewardCard(result: RunResult): void {
  const blob = new Blob([createRewardSvg(result)], {
    type: "image/svg+xml;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = "nametris-card.svg";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
