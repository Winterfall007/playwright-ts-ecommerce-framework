import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/staging-user.json';

const username = process.env.WP_TEST_USER;
const password = process.env.WP_TEST_PASSWORD;

if (!username || !password) {
  throw new Error(
    'Missing WP_TEST_USER or WP_TEST_PASSWORD. Check your local .env file.'
  );
}

setup('authenticate to staging', async ({ page, context }) => {
  // 1. Set verification cookies for both the apex domain and subdomain
  await context.addCookies([
    {
      name: 'wordpress_test_cookie',
      value: 'WP+Cookie+check',
      domain: 'client-namespace.com',
      path: '/'
    },
    {
      name: 'wordpress_test_cookie',
      value: 'WP+Cookie+check',
      domain: 'www.client-namespace.com',
      path: '/'
    }
  ]);

  // 2. Navigate directly to the base domain without forcing a www redirect
  await page.goto('https://client-namespace.com/wp-login.php');
  await page.waitForLoadState('networkidle');

  // 3. Populate credentials 
  await page.getByLabel('Gebruikersnaam of e-mailadres').fill(username);
  await page.locator('#user_pass').fill(password);
  
  // 4. Click login and wait for the page to navigate away to the admin panel
  await Promise.all([
    page.waitForNavigation({ url: /.*wp-admin.*/, timeout: 10000 }),
    page.getByRole('button', { name: "Login", exact: true }).click()
  ]);

  // 5. Explicitly extract and save the authenticated state snapshot
  await context.storageState({ path: authFile });
});
