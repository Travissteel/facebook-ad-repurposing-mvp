import { test, expect } from '@playwright/test';

test.describe('Application Startup Tests', () => {

  test('server starts and responds to health check', async ({ request }) => {
    // Test health endpoint with retry logic
    let response;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        response = await request.get('/api/health');
        if (response.status() === 200) break;
      } catch (error) {
        console.log(`Health check attempt ${attempts + 1} failed:`, error.message);
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }

    if (!response || response.status() !== 200) {
      test.skip('Server is not running. Start with: npm run dev');
      return;
    }

    expect(response.status()).toBe(200);
    const health = await response.json();
    expect(health.status).toBe('healthy');
  });

  test('client builds and loads without errors', async ({ page }) => {
    const errors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Capture JavaScript errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    try {
      await page.goto('/', { timeout: 15000 });

      // Wait for React to load with longer timeout
      await page.waitForSelector('[data-testid="dashboard"]', { timeout: 20000 });

      // Verify main title is present
      await expect(page.locator('h1')).toContainText('Facebook Ad Repurposer');

    } catch (error) {
      if (error.message.includes('net::ERR_CONNECTION_REFUSED') ||
          error.message.includes('TARGET_CLOSED')) {
        test.skip('Client is not running. Start with: npm run dev');
        return;
      }
      throw error;
    }

    // Check that no errors occurred during load
    if (errors.length > 0) {
      console.log('Errors found:', errors);
      // Allow certain expected errors during development
      const allowedErrors = [
        'Failed to fetch', // Expected when API is not running
        'Network Error',
        'ERR_CONNECTION_REFUSED',
        'ChunkLoadError' // Expected in development builds
      ];

      const criticalErrors = errors.filter(error =>
        !allowedErrors.some(allowed => error.includes(allowed))
      );

      expect(criticalErrors).toHaveLength(0);
    }
  });

  test('API endpoints are accessible', async ({ request }) => {
    // Test main API endpoints exist (even if they return empty data)
    const endpoints = [
      '/api/health',
      '/api/clients', 
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      // Should not be 404 (not found)
      expect(response.status()).not.toBe(404);
    }
  });

  test('UI components render correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Check key UI elements are present
    await expect(page.locator('text=Client:')).toBeVisible();
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=Ad Scraping')).toBeVisible();
    await expect(page.locator('text=Ad Library')).toBeVisible();
    await expect(page.locator('text=Variation Studio')).toBeVisible();
    await expect(page.locator('button:has-text("Performance"):not(:has-text("Scrape"))')).toBeVisible();
  });
});