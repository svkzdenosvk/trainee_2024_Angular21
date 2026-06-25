import { test, expect, Page } from '@playwright/test';

// City search hits a real third-party geocoding API (Open-Meteo), so result
// rendering can take a bit longer than purely local UI interactions.
const SEARCH_RESULTS_TIMEOUT = 30 * 1000;

// The backend runs on a free tier (Render + Supabase), both of which can
// cold-start after inactivity. Favourite add/remove triggers a POST then a
// refresh GET, so give that chain plenty of room to complete.
const FAVOURITES_NETWORK_TIMEOUT = 45 * 1000;

async function loginAsUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.locator('#login-username').fill('user');
  await page.locator('#login-password').fill('User123*');
  await page.locator('p-button[icon="pi pi-sign-in"] button').click();
  await expect(page).not.toHaveURL(/\/login/);
}

// Searches for a city and adds the first result to favourites.
// Waits for the actual addFavourite$ effect chain to finish (POST, then the
// refresh GET it triggers) before returning — navigating away any earlier
// can cut off the in-flight request and make the addition look like it never happened.
//
// IMPORTANT: the ⭐ button is a toggle (add/remove), and we deliberately never
// wipe favourites between test runs (shared account). So a city favourited by
// a previous run would otherwise get *removed* instead of added here. This
// function checks the button's current state first and, if it's already
// favourited, clicks once to clear it before doing the real add — making the
// test's outcome independent of leftover state from earlier runs.
async function addFirstSearchResultToFavourites(page: Page, query: string): Promise<string> {
  await page.goto('/');

  const searchInput = page.locator('input.search-input');
  await searchInput.fill(query);

  // The component debounces search input by 300ms before firing the request
  // (debounceTime(300) in CityPickerComponent). Waiting past that window
  // avoids racing a stale/in-flight request from a previous keystroke or
  // a previous test's search.
  // await page.waitForTimeout(500);
  await page.waitForTimeout(1500);

  const firstResult = page.locator('.result-item').first();
  await expect(firstResult).toBeVisible({ timeout: SEARCH_RESULTS_TIMEOUT });

  // Make sure the result actually corresponds to what we searched for,
  // not a stale result from a previous render.
  await expect(firstResult.locator('.city-name')).toContainText(query.slice(0, 3), {
    ignoreCase: true,
  });

  const cityName = await firstResult.locator('.city-name').innerText();
  const favButton = firstResult.locator('.fav-btn');

  // If a previous test run already left this city favourited, clear it first
  // so the click below is a real "add", not an accidental "remove".
  const alreadyFavourited = (await favButton.getAttribute('class'))?.includes('favourited');
  if (alreadyFavourited) {
    const clearResponse = page.waitForResponse(
      (res) => res.url().includes('/favourites') && res.request().method() === 'GET',
      { timeout: FAVOURITES_NETWORK_TIMEOUT },
    );
    await favButton.click();
    await clearResponse;
    await page.waitForTimeout(300);
    await expect(favButton).not.toHaveClass(/favourited/);
  }

  // addFavourite$ effect: POST /favourites, then GET /favourites to refresh state.
  // Wait for that refresh GET specifically — its completion means the store
  // (and therefore the backend) is fully up to date with the new favourite.
  const refreshResponse = page.waitForResponse(
    (res) => res.url().includes('/favourites') && res.request().method() === 'GET',
    { timeout: FAVOURITES_NETWORK_TIMEOUT },
  );
  await favButton.click();
  await refreshResponse;

  // Confirmed via manual testing: the store data and isFavourite() logic are
  // correct immediately after the refresh response lands, but Angular doesn't
  // always re-render the template on that exact same tick (the UI updates
  // correctly on the next interaction/CD cycle). A short wait here gives
  // change detection room to catch up before we assert on the rendered class.
  await page.waitForTimeout(300);
  await expect(favButton).toHaveClass(/favourited/);

  return cityName;
}

test.describe('Favourites', () => {
  // All tests here add/remove cities from the same logged-in user's
  // favourites list. Running them in parallel (separate browser contexts,
  // same backend account) causes race conditions on the shared list, so we
  // force them to run one after another.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('renders the favourites page without errors', async ({ page }) => {
    // We deliberately never wipe favourites between test runs (shared test
    // account, used by others too), so we can't assume the list is empty here.
    // .favourites-list is always present in the DOM (even with zero items),
    // so checking for it alone is enough to confirm the page rendered correctly.
    await page.goto('/favourites');

    await expect(page.locator('.favourites-container')).toBeVisible();
  });

  test('adds a city to favourites from search results and shows it on /favourites', async ({
    page,
  }) => {
    // Using a distinctive query rather than a common city name like "Prague" —
    // those return multiple same-named results from Open-Meteo, which trips
    // an Angular NG0955 duplicate-track-key bug in city-picker's @for loop
    // (`track city.name`) and makes the first result's click unreliable.
    const cityName = await addFirstSearchResultToFavourites(page, 'Bratislava');

    await page.goto('/favourites');
    await expect(page.locator('.favourite-item', { hasText: cityName })).toBeVisible();
  });

  test('removes a city from favourites via the trash button', async ({ page }) => {
    const cityName = await addFirstSearchResultToFavourites(page, 'Amsterdam');

    await page.goto('/favourites');
    const favouriteItem = page.locator('.favourite-item', { hasText: cityName });
    await expect(favouriteItem).toBeVisible();

    const refreshResponse = page.waitForResponse(
      (res) => res.url().includes('/favourites') && res.request().method() === 'GET',
      { timeout: FAVOURITES_NETWORK_TIMEOUT },
    );
    await favouriteItem.locator('.remove-btn').click();
    await refreshResponse;

    await expect(favouriteItem).not.toBeVisible();
  });

  // uncommenting this test only in local runs, because it fails in CI due to the shared test account's favourites list being unpredictable (other tests/users can add/remove cities at any time).

  test('navigates to the weather page when selecting a favourite city', async ({ page }) => {
    test.skip(
      !!process.env.CI,
      'Skipped in CI — city-picker search depends on Open-Meteo geocoding API which is unreliable in GitHub Actions',
    );

    const cityName = await addFirstSearchResultToFavourites(page, 'Copenhagen');

    await page.goto('/favourites');
    await page.locator('.favourite-item', { hasText: cityName }).locator('.select-btn').click();

    await expect(page).toHaveURL(/\/weather/);
  });
});
