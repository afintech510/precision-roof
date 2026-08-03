import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Result } from 'axe-core';

// Automated accessibility audit (spec §9, [C2-016], [C2-032]). Every prerendered
// marketing route is scanned with axe against WCAG 2.0/2.1/2.2 A + AA rules,
// across the 375 / 768 / 1440 viewport matrix (driven by the Playwright
// projects). Backs the /accessibility page's AA conformance claim with a gate.

const ROUTES: string[] = [
  '/',
  '/about/',
  '/contact/',
  '/financing/',
  '/reviews/',
  '/accessibility/',
  '/areas/',
  '/areas/huntington/',
  '/areas/smithtown/',
  '/areas/babylon/',
  '/services/',
  '/services/roof-replacement/',
  '/services/roof-repair/',
  '/services/emergency-roof-repair/',
  '/services/storm-damage-roof-repair/',
  '/services/roof-leak-repair/',
  '/services/flat-low-slope-roofing/',
  '/services/metal-roofing/',
  '/services/roof-inspection/',
];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

function formatViolations(url: string, violations: Result[]): string {
  if (violations.length === 0) return '';
  return (
    `${violations.length} axe violation(s) on ${url}:\n` +
    violations
      .map((v) => {
        const nodes = v.nodes.map((n) => `      • ${n.target.join(' ')}`).join('\n');
        return `  [${v.impact ?? 'n/a'}] ${v.id} — ${v.help}\n    ${v.helpUrl}\n${nodes}`;
      })
      .join('\n')
  );
}

async function auditRoute(page: Page, route: string): Promise<void> {
  await page.goto(route, { waitUntil: 'networkidle' });
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations, formatViolations(route, violations)).toEqual([]);
}

for (const route of ROUTES) {
  test(`a11y ${route}`, async ({ page }) => {
    await auditRoute(page, route);
  });
}
