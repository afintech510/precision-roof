import { test, expect } from '@playwright/test';

// CSP validation gate (spec §5.9/§7.3 [C2-009]). Launched in report-only mode
// per spec ("validated in report-only before enforce"): asserts the header is
// present with the expected directives, and that no page trips a CSP
// violation (report-only violations still log to the devtools console),
// which would mean an inline script's hash wasn't captured correctly.

const ROUTES = ['/', '/estimate/', '/contact/', '/services/roof-replacement/', '/areas/huntington/'];

test.describe('CSP', () => {
  for (const route of ROUTES) {
    test(`report-only CSP header present, no violations on ${route}`, async ({ page, request }) => {
      const violations: string[] = [];
      page.on('console', (msg) => {
        const text = msg.text();
        if (/content security policy/i.test(text)) violations.push(text);
      });

      const res = await request.get(route);
      const header = res.headers()['content-security-policy-report-only'];
      expect(header, `missing CSP-Report-Only header on ${route}`).toBeTruthy();
      expect(header).toContain(`default-src 'self'`);
      expect(header).toContain(`object-src 'none'`);
      expect(header).toContain(`frame-ancestors 'none'`);
      expect(header).not.toContain('unsafe-inline');

      await page.goto(route, { waitUntil: 'networkidle' });
      expect(violations, `CSP violations on ${route}:\n${violations.join('\n')}`).toEqual([]);
    });
  }

  test('other security headers are present', async ({ request }) => {
    const res = await request.get('/');
    const headers = res.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toBeTruthy();
  });
});
