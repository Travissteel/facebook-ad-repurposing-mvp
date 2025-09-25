import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel to prevent resource conflicts
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reduce workers to prevent hanging */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Timeout settings */
  timeout: 30000, // 30 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for expect assertions
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Navigation timeout */
    navigationTimeout: 15000, // 15 seconds for page navigation

    /* Action timeout */
    actionTimeout: 10000, // 10 seconds for actions
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Disable video and screenshot to reduce memory usage
        video: 'off',
        screenshot: 'only-on-failure',
      },
    },

    // Disable other browsers for now to prevent conflicts
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // DISABLED: Auto-starting servers can cause hanging issues
  // Start servers manually with: npm run dev
  // webServer: [
  //   {
  //     command: 'npm run server',
  //     port: 3001,
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'npm run client',
  //     port: 3000,
  //     reuseExistingServer: !process.env.CI,
  //   }
  // ],
});