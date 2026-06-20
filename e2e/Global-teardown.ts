import { request as playwrightRequest } from '@playwright/test';

const BACKEND_URL = 'http://localhost:3000';

// Any account whose username starts with one of these is considered
// disposable test data and safe to delete after the run.
const DISPOSABLE_PREFIXES = ['e2e'];

// Runs once after the entire test suite finishes (configured as
// `globalTeardown` in playwright.config.ts). Logs in as admin, fetches the
// user list, and removes anything matching our disposable-username prefixes.
// This means individual tests/specs never need their own cleanup logic.
export default async function globalTeardown() {
  const context = await playwrightRequest.newContext({ baseURL: BACKEND_URL });

  try {
    const loginRes = await context.post('/auth/login', {
      data: { username: 'admin', password: 'Admin123*' },
    });
    if (!loginRes.ok()) {
      console.warn('Global teardown: admin login failed, skipping cleanup');
      return;
    }

    const usersRes = await context.get('/admin/users');
    if (!usersRes.ok()) {
      console.warn('Global teardown: could not fetch user list, skipping cleanup');
      return;
    }

    const users: { id: string; username: string }[] = await usersRes.json();
    const disposable = users.filter((u) =>
      DISPOSABLE_PREFIXES.some((prefix) => u.username.startsWith(prefix)),
    );

    for (const user of disposable) {
      await context.delete(`/admin/users/${user.id}`);
    }

    console.log(`Global teardown: removed ${disposable.length} disposable test user(s)`);
  } finally {
    await context.dispose();
  }
}
