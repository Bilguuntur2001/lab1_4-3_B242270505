/**
 * Лаборатори №1 — Playwright UI автомат тест
 * Тестлэх сайт: https://www.saucedemo.com (тестэд зориулсан демо дэлгүүр)
 *
 * Энэ файлд:
 *   1. Амжилттай нэвтрэх (эерэг тест)
 *   2. Амжилтгүй нэвтрэх — буруу нууц үг, түгжигдсэн хэрэглэгч (сөрөг тест)
 *   3. Нэвтэрсний дараах үйлдэл — бараа сагслах, сагснаас хасах
 *
 * Locator сонголт: XPath/CSS-ийн оронд хэрэглэгчийн харж буй зүйлд тулгуурласан
 * getByRole / getByPlaceholder / getByText / getByTestId ашигласан.
 * (getByTestId нь playwright.config.ts дотор `data-test` атрибут руу тохируулагдсан.)
 *
 * Test isolation: Playwright тест бүрд шинэ BrowserContext (cookie, localStorage
 * хоосон) өгдөг тул тест бүр бусдаасаа үл хамааран дангаараа ажиллана.
 */
import { test, expect, type Page } from '@playwright/test';

// Нэвтрэх мэдээлэл — saucedemo-гийн нэвтрэх хуудсан дээр нээлттэй бичигдсэн байдаг
const USERNAME = 'standard_user';
const PASSWORD = 'secret_sauce';

/**
 * Нэвтрэх үйлдлийг нэг дор цуглуулсан туслах функц.
 * Олон тест нэг кодыг давтахгүйн тулд (DRY) ашиглана.
 */
async function login(page: Page, username: string, password: string) {
  // baseURL (config-д) тохируулсан тул '/' нь https://www.saucedemo.com/ болно
  await page.goto('/');
  // Input талбаруудад <label> байхгүй тул placeholder-оор нь олно
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  // <input type="submit" value="Login"> нь хүртээмжийн (accessibility) модонд
  // "button" role-той, "Login" нэртэй харагддаг
  await page.getByRole('button', { name: 'Login' }).click();
}

/**
 * Гарах (logout) үйлдэл — тестийг "цэвэр" төгсгөх зорилготой.
 * Хажуугийн цэсийг нээж "Logout" товчийг дарна, дараа нь нэвтрэх хуудас руу
 * буцсаныг шалгана.
 */
async function logout(page: Page) {
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  // Гарсны дараа нэвтрэх хуудас (root URL) руу буцаж, Login товч харагдах ёстой
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. Амжилттай нэвтрэх
// ---------------------------------------------------------------------------
test.describe('Амжилттай нэвтрэх', () => {
  test('standard_user зөв нууц үгээр нэвтэрч, бүтээгдэхүүний хуудас харагдана', async ({ page }) => {
    await login(page, USERNAME, PASSWORD);

    // URL нь inventory хуудас руу шилжсэн эсэх
    await expect(page).toHaveURL(/\/inventory\.html$/);
    // Хуудасны гарчиг "Products" гэсэн тексттэй эсэх
    await expect(page.getByTestId('title')).toHaveText('Products');
    // Бараануудын жагсаалт харагдаж, 6 бараа байгаа эсэх
    await expect(page.getByTestId('inventory-list')).toBeVisible();
    await expect(page.getByTestId('inventory-item')).toHaveCount(6);

    // Тестээ гарах үйлдлээр төгсгөнө
    await logout(page);
  });
});

// ---------------------------------------------------------------------------
// 2. Амжилтгүй нэвтрэх (сөрөг тестүүд)
// ---------------------------------------------------------------------------
test.describe('Амжилтгүй нэвтрэх', () => {
  test('буруу нууц үгээр нэвтрэхэд алдааны мессеж гарна', async ({ page }) => {
    await login(page, USERNAME, 'wrong_password');

    // Алдааны мессеж харагдаж, зөв тексттэй байх ёстой
    const error = page.getByTestId('error');
    await expect(error).toBeVisible();
    await expect(error).toHaveText(
      'Epic sadface: Username and password do not match any user in this service',
    );
    // Нэвтрэх хуудаснаасаа шилжээгүй байх ёстой
    await expect(page).not.toHaveURL(/inventory/);
    // Нэвтрээгүй тул logout хийх шаардлагагүй — context тест дуусахад устна
  });

  test('түгжигдсэн (locked_out_user) хэрэглэгч нэвтэрч чадахгүй', async ({ page }) => {
    await login(page, 'locked_out_user', PASSWORD);

    await expect(page.getByText('Sorry, this user has been locked out.')).toBeVisible();
    await expect(page).not.toHaveURL(/inventory/);
  });

  test('хэрэглэгчийн нэр хоосон бол "Username is required" гарна', async ({ page }) => {
    await login(page, '', PASSWORD);

    await expect(page.getByTestId('error')).toHaveText('Epic sadface: Username is required');
  });
});

// ---------------------------------------------------------------------------
// 3. Нэвтэрсний дараах үйлдэл — сагс
// ---------------------------------------------------------------------------
test.describe('Нэвтэрсний дараах үйлдэл: сагс', () => {
  // Энэ бүлгийн тест бүрийн өмнө шинээр нэвтэрнэ (тестүүд бие биеэсээ хамааралгүй)
  test.beforeEach(async ({ page }) => {
    await login(page, USERNAME, PASSWORD);
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });

  // Тест бүрийн дараа гарах үйлдлээр цэвэр төгсгөнө
  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('бараа сагсанд нэмэхэд badge шинэчлэгдэж, сагсанд харагдана', async ({ page }) => {
    // "Sauce Labs Backpack" барааны карт — текстээр нь шүүж олно
    const backpack = page
      .getByTestId('inventory-item')
      .filter({ hasText: 'Sauce Labs Backpack' });

    await backpack.getByRole('button', { name: 'Add to cart' }).click();

    // Товч "Remove" болж хувирсан эсэх
    await expect(backpack.getByRole('button', { name: 'Remove' })).toBeVisible();
    // Сагсны дүрс дээрх тоо 1 болсон эсэх
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');

    // Сагс руу орж, бараа байгааг шалгана
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.getByTestId('title')).toHaveText('Your Cart');
    await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');

    // Дараагийн ажиллалтад нөлөөлөхгүйн тулд сагсаа хоосолно
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  });

  test('хоёр бараа нэмээд нэгийг хасахад badge зөв тоолно', async ({ page }) => {
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await page.getByTestId('add-to-cart-sauce-labs-bike-light').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');

    await page.getByTestId('remove-sauce-labs-backpack').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');

    // Үлдсэнийг нь хасаж цэвэрлэнэ
    await page.getByTestId('remove-sauce-labs-bike-light').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  });
});
