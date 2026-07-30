import { afterEach, describe, expect, it, vi } from "vitest";

import { playerTitles } from "../../game/config/titles";
import type { RunResult } from "../../game/engine/result";
import {
  copyResult,
  createResultSummary,
  downloadRewardCard,
  shareResult,
} from "./localActions";

const result = {
  outcome: "won",
  name: "ADA",
  completionRatio: 1,
  displayPercent: 100,
  score: 9_000,
  activeMilliseconds: 60_000,
  title: playerTitles.crownedBlocksmith,
  linesCleared: 10,
  level: 2,
  fourLineClears: 0,
  routedAttempts: 5,
  successfulStencilLocks: 5,
  canceledRoutes: 0,
  distinctStencilPieceTypes: 4,
  maximumBoardStackHeight: 8,
  stencilCellsFilled: 4,
  stencil: {
    rows: 1,
    columns: 4,
    mask: ["0:0", "0:1", "0:2", "0:3"],
    filledCells: [
      ["0:0", "I"],
      ["0:1", "I"],
      ["0:2", "I"],
      ["0:3", "I"],
    ],
  },
} satisfies RunResult;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("user-triggered local result actions", () => {
  it("builds a short summary without a URL", () => {
    expect(createResultSummary(result)).toBe(
      "ADA is a Crowned Blocksmith — PERFECT · 100%, 9,000 points in 01:00. Built locally in Nametris.",
    );
    expect(createResultSummary(result)).not.toContain("http");
  });

  it("copies only after the copy function is invoked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await copyResult(result, { writeText });

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0]?.[0]).toContain("ADA");
  });

  it("shares text without a URL when native share is available", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);

    const method = await shareResult(result, { share, clipboard: { writeText } });

    expect(method).toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: "Nametris result",
      text: createResultSummary(result),
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to local clipboard copy when share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    const method = await shareResult(result, {
      clipboard: { writeText },
    });

    expect(method).toBe("copied");
    expect(writeText).toHaveBeenCalledOnce();
  });

  it("downloads a locally generated blob with a name-neutral filename", () => {
    const click = vi.fn();
    const remove = vi.fn();
    const append = vi.spyOn(document.body, "append");
    const createElement = vi.spyOn(document, "createElement");
    const nativeCreateElement = createElement.getMockImplementation();
    createElement.mockImplementation(((tagName: string) => {
      const element = nativeCreateElement
        ? nativeCreateElement(tagName)
        : document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
      if (tagName === "a") {
        element.click = click;
        element.remove = remove;
      }
      return element;
    }) as typeof document.createElement);
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:local-card");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);

    downloadRewardCard(result);

    const anchor = append.mock.calls[0]?.[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("nametris-card.svg");
    expect(anchor.href).toBe("blob:local-card");
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:local-card");
  });
});
