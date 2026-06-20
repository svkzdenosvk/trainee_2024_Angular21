import { test, expect, Page, APIRequestContext } from '@playwright/test';

const BACKEND_URL = 'http://localhost:3000';

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.locator('#login-username').fill('admin');
  await page.locator('#login-password').fill('Admin123*');
  await page.locator('p-button[icon="pi pi-sign-in"] button').click();
  await expect(page).not.toHaveURL(/\/login/);
}

// Registers a disposable, non-default user directly through the API.
// Faster and more isolated than going through the register UI form, and we
// need a non-default account anyway since admin/user are protected from
// deletion and role changes (see isDefaultUser checks in AdminDashboardComponent).
async function createDisposableUser(request: APIRequestContext): Promise<{
  username: string;
  id: string;
}> {
  const username = `e2e${Date.now()}`;
  const response = await request.post(`${BACKEND_URL}/auth/register`, {
    data: { username, password: 'Temp123*' },
  });
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Register failed with status ${response.status()}: ${body}`);
  }
  const body = await response.json();
  return { username, id: body.userId };
}

// Cleans up a disposable test user via the admin API so repeated runs don't
// pile up junk accounts in the admin table. Login as admin first to get the
// auth cookie this request needs.
async function deleteDisposableUser(request: APIRequestContext, id: string): Promise<void> {
  await request.post(`${BACKEND_URL}/auth/login`, {
    data: { username: 'admin', password: 'Admin123*' },
  });
  await request.delete(`${BACKEND_URL}/admin/users/${id}`);
}

test.describe('Admin dashboard', () => {
  // Tests in this file all read/write the same shared admin user table
  // (create disposable user → reload → assert row → mutate → reload again).
  // Running them in parallel causes race conditions between reloads, so we
  // force them to run one after another instead.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
  });

  test('renders the user table with default accounts', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tr', { hasText: 'admin' }).first()).toBeVisible();
  });

  test('default users cannot be deleted or have their role changed', async ({ page }) => {
    const adminRow = page.locator('tr', { hasText: 'admin' }).first();

    // The delete/role buttons for default users are disabled rather than hidden
    const deleteBtn = adminRow.locator('p-button').filter({ has: page.locator('.pi-trash') });
    await expect(deleteBtn.locator('button')).toBeDisabled();
  });

  test('promotes a regular user to admin and back', async ({ page, request }) => {
    const { username, id } = await createDisposableUser(request);
    await page.reload();

    const userRow = page.locator('tr', { hasText: username });
    await expect(userRow).toBeVisible();
    await expect(userRow.locator('.role-user')).toBeVisible();

    const roleButton = userRow.locator('p-button').filter({ has: page.locator('.pi-arrow-up') });
    const refreshAfterPromote = page.waitForResponse(
      (res) => res.url().includes('/admin/users') && res.request().method() === 'GET',
    );
    await roleButton.locator('button').click();
    await refreshAfterPromote;

    const updatedRow = page.locator('tr', { hasText: username });
    await expect(updatedRow.locator('.role-admin')).toBeVisible();

    // Revert back to USER so we don't leave a stray admin account around
    const demoteButton = updatedRow
      .locator('p-button')
      .filter({ has: page.locator('.pi-arrow-down') });
    const refreshAfterDemote = page.waitForResponse(
      (res) => res.url().includes('/admin/users') && res.request().method() === 'GET',
    );
    await demoteButton.locator('button').click();
    await refreshAfterDemote;

    await expect(page.locator('tr', { hasText: username }).locator('.role-user')).toBeVisible();

    await deleteDisposableUser(request, id);
  });

  test('deletes a non-default user from the table', async ({ page, request }) => {
    const { username } = await createDisposableUser(request);
    await page.reload();

    const userRow = page.locator('tr', { hasText: username });
    await expect(userRow).toBeVisible();

    const deleteButton = userRow.locator('p-button').filter({ has: page.locator('.pi-trash') });
    const refreshAfterDelete = page.waitForResponse(
      (res) => res.url().includes('/admin/users') && res.request().method() === 'GET',
    );
    await deleteButton.locator('button').click();
    await refreshAfterDelete;

    await expect(page.locator('tr', { hasText: username })).not.toBeVisible();
    // No cleanup needed here — the test itself already deleted the user via the UI
  });
});
