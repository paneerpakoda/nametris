import { expect, test } from "@playwright/test";

test("keeps core CRT copy legible and high contrast", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Welcome display" })).toBeVisible();
  expect(
    await page
      .locator(".field-help")
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
  ).toBeGreaterThanOrEqual(10);

  await page.getByRole("button", { name: "Start building" }).click();
  await expect(page.getByRole("region", { name: "Gameplay display" })).toBeVisible();
  const coreFontSizes = await page
    .locator(
      ".run-guidance small, .stencil-actions p, .metric span, .control-group-label",
    )
    .evaluateAll((elements) =>
      elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
    );
  expect(Math.min(...coreFontSizes)).toBeGreaterThanOrEqual(10);

  const contrastRatios = await page.evaluate(() => {
    function resolveColor(value: string): readonly [number, number, number] {
      const sample = document.createElement("span");
      sample.style.color = value;
      document.body.append(sample);
      const channels = getComputedStyle(sample)
        .color.match(/[\d.]+/g)
        ?.slice(0, 3);
      sample.remove();
      if (channels === undefined || channels.length !== 3) {
        throw new Error(`Could not resolve color: ${value}`);
      }
      return channels.map(Number) as unknown as readonly [number, number, number];
    }

    function luminance(color: readonly [number, number, number]): number {
      const [red, green, blue] = color.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    }

    function contrast(foreground: string, background: string): number {
      const brighter = Math.max(
        luminance(resolveColor(foreground)),
        luminance(resolveColor(background)),
      );
      const darker = Math.min(
        luminance(resolveColor(foreground)),
        luminance(resolveColor(background)),
      );
      return (brighter + 0.05) / (darker + 0.05);
    }

    const styles = getComputedStyle(document.documentElement);
    const background = styles.getPropertyValue("--crt-black");
    return {
      muted: contrast(styles.getPropertyValue("--crt-muted"), background),
      text: contrast(styles.getPropertyValue("--crt-text"), background),
    };
  });
  expect(contrastRatios.text).toBeGreaterThanOrEqual(7);
  expect(contrastRatios.muted).toBeGreaterThanOrEqual(7);
});

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
