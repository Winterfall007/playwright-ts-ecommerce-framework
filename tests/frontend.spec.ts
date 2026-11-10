import { test, expect } from '@playwright/test';

test.describe('Logged-in Front-end Experience', () => {

  test('should view front page with an active login session', async ({ page }) => {
    // 1. Navigate straight to the home page (inherits cookies automatically)
    await page.goto('/'); 

    // 2. Verify you are logged in on the front end
    // WordPress typically displays the black admin bar at the top of the frontend for logged-in users
    await expect(page.locator('#wpadminbar')).toBeVisible();

    // 3. Continue testing front-end components
    await expect(page.getByRole('heading', { name: 'Client Name', exact: true })).toBeVisible();
  });

});
