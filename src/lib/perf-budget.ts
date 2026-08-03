// Performance-budget checks (spec §4, SOW §7, F-020). Pure HTML inspectors so
// they unit-test in isolation; an Astro build integration runs them over the
// emitted pages and fails the build when the budget is exceeded (DEC-C: ≤4
// concurrent async third-party scripts).

/** Absolute-URL <script src> whose host differs from the site host = third party. */
export function thirdPartyScripts(html: string, siteHost: string): string[] {
  const hosts: string[] = [];
  const re = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const src = m[1];
    let host: string | null = null;
    if (src.startsWith('//')) host = src.slice(2).split('/')[0];
    else if (/^https?:\/\//i.test(src)) {
      try { host = new URL(src).host; } catch { host = null; }
    }
    if (host && host !== siteHost) hosts.push(host);
  }
  return hosts;
}

export function countThirdPartyScripts(html: string, siteHost: string): number {
  return thirdPartyScripts(html, siteHost).length;
}

/** Count <img> tags missing an explicit width or height (causes layout shift). */
export function imagesMissingDimensions(html: string): number {
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  return imgs.filter((tag) => !/\bwidth=/.test(tag) || !/\bheight=/.test(tag)).length;
}

export interface BudgetResult {
  scripts: number;
  imagesMissingDims: number;
  ok: boolean;
}

export function checkBudget(html: string, siteHost: string, maxScripts = 4): BudgetResult {
  const scripts = countThirdPartyScripts(html, siteHost);
  const imagesMissingDims = imagesMissingDimensions(html);
  return { scripts, imagesMissingDims, ok: scripts <= maxScripts && imagesMissingDims === 0 };
}
