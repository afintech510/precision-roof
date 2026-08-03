import { describe, it, expect } from 'vitest';
import { validateRedirects, buildRedirectsFile, REDIRECTS } from './redirects';

describe('validateRedirects', () => {
  it('accepts an empty redirect set', () => {
    expect(validateRedirects([])).toEqual({ ok: true, errors: [] });
  });

  it('accepts single-hop, non-conflicting redirects', () => {
    const result = validateRedirects([
      { from: '/old-page/', to: '/new-page/' },
      { from: '/legacy/', to: '/services/' },
    ]);
    expect(result.ok).toBe(true);
  });

  it('rejects a self-redirect', () => {
    const result = validateRedirects([{ from: '/x/', to: '/x/' }]);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/self-redirect/);
  });

  it('rejects a chain (A -> B -> C)', () => {
    const result = validateRedirects([
      { from: '/a/', to: '/b/' },
      { from: '/b/', to: '/c/' },
    ]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => /chained redirect/.test(e))).toBe(true);
  });

  it('rejects a duplicate source (ambiguous mapping)', () => {
    const result = validateRedirects([
      { from: '/a/', to: '/b/' },
      { from: '/a/', to: '/c/' },
    ]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => /duplicate redirect source/.test(e))).toBe(true);
  });

  it('the live REDIRECTS set is currently empty and therefore valid (no legacy URLs at launch)', () => {
    expect(REDIRECTS).toEqual([]);
    expect(validateRedirects(REDIRECTS).ok).toBe(true);
  });
});

describe('buildRedirectsFile', () => {
  it('renders Cloudflare Pages _redirects lines, defaulting to 301', () => {
    const file = buildRedirectsFile([{ from: '/old/', to: '/new/' }]);
    expect(file).toBe('/old/ /new/ 301');
  });

  it('respects an explicit status', () => {
    const file = buildRedirectsFile([{ from: '/old/', to: '/new/', status: 302 }]);
    expect(file).toBe('/old/ /new/ 302');
  });

  it('joins multiple rules with newlines', () => {
    const file = buildRedirectsFile([
      { from: '/a/', to: '/b/' },
      { from: '/c/', to: '/d/' },
    ]);
    expect(file.split('\n')).toHaveLength(2);
  });
});
