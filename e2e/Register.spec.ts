import { test, expect } from '@playwright/test';

// Unique username per test run so we never collide with a previous run
// and never hit the backend's 409 "user already exists" response by accident.
const timestamp = Date.now();
const NEW_USERNAME = `tester${timestamp}`;
const VALID_PASSWORD = 'Test123*';

// The username availability check is async (calls the backend), so the UI
// needs a short moment to resolve it and surface the pending/error state.
const ASYNC_VALIDATOR_DELAY = 600;

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('renders the register form with all fields', async ({ page }) => {
    await expect(page.locator('#reg-username')).toBeVisible();
    await expect(page.locator('#reg-password')).toBeVisible();
    await expect(page.locator('#reg-confirm')).toBeVisible();
    await expect(page.locator('p-button[icon="pi pi-user-plus"] button')).toBeVisible();
  });

  test('disables the submit button while fields are empty', async ({ page }) => {
    await expect(page.locator('p-button[icon="pi pi-user-plus"] button')).toBeDisabled();
  });

  test.describe('Username validation', () => {
    test('shows an error when username is shorter than 3 characters', async ({ page }) => {
      await page.locator('#reg-username').fill('ab');
      await page.locator('#reg-username').blur();
      await expect(page.locator('#username-error')).toBeVisible();
    });

    test('shows an error when username is longer than 20 characters', async ({ page }) => {
      await page.locator('#reg-username').fill('a'.repeat(21));
      await page.locator('#reg-username').blur();
      await expect(page.locator('#username-error')).toBeVisible();
    });

    test('shows an error when username is already taken (async validator)', async ({ page }) => {
      // "admin" is a known seeded user, so the async availability check must fail
      await page.locator('#reg-username').fill('admin');
      await page.locator('#reg-username').blur(); 
      await page.waitForTimeout(ASYNC_VALIDATOR_DELAY);
      await expect(page.locator('#username-error')).toBeVisible();
    });
  });

  test.describe('Password validation', () => {
    test('shows an error when password has no uppercase letter', async ({ page }) => {
      await page.locator('#reg-password').fill('test123*');
      await page.locator('#reg-password').blur();
      await expect(page.locator('#password-error')).toBeVisible();
    });

    test('shows an error when password has no digit', async ({ page }) => {
      await page.locator('#reg-password').fill('Testtest*');
      await page.locator('#reg-password').blur();
      await expect(page.locator('#password-error')).toBeVisible();
    });

    test('shows an error when password has no special character', async ({ page }) => {
      await page.locator('#reg-password').fill('Test1234');
      await page.locator('#reg-password').blur();
      await expect(page.locator('#password-error')).toBeVisible();
    });

    test('shows an error when password is shorter than 6 characters', async ({ page }) => {
      await page.locator('#reg-password').fill('T1*');
      await page.locator('#reg-password').blur();
      await expect(page.locator('#password-error')).toBeVisible();
    });
  });

  test('shows an error when password confirmation does not match', async ({ page }) => {
    await page.locator('#reg-username').fill(NEW_USERNAME);
    await page.locator('#reg-password').fill(VALID_PASSWORD);
    await page.locator('#reg-confirm').fill('DifferentPass1*');
    await page.locator('#reg-confirm').blur();
    await expect(page.locator('#confirm-error')).toBeVisible();
  });

  test('toggles password visibility between text and password', async ({ page }) => {
    const input = page.locator('#reg-password');
    await input.fill(VALID_PASSWORD);

    await expect(input).toHaveAttribute('type', 'password');
    await page.locator('button.eye-btn').first().click();
    await expect(input).toHaveAttribute('type', 'text');
  });

  test('registers successfully, shows a success banner, and redirects to /login', async ({
    page,
  }) => {
    await page.locator('#reg-username').fill(NEW_USERNAME);
    await page.waitForTimeout(ASYNC_VALIDATOR_DELAY); // let the availability check resolve
    await page.locator('#reg-password').fill(VALID_PASSWORD);
    await page.locator('#reg-confirm').fill(VALID_PASSWORD);
    await page.locator('p-button[icon="pi pi-user-plus"] button').click();

    await expect(page.locator('.success-banner')).toBeVisible();
    // Component redirects to /login after a 1.5s delay on success
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('a newly registered user can then log in', async ({ page }) => {
    // Self-contained: registers its own fresh user rather than depending on
    // the previous test's state, so this spec can run standalone or in any order.
    const username = `tester${Date.now()}`;

    await page.locator('#reg-username').fill(username);
    await page.waitForTimeout(ASYNC_VALIDATOR_DELAY);
    await page.locator('#reg-password').fill(VALID_PASSWORD);
    await page.locator('#reg-confirm').fill(VALID_PASSWORD);
    await page.locator('p-button[icon="pi pi-user-plus"] button').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    await page.locator('#login-username').fill(username);
    await page.locator('#login-password').fill(VALID_PASSWORD);
    await page.locator('p-button[icon="pi pi-sign-in"] button').click();

    await expect(page).not.toHaveURL(/\/login/);
  });
});
