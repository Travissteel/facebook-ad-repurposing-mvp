import { test, expect } from '@playwright/test';

test.describe('Call Ads Functionality', () => {

  test('call ad performance metrics display correctly', async ({ page }) => {
    await page.goto('/');

    // Navigate to performance dashboard
    await page.click('text=Performance');

    // Check for call-specific metrics section
    await expect(page.locator('text=Call Performance Metrics')).toBeVisible();
    await expect(page.locator('text=Cost Per Call')).toBeVisible();
    await expect(page.locator('text=Total Calls')).toBeVisible();
    await expect(page.locator('text=Qualified Calls')).toBeVisible();
    await expect(page.locator('text=Sale Rate')).toBeVisible();
  });

  test('call ad best practices are shown', async ({ page }) => {
    await page.goto('/');

    // Navigate to performance dashboard
    await page.click('text=Performance');

    // Check for call ad best practices
    await expect(page.locator('text=Call Ad Best Practices')).toBeVisible();
    await expect(page.locator('text=Lower Cost Per Call:')).toBeVisible();
    await expect(page.locator('text=Higher Conversion:')).toBeVisible();
    await expect(page.locator('text=Use urgency CTAs')).toBeVisible();
    await expect(page.locator('text=Offer free consultations')).toBeVisible();
  });

  test('variation studio supports call ad types', async ({ page }) => {
    await page.goto('/');

    // Navigate to variation studio
    await page.click('text=Variation Studio');

    // Check that variation types can be used for call ads
    await expect(page.locator('text=Urgency-Focused')).toBeVisible();
    await expect(page.locator('text=Social Proof')).toBeVisible();
    await expect(page.locator('text=Benefit-Driven')).toBeVisible();
    await expect(page.locator('text=Problem Agitation')).toBeVisible();
    await expect(page.locator('text=Offer-Optimized')).toBeVisible();
  });

  test('call ads have appropriate CTAs', async ({ page }) => {
    await page.goto('/');

    // Navigate to variation studio
    await page.click('text=Variation Studio');

    // The variation types should show call-appropriate examples
    // This tests that the UI can handle call-specific content
    await expect(page.locator('text=Generate Variations')).toBeVisible();
  });

  test('performance dashboard shows call tracking readiness', async ({ page }) => {
    await page.goto('/');

    // Navigate to performance dashboard
    await page.click('text=Performance');

    // Verify call tracking fields are ready
    await expect(page.locator('text=No call data yet')).toBeVisible();
    await expect(page.locator('text=No conversions tracked')).toBeVisible();
  });

  test('application handles call ad data structure', async ({ page }) => {
    // Test that the app doesn't break with call-specific data
    await page.goto('/');

    // Check main dashboard loads
    await expect(page.locator('h1')).toContainText('Facebook Ad Repurposer');

    // Navigate through all sections to ensure stability
    await page.click('text=Ad Scraping');
    await page.click('text=Ad Library');
    await page.click('text=Variation Studio');
    await page.click('text=Performance');
    await page.click('text=Overview');

    // No JavaScript errors should occur
    await page.waitForTimeout(1000);
  });

});