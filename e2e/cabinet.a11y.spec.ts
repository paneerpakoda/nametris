import { expect, test } from "@playwright/test";

test("completes onboarding, pause, finish, and replay with keyboard input", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Welcome display" })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("textbox", { name: "Your name (optional)" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");

  const game = page.getByRole("application", { name: "Nametris game" });
  await expect(game).toBeFocused();
  expect(
    await game.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).not.toBe("none");

  await page.keyboard.press("p");
  const resume = page.getByRole("button", { name: "Resume game" });
  await expect(resume).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(resume).toBeFocused();
  await page.keyboard.press("p");
  await expect(game).toBeFocused();

  await page.waitForFunction(() => window.__NAMETRIS_E2E__ !== undefined);
  await page.evaluate(() => window.__NAMETRIS_E2E__?.loadFixture("eighty"));
  await expect(page.getByRole("button", { name: /FINISH NAME/ })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Open controls help" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: /FINISH NAME/ })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("region", { name: "Success display" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("article", { name: "Nametris reward card" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Play again" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Gameplay display" })).toBeVisible();
});
