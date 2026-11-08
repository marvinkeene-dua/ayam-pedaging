import { expect, test, type Page } from '@playwright/test';

const angka = (page: Page, i: number) => page.locator('section[aria-label="Angka utama"] > div').nth(i).locator('p.figure');
const nilai = async (page: Page, i: number) => Number((await angka(page, i).textContent())?.replace(/\D/g, ''));
const toast = (page: Page) => page.locator('[role=status]');
const banner = (page: Page) => page.getByRole('alert').filter({ hasText: 'tertunggak' });

let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('./');
  await expect(angka(page, 0)).toBeVisible();
});
test.afterEach(() => expect(errors, 'no console errors').toEqual([]));

test.describe('dashboard', () => {
  test('shows KPIs, the overdue banner and the chart', async ({ page }) => {
    await expect(banner(page)).toBeVisible();
    await expect(page.locator('.recharts-surface').first()).toBeVisible();
    expect(await nilai(page, 0)).toBeGreaterThan(9000);
  });

  test('daily entry validates, then updates KPIs, notes and population', async ({ page }) => {
    await page.getByRole('button', { name: 'Simpan rekod' }).click();
    await expect(page.getByText('Isi sekurang-kurangnya satu')).toBeVisible();

    await page.locator('#harian-kematian').fill('-3');
    await page.getByRole('button', { name: 'Simpan rekod' }).click();
    await expect(page.locator('#harian-kematian')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#harian-kematian')).toBeFocused();

    const [pop0, mati0] = [await nilai(page, 0), await nilai(page, 1)];
    await page.locator('#harian-kematian').fill('5');
    await page.locator('#harian-dedak').fill('100');
    await page.locator('#harian-nota').fill('Air minuman diperiksa.');
    await page.getByRole('button', { name: 'Simpan rekod' }).click();

    await expect(toast(page)).toContainText('Disimpan untuk hari ini: 5 kematian, 100 kg dedak, satu nota.');
    await expect.poll(() => nilai(page, 1)).toBe(mati0 + 5);
    expect(await nilai(page, 0)).toBe(pop0 - 5);
    await expect(page.getByText('Air minuman diperiksa.')).toBeVisible();
    await expect(page.locator('#harian-kematian')).toHaveValue('');

    await page.reload();
    await expect(page.getByText('Air minuman diperiksa.')).toBeVisible();
  });

  test('rejects more deaths than the coop holds', async ({ page }) => {
    await page.locator('#harian-kematian').fill('999999');
    await page.getByRole('button', { name: 'Simpan rekod' }).click();
    await expect(page.getByText(/hanya ada .* ekor/)).toBeVisible();
  });

  test('completing a treatment clears the banner; undo brings it back', async ({ page }) => {
    await page.locator('button[aria-label^="Tanda "][aria-label$=" selesai"]').first().click();
    await expect(banner(page)).toHaveCount(0);
    await page.getByRole('button', { name: 'Buat asal' }).click();
    await expect(banner(page)).toBeVisible();
  });

  test('chart range persists', async ({ page }) => {
    await page.getByRole('button', { name: '30 hari' }).first().click();
    await page.reload();
    await expect(page.getByRole('button', { name: '30 hari' }).first()).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('coops', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Reban' }).click();
    await expect(page).toHaveURL(/#\/ladangSaya$/);
  });

  test('add form validates names and capacity; Escape closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Tambah reban' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('button', { name: 'Tambah reban' }).click();
    await page.locator('#reban-nama').fill('Reban 1');
    await page.getByRole('dialog').getByRole('button', { name: 'Aktif' }).click();
    await page.locator('#reban-kapasiti').fill('2000');
    await page.locator('#reban-populasiAwal').fill('2500');
    await page.getByRole('dialog').locator('button[type=submit]').click();
    await expect(page.getByText('Nama ini sudah digunakan')).toBeVisible();
    await expect(page.getByText('Melebihi kapasiti')).toBeVisible();

    await page.locator('#reban-nama').fill('Reban 6');
    await page.locator('#reban-populasiAwal').fill('1800');
    await page.getByRole('dialog').locator('button[type=submit]').click();
    await expect(page.getByRole('button', { name: 'Buka butiran Reban 6' })).toBeVisible();
  });

  test('delete with undo', async ({ page }) => {
    await page.getByRole('button', { name: 'Buka butiran Reban 5' }).click();
    await page.getByRole('button', { name: 'Padam reban' }).click();
    await expect(page.getByRole('button', { name: 'Buka butiran Reban 5' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Buat asal' }).click();
    await expect(page.getByRole('button', { name: 'Buka butiran Reban 5' })).toBeVisible();
  });
});

test.describe('health records', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: /Kesihatan/ }).click();
  });

  test('search, empty state and status filter', async ({ page }) => {
    await page.locator('#carian-vaksin').fill('gumboro');
    await expect(page.locator('main ul > li')).toHaveCount(2);
    await page.locator('#carian-vaksin').fill('zzz');
    await expect(page.getByText('Tiada rawatan sepadan')).toBeVisible();
    await page.getByRole('button', { name: 'Kosongkan carian' }).click();
    await page.getByRole('button', { name: /^Tertunggak/ }).click();
    await expect(page.locator('main ul > li')).toHaveCount(1);
  });

  test('add requires a name; delete removes', async ({ page }) => {
    await page.getByRole('button', { name: 'Tambah rawatan' }).click();
    await page.getByRole('dialog').locator('button[type=submit]').click();
    await expect(page.getByText('Tulis nama vaksin atau ubat.')).toBeVisible();
    await page.locator('#vaksin-nama').fill('Vaksin ND, ulangan');
    await page.getByRole('dialog').locator('button[type=submit]').click();
    const row = page.locator('main li', { hasText: 'Vaksin ND, ulangan' });
    await expect(row).toHaveCount(1);
    await row.getByRole('button', { name: /^Padam/ }).click();
    await expect(row).toHaveCount(0);
  });
});

