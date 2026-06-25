import { test, expect, Page } from '@playwright/test';

const SEARCH_RESULTS_TIMEOUT = 15 * 1000;

// Weather data comes from the public Open-Meteo forecast API (third party),
// so give the request realistic room to complete.
const WEATHER_API_TIMEOUT = 20 * 1000;

// Searches for a city and clicks "Select" on the first result, which
// navigates to /weather (guarded by cityGuard — only reachable once a city
// has actually been selected via CityService). No login required: the
// favourites star button needs auth, but city selection / weather data does not.
async function selectFirstSearchResult(page: Page, query: string): Promise<string> {
  await page.goto('/');

  const searchInput = page.locator('input.search-input');
  await searchInput.fill(query);

  // Component debounces search input by 300ms before firing the request.
  // await page.waitForTimeout(500);
  await page.waitForTimeout(1500);

  const firstResult = page.locator('.result-item').first();
  await expect(firstResult).toBeVisible({ timeout: SEARCH_RESULTS_TIMEOUT });
  await expect(firstResult.locator('.city-name')).toContainText(query.slice(0, 3), {
    ignoreCase: true,
  });

  const cityName = await firstResult.locator('.city-name').innerText();

  const weatherResponse = page.waitForResponse(
    (res) => res.url().includes('api.open-meteo.com/v1/forecast'),
    { timeout: WEATHER_API_TIMEOUT },
  );
  await firstResult.locator('.select-btn').click();
  await expect(page).toHaveURL(/\/weather/);
  await weatherResponse;

  return cityName;
}

test.describe('Weather table', () => {
  // Sequential to avoid juggling multiple in-flight Open-Meteo requests
  // across parallel browser contexts unnecessarily.
  test.describe.configure({ mode: 'serial' });

  test('loads and displays weather data after selecting a city', async ({ page }) => {
    test.skip(
      !!process.env.CI,
      'Skipped in CI — city-picker search depends on Open-Meteo geocoding API which is unreliable in GitHub Actions',
    );

    await selectFirstSearchResult(page, 'Helsinki');

    // Loading spinner should disappear once data arrives
    await expect(page.locator('.loading-wrapper')).not.toBeVisible({
      timeout: WEATHER_API_TIMEOUT,
    });

    const table = page.locator('p-table table');
    await expect(table).toBeVisible();

    // Default range is -7/+7 days = up to 15 days of hourly data, so the
    // table should render well more than just one row.
    const rowCount = await table.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(10);
  });

  test('shows the "no records" message when the filter matches nothing', async ({ page }) => {
    await selectFirstSearchResult(page, 'Berlin');
    await expect(page.locator('.loading-wrapper')).not.toBeVisible({
      timeout: WEATHER_API_TIMEOUT,
    });

    const searchInput = page.locator('input[aria-label="Search weather state"]');
    // Gibberish that can't match any translated weather-state label.
    await searchInput.fill('zzz-no-such-weather-state-zzz');

    await expect(page.locator('.empty-message')).toBeVisible();
  });

  test('navigates to /weather with the selected city encoded in the URL', async ({ page }) => {
    await page.goto('/');
    await page.locator('input.search-input').fill('Lisbon');
    await page.waitForTimeout(500);

    const firstResult = page.locator('.result-item').first();
    await expect(firstResult).toBeVisible({ timeout: SEARCH_RESULTS_TIMEOUT });
    const cityName = await firstResult.locator('.city-name').innerText();

    await firstResult.locator('.select-btn').click();

    // selectCity() navigates with the city's name as a query param
    // (see CityPickerComponent.selectCity), which is stable and present
    // immediately on navigation — unlike the loading spinner's city-name
    // text, which can appear and disappear before assertions run on a
    // fast/cached API response.
    await expect(page).toHaveURL(new RegExp(`/weather\\?.*city=${encodeURIComponent(cityName)}`));
  });

  test('filters table rows using the search box', async ({ page }) => {
    test.skip(
      !!process.env.CI,
      'Skipped in CI — city-picker search depends on Open-Meteo geocoding API which is unreliable in GitHub Actions',
    );

    await selectFirstSearchResult(page, 'Madrid');
    await expect(page.locator('.loading-wrapper')).not.toBeVisible({
      timeout: WEATHER_API_TIMEOUT,
    });

    const table = page.locator('p-table table');
    const totalRowsBefore = await table.locator('tbody tr').count();
    expect(totalRowsBefore).toBeGreaterThan(0);

    // Filter text is language-agnostic: instead of asserting a specific
    // weather-state string (which depends on the currently active locale —
    // "clear sky" in English vs. a Slovak translation, etc.), we grab
    // whatever the first row's actual rendered state text is and filter by
    // that. This guarantees at least one match regardless of language.
    const firstStateText = await table
      .locator('tbody tr')
      .first()
      .locator('.weather-state')
      .innerText();

    const searchInput = page.locator('input[aria-label="Search weather state"]');
    await searchInput.fill(firstStateText.trim());

    const filteredRows = table.locator('tbody tr');
    await expect(filteredRows.first()).toBeVisible();

    const countAfter = await filteredRows.count();
    expect(countAfter).toBeGreaterThan(0);
    expect(countAfter).toBeLessThanOrEqual(totalRowsBefore);

    // Verify the filter actually filtered, not just that the table still
    // renders something: every remaining visible row must contain the
    // filtered text (checking all of them, not just a sample, since
    // PrimeNG's client-side filter should be exact about this).
    for (let i = 0; i < countAfter; i++) {
      await expect(filteredRows.nth(i).locator('.weather-state')).toContainText(
        firstStateText.trim(),
      );
    }
  });
});
