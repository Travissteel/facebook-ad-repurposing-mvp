import { test, expect } from '@playwright/test';

test.describe('Facebook Ad Repurposer Dashboard', () => {
  
  test('homepage loads without errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to homepage
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that main elements are present
    await expect(page.locator('h1')).toContainText('Facebook Ad Repurposer');
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

    // Check for console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation items
    const navItems = [
      'Overview',
      'Ad Scraping', 
      'Ad Library',
      'Variation Studio',
      'Performance'
    ];

    for (const item of navItems) {
      await page.click(`text=${item}`);
      await page.waitForTimeout(500); // Allow for UI updates
    }
  });

  test('client selector functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check for client selector
    await expect(page.locator('text=Client:')).toBeVisible();
    
    // Try to open new client form
    await page.click('text=New Client');
    await expect(page.locator('text=Create New Client')).toBeVisible();
    
    // Close the form
    await page.click('text=Cancel');
  });

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('ROAS methodology is displayed', async ({ page }) => {
    await page.goto('/');
    
    // Check for ROAS methodology card
    await expect(page.locator('text=ROAS Methodology')).toBeVisible();
    
    // Check for the 5 variation types
    const variationTypes = [
      'Urgency-focused',
      'Social proof-heavy', 
      'Benefit-driven',
      'Problem-agitation',
      'Offer-optimized'
    ];

    for (const type of variationTypes) {
      await expect(page.locator(`text=${type}`)).toBeVisible();
    }
  });

  test('scraping interface loads properly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to scraping
    await page.click('text=Ad Scraping');
    
    // Check scraping form elements
    await expect(page.locator('text=Search Keywords')).toBeVisible();
    await expect(page.locator('input[placeholder*="fitness supplements"]')).toBeVisible();
    await expect(page.locator('text=Start Scraping')).toBeVisible();
  });

  test('variation studio shows methodology', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to variation studio
    await page.click('text=Variation Studio');
    
    // Check for variation types
    await expect(page.locator('text=Urgency-Focused')).toBeVisible();
    await expect(page.locator('text=Social Proof')).toBeVisible();
    await expect(page.locator('text=Benefit-Driven')).toBeVisible();
    await expect(page.locator('text=Problem Agitation')).toBeVisible();
    await expect(page.locator('text=Offer-Optimized')).toBeVisible();
  });

  test('performance dashboard shows metrics', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to performance
    await page.click('text=Performance');
    
    // Check for performance metrics
    await expect(page.locator('text=Actual ROAS')).toBeVisible();
    await expect(page.locator('text=Total Spend')).toBeVisible();
    await expect(page.locator('text=Best Performing Variation')).toBeVisible();
    await expect(page.locator('text=Prediction Accuracy')).toBeVisible();
  });

  test('no JavaScript errors on page load', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for JavaScript errors
    expect(jsErrors).toHaveLength(0);
  });

  test('API error handling', async ({ page }) => {
    // Mock API failure
    await page.route('/api/clients', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/');
    
    // The app should still load, even with API errors
    await expect(page.locator('h1')).toBeVisible();
  });

});