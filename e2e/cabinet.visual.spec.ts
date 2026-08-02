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
  await page.getByRole("button", { name: "Start building" }).click();
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
  await page.screenshot({ animations: "allow", fullPage: false });
  await expect(page).toHaveScreenshot(name, { fullPage: false });
}

test("welcome cabinet", async ({ page }) => {
  await openWelcome(page);
  await expectCabinetScreenshot(page, "welcome.png");
});

test("normal gameplay cabinet", async ({ page }) => {
  await startRun(page);
  await expect(page.getByText("CLEAR LINES → EARN TRANSFERS")).toBeVisible();
  await expectCabinetScreenshot(page, "gameplay-normal.png");
});

test("transfer-ready cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "route-return");
  await expect(page.getByTestId("transfers")).toHaveText("1 / 3");
  await expect(page.getByText("TRANSFER READY → ROUTE WITH SHIFT")).toBeVisible();
  await expectCabinetScreenshot(page, "gameplay-transfer-ready.png");
});

test("full transfer bank cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "transfer-full");
  await expect(page.getByTestId("transfers")).toHaveText("3 / 3");
  await expect(page.getByText("TRANSFER BANK FULL → BUILD YOUR NAME")).toBeVisible();
  await expectCabinetScreenshot(page, "gameplay-transfer-full.png");
});

test("stencil placement cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "route-return");
  await page.getByRole("button", { name: "Route piece to name" }).click();
  await expect(page.getByText("STENCIL MODE → PLACE, TRIM, OR CANCEL")).toBeVisible();
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
  await loadFixture(page, "eighty");
  await page.getByRole("button", { name: /FINISH NAME/ }).click();
  await waitForDisplay(page, "Success display");
  await expectCabinetScreenshot(page, "success.png");
});

test("loss cabinet", async ({ page }) => {
  await startRun(page);
  await loadFixture(page, "topout-eighty");
  await page.getByRole("button", { name: "Hard drop" }).click();
  await waitForDisplay(page, "Loss display");
  await expectCabinetScreenshot(page, "loss.png");
});
