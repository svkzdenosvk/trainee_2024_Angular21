import { test, expect } from '@playwright/test';

// NOTE: This app does NOT store a raw JWT in localStorage.
// Auth tokens (access + refresh) live in httpOnly cookies set by the backend,
// so they are invisible to page scripts. The only client-visible auth state
// is the `auth_user` key in localStorage, which holds the logged-in user's
// profile (set by AuthService.login() / checkAuth()).
const AUTH_STORAGE_KEY = 'auth_user';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders the login form with all fields', async ({ page }) => {
    await expect(page.locator('#login-username')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('p-button[icon="pi pi-sign-in"] button')).toBeVisible();
  });

  test('disables the submit button while fields are empty', async ({ page }) => {
    await expect(page.locator('p-button[icon="pi pi-sign-in"] button')).toBeDisabled();
  });

  test('logs in as admin and persists auth_user with the correct role', async ({ page }) => {
    await page.locator('#login-username').fill('admin');
    await page.locator('#login-password').fill('Admin123*');
    await page.locator('p-button[icon="pi pi-sign-in"] button').click();

    // Successful auth navigates away from the login page entirely
    await expect(page).not.toHaveURL(/\/login/);

    const authUser = await page.evaluate((key) => localStorage.getItem(key), AUTH_STORAGE_KEY);
    expect(authUser).not.toBeNull();
    expect(JSON.parse(authUser!).role).toBe('ADMIN');
  });

  test('logs in as a regular user and persists auth_user', async ({ page }) => {
    await page.locator('#login-username').fill('user');
    await page.locator('#login-password').fill('User123*');
    await page.locator('p-button[icon="pi pi-sign-in"] button').click();

    await expect(page).not.toHaveURL(/\/login/);

    const authUser = await page.evaluate((key) => localStorage.getItem(key), AUTH_STORAGE_KEY);
    expect(authUser).not.toBeNull();
  });

  test('shows an error banner on invalid credentials and stores no auth state', async ({
    page,
  }) => {
    await page.locator('#login-username').fill('nonexistent_user');
    await page.locator('#login-password').fill('WrongPass1*');
    await page.locator('p-button[icon="pi pi-sign-in"] button').click();

    await expect(page.locator('.error-banner')).toBeVisible();

    // A failed login must not leave stale auth state behind
    const authUser = await page.evaluate((key) => localStorage.getItem(key), AUTH_STORAGE_KEY);
    expect(authUser).toBeNull();
  });

  test('toggles password visibility between text and password', async ({ page }) => {
    const input = page.locator('#login-password');
    await input.fill('Test123*');

    await expect(input).toHaveAttribute('type', 'password');
    await page.locator('button.eye-btn').click();
    await expect(input).toHaveAttribute('type', 'text');
    await page.locator('button.eye-btn').click();
    await expect(input).toHaveAttribute('type', 'password');
  });
});
