import { expect, test, type Page } from "@playwright/test";

import type { E2EFixtureKind } from "../src/game/testing/fixtures";

async function startRun(page: Page, name = "") {
  await page.goto("/");
  const input = page.getByLabel("Your name (optional)");
  await input.fill(name);
  await input.press("Enter");
  await expect(page.getByRole("application", { name: "Nametris game" })).toBeFocused();
}

async function loadFixture(page: Page, kind: E2EFixtureKind) {
  await page.evaluate((fixtureKind) => {
    const api = (
      window as typeof window & {
        __NAMETRIS_E2E__?: {
          loadFixture: (fixture: E2EFixtureKind) => void;
        };
      }
    ).__NAMETRIS_E2E__;
    if (api === undefined) {
      throw new Error("Nametris E2E hook is unavailable.");
    }
    api.loadFixture(fixtureKind);
  }, kind);
}

async function finishAtEighty(page: Page) {
  await loadFixture(page, "eighty");
  await page.getByRole("button", { name: "FINISH AT 80%" }).click();
  await expect(
    page.getByRole("article", { name: "Nametris reward card" }),
  ).toBeVisible();
}

test("keyboard flow earns, routes, cancels, locks, and returns to play", async ({
  page,
}) => {
  await startRun(page);
  await loadFixture(page, "line-clear");

  await page.keyboard.press("Space");
  await expect(page.getByTestId("transfers")).toHaveText("1");
  await page.getByRole("button", { name: "Pause game" }).focus();
  await page.keyboard.press("KeyN");
  await expect(page.getByText(/^PLACE THE [A-Z]$/)).toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    "1 line cleared. 1 credit earned.",
  );

  await page.keyboard.press("KeyP");
  await expect(page.getByRole("button", { name: "Resume game" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/^PLACE THE [A-Z]$/)).toBeVisible();
  await expect(page.getByRole("application")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByText("NAME STENCIL")).toBeVisible();
  await expect(page.getByTestId("transfers")).toHaveText("1");

  await page.keyboard.press("KeyN");
  await page.keyboard.press("Enter");
  await expect(page.getByText("TETRIS BOARD")).toBeVisible();
  await expect(page.getByTestId("transfers")).toHaveText("0");
});

test("the complete game surface fits the accepted desktop viewport", async ({
  page,
}) => {
  await startRun(page);
  await expect(
    page.getByRole("grid", { name: "Normal Tetris board" }),
  ).toBeInViewport();
  await expect(page.getByRole("heading", { name: "CONTROLS" })).toBeInViewport();
  expect(
    await page.evaluate(() => ({
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
    })),
  ).toEqual({
    scrollX: 0,
    scrollY: 0,
    viewportWidth: 1180,
    viewportHeight: 720,
    documentWidth: 1180,
    documentHeight: 720,
  });
});

test("the board bottom and controls fit a compact desktop browser panel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 600 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "NAMETRIS" })).toBeInViewport();
  await expect(page.getByLabel("Your name (optional)")).toBeInViewport();
  await expect(page.getByRole("button", { name: "START BUILDING" })).toBeInViewport();
  await expect(page.getByText("View keyboard controls")).toBeInViewport();

  const input = page.getByLabel("Your name (optional)");
  await input.fill("AB");
  await input.press("Enter");
  await expect(page.getByRole("application", { name: "Nametris game" })).toBeFocused();

  await expect(
    page.getByRole("grid", { name: "Normal Tetris board" }),
  ).toBeInViewport();
  await expect(page.getByRole("heading", { name: "CONTROLS" })).toBeInViewport();
  await expect(page.getByText("Route", { exact: true })).toBeInViewport();
  await loadFixture(page, "route-return");
  await page.keyboard.press("KeyN");
  await expect(
    page.getByRole("grid", { name: "Name stencil for AB" }),
  ).toBeInViewport();
  await expect(page.getByRole("button", { name: "LOCK · ENTER" })).toBeInViewport();
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(() => ({
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
    })),
  ).toEqual({
    scrollX: 0,
    scrollY: 0,
    viewportWidth: 900,
    viewportHeight: 600,
    documentWidth: 900,
    documentHeight: 600,
  });
});

test("exact 80 percent continues until the player explicitly finishes", async ({
  page,
}) => {
  await startRun(page);
  await loadFixture(page, "eighty");
  const initialScore = Number(await page.getByTestId("score").textContent());

  await expect(page.getByRole("button", { name: "FINISH AT 80%" })).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("score")).not.toHaveText(initialScore.toLocaleString());
  await expect(page.getByText("TETRIS BOARD")).toBeVisible();

  await page.getByRole("button", { name: "FINISH AT 80%" }).click();
  await expect(page.getByText("NAME COMPLETE · 80%")).toBeVisible();
});

test("exact 100 percent auto-finishes with an exclusive title", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "perfect-ready");

  await page.keyboard.press("KeyN");
  await page.keyboard.press("Enter");

  const card = page.getByRole("article", { name: "Nametris reward card" });
  await expect(card).toContainText("PERFECT · 100%");
  await expect(card).toContainText(
    /The One-Hundred Wonder|Pixel-Perfect Name Alchemist|Crowned Blocksmith/,
  );
});

test("topout after 80 percent loses if finish was not claimed", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "topout-eighty");

  await page.keyboard.press("Space");

  await expect(page.getByRole("heading", { name: "STACK OVERFLOW" })).toBeVisible();
  await expect(page.getByText("80%")).toBeVisible();
});

test("reward tilt, reduced motion, and local SVG download work", async ({ page }) => {
  await startRun(page);
  await finishAtEighty(page);
  const card = page.getByRole("article", { name: "Nametris reward card" });

  await card.hover({ position: { x: 80, y: 80 } });
  await expect(card).toHaveAttribute("data-motion", "interactive");
  await expect(card.locator(".reward-shine")).toHaveCSS("opacity", "1");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download card" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("nametris-card.svg");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  const svg = Buffer.concat(chunks).toString("utf8");
  expect(svg).toContain("<svg");
  expect(svg).toContain("HARSH");
  expect(svg).not.toContain("<script");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await startRun(page);
  await finishAtEighty(page);
  const staticCard = page.getByRole("article", {
    name: "Nametris reward card",
  });
  await expect(staticCard).toHaveAttribute("data-motion", "static");
  await expect(staticCard).toHaveCSS("transform", "none");
});

test("custom name never enters request URLs, logs, or page URL", async ({ page }) => {
  const requestUrls: string[] = [];
  const consoleMessages: string[] = [];
  page.on("request", (request) => requestUrls.push(request.url()));
  page.on("console", (message) => consoleMessages.push(message.text()));

  await startRun(page, "SECRET");

  expect(page.url()).not.toContain("SECRET");
  expect(requestUrls.every((url) => !url.includes("SECRET"))).toBe(true);
  expect(consoleMessages.every((message) => !message.includes("SECRET"))).toBe(true);
  await expect(
    page.getByRole("grid", { name: "Name stencil for SECRET" }),
  ).toBeVisible();
});
