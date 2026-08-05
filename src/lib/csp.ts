// Content-Security-Policy header construction (spec §5.9/§7.3 [C2-009]).
// Static-first build: HTML is prerendered, so there is no per-request nonce —
// inline <script> blocks are allow-listed by SHA-256 hash instead. Pure
// functions so they unit-test without a build; an Astro integration
// (src/integrations/csp.ts) runs this over the emitted pages and writes the
// header into dist/client/_headers.

const B64 = { encode: (bytes: Uint8Array) => Buffer.from(bytes).toString('base64') };

/** Inline (no `src=`) <script> tags whose content is CSP-relevant JS. JSON-LD
 * (`type="application/ld+json"`) is not a scripting MIME type — browsers don't
 * subject it to `script-src`, so it's excluded to keep the hash list minimal. */
export function extractInlineScripts(html: string): string[] {
  const out: string[] = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const body = m[2];
    if (/\bsrc\s*=/.test(attrs)) continue;
    const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
    const type = typeMatch?.[1]?.toLowerCase();
    if (type === 'application/ld+json' || type === 'application/json') continue;
    if (body.trim() === '') continue;
    out.push(body);
  }
  return out;
}

/** Astro inlines small per-page scoped stylesheets as <style> elements rather
 * than external files (below its size threshold) — these need the same
 * hash-allow-listing as inline scripts, under `style-src`. */
export function extractInlineStyles(html: string): string[] {
  const out: string[] = [];
  const re = /<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const body = m[2];
    if (body.trim() === '') continue;
    out.push(body);
  }
  return out;
}

export async function sha256Base64(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return B64.encode(new Uint8Array(digest));
}

async function hashUnique(bodies: Set<string>): Promise<string[]> {
  const hashes = await Promise.all([...bodies].map(sha256Base64));
  return [...new Set(hashes)].sort().map((h) => `'sha256-${h}'`);
}

/** Hashes for every unique inline script across one or more rendered pages. */
export async function collectScriptHashes(htmlDocs: string[]): Promise<string[]> {
  const bodies = new Set<string>();
  for (const html of htmlDocs) for (const body of extractInlineScripts(html)) bodies.add(body);
  return hashUnique(bodies);
}

/** Hashes for every unique inline <style> block across one or more pages. */
export async function collectStyleHashes(htmlDocs: string[]): Promise<string[]> {
  const bodies = new Set<string>();
  for (const html of htmlDocs) for (const body of extractInlineStyles(html)) bodies.add(body);
  return hashUnique(bodies);
}

export interface CspOptions {
  /** `'sha256-...'` tokens for allow-listed inline scripts. */
  scriptHashes?: string[];
  /** `'sha256-...'` tokens for allow-listed inline <style> blocks. */
  styleHashes?: string[];
  /** Report-only (validate) vs. enforced. Spec: launch in report-only first. */
  reportOnly?: boolean;
}

/** Cal.com and challenges.cloudflare.com are the launch-confirmed frame
 * sources (§5.9); the financing vendor is not yet chosen (Phase 05c, gated on
 * Adam per BUILDPLAN) so it isn't allow-listed until that decision lands. */
export function buildCspDirectives(opts: CspOptions = {}): string {
  const reportOnly = opts.reportOnly ?? true;
  // https://app.cal.com serves the booking-facade embed loader (spec §7.3);
  // interaction-loaded, so it never runs on first paint. cdn.callrail.com
  // serves the DNI swap.js loader (Phase 05c Task 1) — present in every page
  // <head> once configured, so it's allow-listed unconditionally rather than
  // per-render like the hash lists.
  const scriptSrc = ["'self'", ...(opts.scriptHashes ?? []), 'https://app.cal.com', 'https://cdn.callrail.com'];
  const styleSrc = ["'self'", ...(opts.styleHashes ?? [])];
  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    // CallRail's swap.js calls back to its own API to resolve the tracking
    // number for the current visit (spec §3.2/§5.3, Phase 05c Task 1).
    `connect-src 'self' https://challenges.cloudflare.com https://www.google-analytics.com https://region1.google-analytics.com https://api.callrail.com`,
    `frame-src https://cal.com https://app.cal.com https://challenges.cloudflare.com`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];
  // Report-only ignores upgrade-insecure-requests (it has no reporting effect,
  // only an enforcement one) — Chromium logs a benign notice for it that
  // would otherwise be indistinguishable from a real violation in this mode.
  if (!reportOnly) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

export function cspHeaderName(reportOnly: boolean): string {
  return reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
}

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
};

/** Renders a Cloudflare Pages `_headers` block for `/*` (spec §5.9/§7.3). */
export function buildHeadersBlock(opts: CspOptions = {}): string {
  const reportOnly = opts.reportOnly ?? true;
  const lines = [
    '/*',
    `  ${cspHeaderName(reportOnly)}: ${buildCspDirectives(opts)}`,
    ...Object.entries(SECURITY_HEADERS).map(([k, v]) => `  ${k}: ${v}`),
  ];
  return lines.join('\n');
}
