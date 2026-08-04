import { test, expect } from '@playwright/test';

// LeadForm UI mechanics (spec §4/§9): step navigation, aria-live progress
// announcements, and that values survive back-navigation between steps
// (WCAG 2.2 redundant-entry — nothing should ever need re-typing). No
// backend is available against the static test server, so this exercises
// only the client-side stepper, not an actual /api/lead submission.

test.describe('LeadForm stepper', () => {
  test('advances through all 3 steps and back, preserving entered values', async ({ page }) => {
    await page.goto('/contact/');

    const progress = page.locator('#lf-progress');
    await expect(progress).toHaveText(/Step 1 of 3/);

    await page.fill('#lf-zip', '11743');
    await page.selectOption('#lf-service', 'roof-replacement');
    await page.click('.lf-next[data-next="2"]');

    await expect(progress).toHaveText(/Step 2 of 3/);
    await expect(page.locator('[data-step="1"]')).toBeHidden();
    await expect(page.locator('[data-step="2"]')).toBeVisible();

    await page.fill('#lf-name', 'Pat Doe');
    await page.fill('#lf-phone', '(631) 555-0100');
    await page.click('.lf-next[data-next="3"]');

    await expect(progress).toHaveText(/Step 3 of 3/);
    await expect(page.locator('#lf-review')).toContainText('11743');
    await expect(page.locator('#lf-review')).toContainText('Pat Doe');

    // Back to step 2 — values must still be there (redundant-entry).
    await page.click('.lf-back[data-back="2"]');
    await expect(progress).toHaveText(/Step 2 of 3/);
    await expect(page.locator('#lf-name')).toHaveValue('Pat Doe');
    await expect(page.locator('#lf-phone')).toHaveValue('(631) 555-0100');

    // Back to step 1 — same.
    await page.click('.lf-back[data-back="1"]');
    await expect(page.locator('#lf-zip')).toHaveValue('11743');
  });

  test('blocks advancing past step 1 with an empty required field', async ({ page }) => {
    await page.goto('/contact/');
    await page.click('.lf-next[data-next="2"]');
    // Native HTML5 validation keeps step 1 active — no navigation occurred.
    await expect(page.locator('#lf-progress')).toHaveText(/Step 1 of 3/);
    await expect(page.locator('[data-step="2"]')).toBeHidden();
  });

  test('all three steps are visible without JS (progressive enhancement baseline)', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/contact/');
    for (const step of [1, 2, 3]) {
      await expect(page.locator(`[data-step="${step}"]`)).toBeVisible();
    }
    const form = page.locator('#lead-form');
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form).toHaveAttribute('action', '/api/lead');
    await context.close();
  });
});
