import { test, expect, Page } from '@playwright/test';

const SEARCH_RESULTS_TIMEOUT = 30000;
const WEATHER_API_TIMEOUT = 30000;

// Searches for a city and clicks "Select" on the first result
async function selectFirstSearchResult(page: Page, query: string): Promise<string> {
  await page.goto('/');

  const searchInput = page.locator('input.search-input');
  await searchInput.fill(query);

  // Počkajte na debounce
  await page.waitForTimeout(1500);

  // Skúsime nájsť výsledky
  let firstResult = page.locator('.result-item').first();
  const isVisible = await firstResult.isVisible().catch(() => false);

  if (!isVisible) {
    // Ak výsledky nie sú viditeľné, skúsime znova zadať query
    console.log(`Results not found for "${query}", retrying...`);
    await searchInput.clear();
    await page.waitForTimeout(500);
    await searchInput.fill(query);
    await page.waitForTimeout(2000);

    // Ešte raz skontrolujeme
    try {
      await page.waitForSelector('.result-item', {
        state: 'visible',
        timeout: SEARCH_RESULTS_TIMEOUT,
      });
    } catch (error) {
      // Ak stále nie sú výsledky, hodíme chybu
      throw new Error(`Search results not found for "${query}" after retry`);
    }
  }

  firstResult = page.locator('.result-item').first();
  await expect(firstResult).toBeVisible({ timeout: 5000 });
  await expect(firstResult.locator('.city-name')).toContainText(query.slice(0, 3), {
    ignoreCase: true,
  });

  const cityName = await firstResult.locator('.city-name').innerText();

  // Kliknite na Select
  await firstResult.locator('.select-btn').click();
  await expect(page).toHaveURL(/\/weather/);

  return cityName;
}

// Počká na načítanie dát v tabuľke
async function waitForWeatherData(page: Page): Promise<void> {
  // Počkajte na zmiznutie loading spinnera
  try {
    await expect(page.locator('.loading-wrapper')).not.toBeVisible({
      timeout: WEATHER_API_TIMEOUT,
    });
  } catch (error) {
    // Ak loading spinner nezmizne, skúsime manuálne načítať dáta
    console.log('Loading spinner still visible, trying manual load...');

    // Nájdeme tlačidlo Load Data
    const loadButton = page.locator('p-button[icon="pi pi-refresh"] button');
    await loadButton.click();

    // Počkáme na zmiznutie loading spinnera
    await expect(page.locator('.loading-wrapper')).not.toBeVisible({
      timeout: WEATHER_API_TIMEOUT,
    });
  }

  // Overíme, že tabuľka je viditeľná
  const table = page.locator('p-table table');
  await expect(table).toBeVisible({ timeout: 10000 });
}

test.describe('Weather table', () => {
  test.describe.configure({ mode: 'serial' });

  test('loads and displays weather data after selecting a city', async ({ page }) => {
    await selectFirstSearchResult(page, 'Helsinki');
    await waitForWeatherData(page);

    const table = page.locator('p-table table');
    const rowCount = await table.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(10);
  });

  test('shows the "no records" message when the filter matches nothing', async ({ page }) => {
    await selectFirstSearchResult(page, 'Berlin');
    await waitForWeatherData(page);

    const searchInput = page.locator('input[aria-label="Search weather state"]');
    await searchInput.fill('zzz-no-such-weather-state-zzz');

    await expect(page.locator('.empty-message')).toBeVisible();
  });

  test('navigates to /weather with the selected city encoded in the URL', async ({ page }) => {
    await page.goto('/');
    await page.locator('input.search-input').fill('Lisbon');
    await page.waitForTimeout(1500);

    // Skúsime nájsť výsledky
    let firstResult = page.locator('.result-item').first();
    const isVisible = await firstResult.isVisible().catch(() => false);

    if (!isVisible) {
      console.log('Results not found for "Lisbon", retrying...');
      const searchInput = page.locator('input.search-input');
      await searchInput.clear();
      await page.waitForTimeout(500);
      await searchInput.fill('Lisbon');
      await page.waitForTimeout(2000);

      await page.waitForSelector('.result-item', {
        state: 'visible',
        timeout: SEARCH_RESULTS_TIMEOUT,
      });
    }

    firstResult = page.locator('.result-item').first();
    const cityName = await firstResult.locator('.city-name').innerText();

    await firstResult.locator('.select-btn').click();

    await expect(page).toHaveURL(new RegExp(`/weather\\?.*city=${encodeURIComponent(cityName)}`));
  });

  test('filters table rows using the search box', async ({ page }) => {
    await selectFirstSearchResult(page, 'Madrid');
    await waitForWeatherData(page);

    const table = page.locator('p-table table');
    const totalRowsBefore = await table.locator('tbody tr').count();
    expect(totalRowsBefore).toBeGreaterThan(0);

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

    for (let i = 0; i < countAfter; i++) {
      await expect(filteredRows.nth(i).locator('.weather-state')).toContainText(
        firstStateText.trim(),
      );
    }
  });
});
