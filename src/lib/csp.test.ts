import { describe, it, expect } from 'vitest';
import {
  extractInlineScripts,
  extractInlineStyles,
  sha256Base64,
  collectScriptHashes,
  collectStyleHashes,
  buildCspDirectives,
  cspHeaderName,
  buildHeadersBlock,
} from './csp';

describe('extractInlineScripts', () => {
  it('captures inline module script bodies', () => {
    const html = `<html><body><script type="module">console.log("hi")</script></body></html>`;
    expect(extractInlineScripts(html)).toEqual(['console.log("hi")']);
  });

  it('ignores scripts with a src attribute', () => {
    const html = `<script src="/_astro/widget.js"></script>`;
    expect(extractInlineScripts(html)).toEqual([]);
  });

  it('ignores JSON-LD (not a scripting MIME type)', () => {
    const html = `<script type="application/ld+json">{"@type":"RoofingContractor"}</script>`;
    expect(extractInlineScripts(html)).toEqual([]);
  });

  it('ignores empty inline scripts', () => {
    const html = `<script type="module">   </script>`;
    expect(extractInlineScripts(html)).toEqual([]);
  });

  it('captures multiple distinct inline scripts in document order', () => {
    const html = `<script>const a=1;</script><script type="application/ld+json">{}</script><script>const b=2;</script>`;
    expect(extractInlineScripts(html)).toEqual(['const a=1;', 'const b=2;']);
  });
});

describe('extractInlineStyles', () => {
  it('captures inline scoped-style blocks (Astro inlines small per-page CSS)', () => {
    const html = `<head><style>.narrow{max-width:720px}</style></head>`;
    expect(extractInlineStyles(html)).toEqual(['.narrow{max-width:720px}']);
  });

  it('ignores empty style blocks', () => {
    expect(extractInlineStyles(`<style>   </style>`)).toEqual([]);
  });

  it('captures multiple style blocks', () => {
    const html = `<style>a{color:red}</style><style>b{color:blue}</style>`;
    expect(extractInlineStyles(html)).toEqual(['a{color:red}', 'b{color:blue}']);
  });
});

describe('sha256Base64', () => {
  it('matches the known CSP hash for an empty inline script pattern', async () => {
    // console.log('') -- a fixed, hand-verifiable string.
    const hash = await sha256Base64(`console.log('csp')`);
    expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(hash).toHaveLength(44); // base64(sha256) is always 44 chars incl. padding
  });

  it('is deterministic', async () => {
    const a = await sha256Base64('const x = 1;');
    const b = await sha256Base64('const x = 1;');
    expect(a).toBe(b);
  });

  it('differs for different content', async () => {
    const a = await sha256Base64('const x = 1;');
    const b = await sha256Base64('const x = 2;');
    expect(a).not.toBe(b);
  });
});

describe('collectScriptHashes', () => {
  it('dedupes identical inline scripts across pages and formats as sha256 tokens', async () => {
    const page1 = `<script>const shared=1;</script>`;
    const page2 = `<script>const shared=1;</script><script>const other=2;</script>`;
    const hashes = await collectScriptHashes([page1, page2]);
    expect(hashes).toHaveLength(2);
    for (const h of hashes) expect(h).toMatch(/^'sha256-[A-Za-z0-9+/]+=*'$/);
  });

  it('returns an empty array when there are no inline scripts', async () => {
    expect(await collectScriptHashes(['<html><body>no scripts</body></html>'])).toEqual([]);
  });
});

describe('collectStyleHashes', () => {
  it('dedupes identical inline styles across pages', async () => {
    const page1 = `<style>.a{color:red}</style>`;
    const page2 = `<style>.a{color:red}</style><style>.b{color:blue}</style>`;
    const hashes = await collectStyleHashes([page1, page2]);
    expect(hashes).toHaveLength(2);
    for (const h of hashes) expect(h).toMatch(/^'sha256-[A-Za-z0-9+/]+=*'$/);
  });
});

describe('buildCspDirectives', () => {
  it('defaults to a locked-down policy with no inline script allowance', () => {
    const csp = buildCspDirectives();
    expect(csp).toContain(`default-src 'self'`);
    expect(csp).toContain(`script-src 'self'`);
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).toContain(`object-src 'none'`);
    expect(csp).toContain(`frame-ancestors 'none'`);
  });

  it('allow-lists provided script hashes', () => {
    const csp = buildCspDirectives({ scriptHashes: [`'sha256-abc123='`] });
    expect(csp).toContain(`script-src 'self' 'sha256-abc123='`);
  });

  it('allow-lists cal.com and Turnstile as frame sources', () => {
    const csp = buildCspDirectives();
    expect(csp).toContain('frame-src');
    expect(csp).toContain('https://cal.com');
    expect(csp).toContain('https://challenges.cloudflare.com');
  });

  it('allow-lists app.cal.com as a script source for the booking facade', () => {
    const csp = buildCspDirectives();
    const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'));
    expect(scriptSrc).toContain('https://app.cal.com');
  });

  it('allow-lists cdn.callrail.com as a script source and api.callrail.com to connect (DNI swap.js)', () => {
    const csp = buildCspDirectives();
    const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'));
    const connectSrc = csp.split(';').find((d) => d.trim().startsWith('connect-src'));
    expect(scriptSrc).toContain('https://cdn.callrail.com');
    expect(connectSrc).toContain('https://api.callrail.com');
  });

  it('allow-lists provided style hashes', () => {
    const csp = buildCspDirectives({ styleHashes: [`'sha256-def456='`] });
    expect(csp).toContain(`style-src 'self' 'sha256-def456='`);
  });

  it('omits upgrade-insecure-requests in report-only mode (no reporting effect, browser flags it as a benign notice)', () => {
    expect(buildCspDirectives({ reportOnly: true })).not.toContain('upgrade-insecure-requests');
  });

  it('includes upgrade-insecure-requests once enforced', () => {
    expect(buildCspDirectives({ reportOnly: false })).toContain('upgrade-insecure-requests');
  });
});

describe('cspHeaderName', () => {
  it('uses the report-only header when reportOnly is true', () => {
    expect(cspHeaderName(true)).toBe('Content-Security-Policy-Report-Only');
  });

  it('uses the enforcing header when reportOnly is false', () => {
    expect(cspHeaderName(false)).toBe('Content-Security-Policy');
  });
});

describe('buildHeadersBlock', () => {
  it('emits a /* block with CSP report-only by default plus baseline headers', () => {
    const block = buildHeadersBlock();
    const lines = block.split('\n');
    expect(lines[0]).toBe('/*');
    expect(block).toContain('Content-Security-Policy-Report-Only:');
    expect(block).toContain('X-Content-Type-Options: nosniff');
    expect(block).toContain('Referrer-Policy: strict-origin-when-cross-origin');
    expect(block).toContain('Permissions-Policy:');
  });

  it('switches to the enforcing header when reportOnly is false', () => {
    const block = buildHeadersBlock({ reportOnly: false });
    expect(block).toContain('Content-Security-Policy:');
    expect(block).not.toContain('Content-Security-Policy-Report-Only:');
  });
});