test.describe('report', () => {
  test('CSV export has BOM, header, 7 days and a total row', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Laporan' }).click();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Muat turun CSV' }).click()]);
    const chunks: Buffer[] = [];
    for await (const c of await dl.createReadStream()) chunks.push(c as Buffer);
    const csv = Buffer.concat(chunks).toString('utf8');
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const lines = csv.slice(1).split('\r\n');
    expect(lines[0]).toBe('Tarikh,Hari,Kematian (ekor),Dedak (kg)');
    expect(lines).toHaveLength(9);
    expect(lines.at(-1)).toMatch(/^Jumlah,,\d+,\d+/);
  });
});

test.describe('settings and session', () => {
  test('profile validation, save, theme and reset', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Tetapan' }).click();
    await expect(page.getByRole('button', { name: 'Simpan profil' })).toBeDisabled();
    await page.locator('#tetapan-namaPengurus').fill('');
    await page.getByRole('button', { name: 'Simpan profil' }).click();
    await expect(page.getByText('Tulis nama pengurus.')).toBeVisible();
    await page.locator('#tetapan-namaPengurus').fill('Aisyah Rahman');
    await page.getByRole('button', { name: 'Simpan profil' }).click();
    await expect(page.locator('header').getByText('Aisyah Rahman')).toBeVisible();

    await page.getByRole('button', { name: /^Putih/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cerah');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cerah');

    await page.getByRole('button', { name: 'Set semula data' }).click();
    await page.getByRole('button', { name: 'Padam dan set semula' }).click();
    await expect(page).toHaveURL(/#\/papanPemuka$/);
  });

  test('log out persists across reload; log in restores', async ({ page }) => {
    await page.getByRole('button', { name: 'Log keluar' }).click();
    await expect(page.getByText('Anda telah log keluar.')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Anda telah log keluar.')).toBeVisible();
    await page.getByRole('button', { name: /Log masuk sebagai/ }).click();
    await expect(angka(page, 0)).toBeVisible();
  });
});
