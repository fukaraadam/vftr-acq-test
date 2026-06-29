import { expect, type Locator, type Page } from '@playwright/test';

type HydratedClickOptions = {
  expected: Locator;
  timeout?: number;
  settleTimeout?: number;
};

const USER_SETTLE_DELAY_MS = 2000;

export async function waitForHydrationWindow(page: Page, timeout = 5_000) {
  await page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  await page.waitForTimeout(USER_SETTLE_DELAY_MS);
}

export async function hydratedClick(
  page: Page,
  locator: Locator,
  { expected, timeout = 15_000, settleTimeout = 5_000 }: HydratedClickOptions,
) {
  await expect(async () => {
    await waitForHydrationWindow(page, settleTimeout);
    await expect(locator).toBeVisible();
    await expect(locator).toBeEnabled();
    await locator.click();
    await waitForHydrationWindow(page, settleTimeout);
    await expect(expected).toBeVisible({ timeout: Math.min(timeout, 3_000) });
  }).toPass({ timeout });
}
