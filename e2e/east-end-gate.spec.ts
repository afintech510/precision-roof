import { test, expect } from '@playwright/test';

// East-End informational-gate render check (Phase 03c Task 2, spec §3.2/§7,
// SOW §5). Southampton/East Hampton/Shelter Island are excluded from active
// advertising — their pages must carry no book/lead/quote CTA, no price, and
// no LeadForm/QuoteWidget/CalcomFacade conversion island. Complements the
// axe a11y sweep (e2e/a11y.spec.ts), which covers these routes too.

const GATED_ROUTES = ['/areas/southampton/', '/areas/east-hampton/', '/areas/shelter-island/'];

for (const route of GATED_ROUTES) {
  test(`gated town page ${route} carries no advertising CTA or price`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });

    // Scoped to <main> — the header/footer's site-wide phone contact chrome
    // (present on every page, including /accessibility/) is not a town-specific
    // advertising claim and is out of scope for this gate; the page's own
    // hero CTA, price panel, and bottom CTA section are what must be absent.
    const main = page.locator('#main');
    await expect(main.getByRole('link', { name: /book a free inspection/i })).toHaveCount(0);
    await expect(main.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(main.locator('.tprice')).toHaveCount(0);
    await expect(main.locator('.lead-form')).toHaveCount(0);
    await expect(main.locator('.quote-widget')).toHaveCount(0);
    await expect(main.locator('.calcom-facade')).toHaveCount(0);

    const mainText = await main.innerText();
    expect(mainText).not.toMatch(/\$[\d,]{4,}/); // no dollar-figure price ranges
  });
}

test('/areas/ hub links out to the gated East-End towns (reachability, not advertising)', async ({ page }) => {
  await page.goto('/areas/', { waitUntil: 'networkidle' });
  for (const route of GATED_ROUTES) {
    await expect(page.locator(`a[href="${route}"]`)).toHaveCount(1);
  }
});

test('advertising town page still shows the standard CTA + price (branch regression check)', async ({ page }) => {
  await page.goto('/areas/huntington/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('link', { name: /book a free inspection/i }).first()).toBeVisible();
  await expect(page.locator('.tprice')).toHaveCount(1);
});
