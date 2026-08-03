// 301 redirect discipline (SOW §8): single-hop only, no chains/loops. The
// site launched with no prior URL structure, so REDIRECTS starts empty — this
// is the enforced mechanism ready for the day a URL is renamed/retired.

export interface RedirectRule {
  from: string;
  to: string;
  status?: 301 | 302;
}

export const REDIRECTS: RedirectRule[] = [];

export interface RedirectValidationResult {
  ok: boolean;
  errors: string[];
}

/** A redirect set is disciplined when: no rule points to itself, no rule's
 * `to` is another rule's `from` (a chain), and there's no `from` duplicated
 * across rules (an ambiguous mapping). */
export function validateRedirects(redirects: RedirectRule[]): RedirectValidationResult {
  const errors: string[] = [];
  const fromCounts = new Map<string, number>();
  const froms = new Set(redirects.map((r) => r.from));

  for (const rule of redirects) {
    if (rule.from === rule.to) errors.push(`self-redirect: ${rule.from} -> ${rule.to}`);
    if (froms.has(rule.to)) errors.push(`chained redirect (not single-hop): ${rule.from} -> ${rule.to} -> ...`);
    fromCounts.set(rule.from, (fromCounts.get(rule.from) ?? 0) + 1);
  }
  for (const [from, count] of fromCounts) {
    if (count > 1) errors.push(`duplicate redirect source: ${from} (${count} rules)`);
  }

  return { ok: errors.length === 0, errors };
}

/** Cloudflare Pages `_redirects` file format: `/from /to 301`. */
export function buildRedirectsFile(redirects: RedirectRule[]): string {
  return redirects.map((r) => `${r.from} ${r.to} ${r.status ?? 301}`).join('\n');
}
