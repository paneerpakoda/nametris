import { expect, test, type Page } from "@playwright/test";

import type { E2EFixtureKind } from "../src/game/testing/fixtures";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function waitForDisplay(page: Page, label: string) {
  await expect(page.getByRole("region", { name: label })).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function openWelcome(page: Page) {
  await page.goto("/");
  await waitForDisplay(page, "Welcome display");
}

async function startRun(page: Page) {
  await openWelcome(page);
  await page.getByLabel("Your name").fill("JO");
  await page.getByRole("button", { name: "Start building" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await waitForDisplay(page, "Gameplay display");
  await page.waitForFunction(() => window.__NAMETRIS_E2E__ !== undefined);
}

async function loadFixture(page: Page, kind: E2EFixtureKind) {
  await page.evaluate((fixtureKind) => {
    window.__NAMETRIS_E2E__?.loadFixture(fixtureKind);
  }, kind);
}

async function expectCabinetScreenshot(page: Page, name: string) {
  await page.addStyleTag({
    content:
      ".game-surface, .line-clear-feedback, .rail-transfer-metric, .transfer-arrow { animation: none !important; } .reward-shine { transition: none !important; }",
  });
  await page.waitForTimeout(80);
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const documentSize = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    width: document.documentElement.scrollWidth,
  }));

  expect(documentSize).toEqual(viewport);
  await expect(page).toHaveScreenshot(name, { fullPage: false });
}

test("welcome cabinet", async ({ page }) => {
  await openWelcome(page);
  await expectCabinetScreenshot(page, "welcome.png");
});

test("normal gameplay cabinet", async ({ page }) => {
  await startRun(page);
  await expect(page.getByRole("region", { name: "TETRIS BOARD" })).toBeVisible();
  await expectCabinetScreenshot(page, "gameplay-normal.png");
});

test("non-blocking line-clear receipt cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "line-clear-ready");
  await page.getByRole("button", { name: "Hard drop" }).click();
  const feedback = page.getByTestId("line-clear-feedback");
  await expect(feedback.getByText("1 ROW CLEARED")).toBeVisible();
  await expect(feedback.getByText("+1 NAME PIECE · 1/3")).toBeVisible();

  const boardBox = await page.locator(".board-frame").boundingBox();
  const feedbackBox = await feedback.boundingBox();
  expect(boardBox).not.toBeNull();
  expect(feedbackBox).not.toBeNull();
  expect(feedbackBox?.x).toBeGreaterThanOrEqual(boardBox?.x ?? 0);
  expect((feedbackBox?.x ?? 0) + (feedbackBox?.width ?? 0)).toBeLessThanOrEqual(
    (boardBox?.x ?? 0) + (boardBox?.width ?? 0) + 1,
  );
  await expectCabinetScreenshot(page, "gameplay-line-clear-feedback.png");
});

test("transfer-ready cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "route-return");
  await expect(page.getByTestId("transfers")).toHaveText("1 / 3");
  await expect(page.getByRole("button", { name: "Send O" })).toBeEnabled();
  await expectCabinetScreenshot(page, "gameplay-transfer-ready.png");
});

test("full transfer bank cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "transfer-full");
  await expect(page.getByTestId("transfers")).toHaveText("3 / 3");
  await expect(page.getByTestId("route-zone-label")).toContainText("SLOW ZONE");
  await expect(page.getByTestId("route-zone-label")).toContainText("FULL BANK");
  await expect(page.getByTestId("route-zone-label")).toContainText("50%");
  const zoneLabelBox = await page.getByTestId("route-zone-label").boundingBox();
  const boardGridBox = await page.locator(".board-grid").boundingBox();
  expect(zoneLabelBox).not.toBeNull();
  expect(boardGridBox).not.toBeNull();
  expect((zoneLabelBox?.y ?? 0) + (zoneLabelBox?.height ?? 0)).toBeLessThanOrEqual(
    boardGridBox?.y ?? 0,
  );
  await expect(page.getByText("NAME PIECES FULL · SEND ONE")).toBeVisible();
  await expectCabinetScreenshot(page, "gameplay-transfer-full.png");
});

test("stencil placement cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "route-return");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(
    page.getByText(
      "Move it onto your name and press Enter. Parts outside the outline are lost. Esc keeps the piece.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "PLACE THE O" })).toBeVisible();
  await expectCabinetScreenshot(page, "gameplay-stencil-placement.png");
});

test("pause dialog cabinet", async ({ page }) => {
  await startRun(page);
  await page.getByRole("button", { name: "Pause game" }).click();
  await expect(page.getByRole("heading", { name: "Game paused" })).toBeVisible();
  await expectCabinetScreenshot(page, "gameplay-pause.png");
});

test("help dialog cabinet", async ({ page }) => {
  await startRun(page);
  await page.getByRole("button", { name: "Open controls help" }).click();
  await expect(
    page.getByRole("heading", { name: "How to play Nametris" }),
  ).toBeVisible();
  await expectCabinetScreenshot(page, "gameplay-help.png");
});

test("success cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "eighty-real");
  await page.getByRole("button", { name: /FINISH NAME/ }).click();
  await waitForDisplay(page, "Success display");
  await expectCabinetScreenshot(page, "success.png");
});

test("loss cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "topout-eighty");
  await page.keyboard.press("Space");
  await waitForDisplay(page, "Loss display");
  await expectCabinetScreenshot(page, "loss.png");
});
