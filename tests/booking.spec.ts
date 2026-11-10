import { test, expect } from '@playwright/test';

test.describe('Booking page', () => {
  test('shows a booking widget or calendar content', async ({ page }) => {
    await page.goto('/afspraken/');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    const widget = main.locator(
      'iframe, [id*="booking" i], [class*="booking" i], ' +
        '[id*="bookly" i], [class*="bookly" i], ' +
        '[id*="calendar" i], [class*="calendar" i]'
    ).first();
    const calendarText = main
      .getByText(
        /calendar|available|select a date|appointment|afspraak|beschikbaarheid|kies een datum/i
      )
      .first();

    await expect
      .poll(async () => (await widget.isVisible()) || (await calendarText.isVisible()))
      .toBe(true);
  });
});