import { expect, test, type Page } from '@playwright/test';

const tiadaSkrolSisi = async (page: Page) => {
  const [lebar, skrin] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(lebar).toBeLessThanOrEqual(skrin);
};

test('phone: drawer navigation, Escape closes, no sideways scroll on any page', async ({ page }) => {
  await page.goto('./');
  await tiadaSkrolSisi(page);

  await page.getByRole('button', { name: 'Buka menu' }).click();
  await expect(page.locator('aside')).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(page.locator('aside')).not.toBeInViewport();

  for (const nama of ['Reban', 'Kesihatan', 'Laporan', 'Tetapan']) {
    await page.getByRole('button', { name: 'Buka menu' }).click();
    await page.getByRole('navigation').getByRole('button', { name: new RegExp(`^${nama}`) }).click();
    await expect(page.locator('main h1')).toBeVisible();
    await tiadaSkrolSisi(page);
  }
});
