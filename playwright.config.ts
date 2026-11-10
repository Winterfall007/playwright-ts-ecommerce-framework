import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';


export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: 'https://client-name.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        storageState: 'playwright/.auth/staging-user.json',
        launchOptions: {
          // Sometimes adding arguments helps bypass strict browser checks
          args: ['--disable-blink-features=AutomationControlled']
       },
      },
    },
  ],
});