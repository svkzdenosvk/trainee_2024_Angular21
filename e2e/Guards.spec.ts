import { test, expect } from '@playwright/test';

// These are deliberately lightweight smoke tests — the guards themselves
// already have full unit test coverage. The goal here is just to confirm
// the redirect behavior actually works end-to-end in a real browser.

test.describe('Route guards', () => {
  test('redirects to /login when visiting /admin while logged out', async ({ page }) => {
    // authGuard runs before adminGuard on this route, so an anonymous
    // visitor is caught by authGuard first and sent to /login.
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects to /login when visiting /favourites while logged out', async ({ page }) => {
    await page.goto('/favourites');

    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects a logged-in non-admin user away from /admin to /', async ({ page }) => {
    // Log in as a regular (non-admin) user first
    await page.goto('/login');
    await page.locator('#login-username').fill('user');
    await page.locator('#login-password').fill('User123*');
    await page.locator('p-button[icon="pi pi-sign-in"] button').click();
    await expect(page).not.toHaveURL(/\/login/);

    // adminGuard kicks in here, since the user is authenticated but not an admin
    await page.goto('/admin');

    await expect(page).toHaveURL('http://localhost:4200/');
  });

  test('allows a logged-in admin to access /admin', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-username').fill('admin');
    await page.locator('#login-password').fill('Admin123*');
    await page.locator('p-button[icon="pi pi-sign-in"] button').click();
    await expect(page).not.toHaveURL(/\/login/);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/admin/);
  });
});
