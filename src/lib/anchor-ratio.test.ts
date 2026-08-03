import { describe, it, expect } from 'vitest';
import { extractAnchors, isExactMatchAnchor, computeAnchorRatio } from './anchor-ratio';

describe('extractAnchors', () => {
  it('captures href + tag-stripped text', () => {
    const html = `<a href="/areas/huntington/">Huntington <span aria-hidden="true">→</span></a>`;
    expect(extractAnchors(html)).toEqual([{ href: '/areas/huntington/', text: 'Huntington →' }]);
  });

  it('ignores mailto/tel links', () => {
    const html = `<a href="tel:+15551234567">Call</a><a href="mailto:hi@x.com">Mail</a>`;
    expect(extractAnchors(html)).toEqual([]);
  });

  it('skips anchors with no visible text', () => {
    const html = `<a href="/x/"><svg></svg></a>`;
    expect(extractAnchors(html)).toEqual([]);
  });
});

describe('isExactMatchAnchor', () => {
  const services = ['Roof Replacement', 'Roof Repair'];
  const towns = ['Huntington', 'Smithtown'];

  it('matches text containing both a service and a town name', () => {
    expect(isExactMatchAnchor('Roof Replacement Huntington', services, towns)).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isExactMatchAnchor('roof repair in smithtown', services, towns)).toBe(true);
  });

  it('does not match a service name alone', () => {
    expect(isExactMatchAnchor('Roof Replacement', services, towns)).toBe(false);
  });

  it('does not match a town name alone', () => {
    expect(isExactMatchAnchor('Huntington', services, towns)).toBe(false);
  });

  it('does not match unrelated text', () => {
    expect(isExactMatchAnchor('Book a free inspection', services, towns)).toBe(false);
  });
});

describe('computeAnchorRatio', () => {
  const services = ['Roof Replacement'];
  const towns = ['Huntington'];

  it('computes 0 ratio when nothing is an exact match', () => {
    const html = `<a href="/about/">About</a><a href="/contact/">Book a free inspection</a>`;
    const result = computeAnchorRatio([html], services, towns);
    expect(result).toEqual({ total: 2, exactMatch: 0, ratio: 0, exactMatchAnchors: [] });
  });

  it('computes the ratio across multiple pages', () => {
    const page1 = `<a href="/a/">Roof Replacement Huntington</a><a href="/b/">About</a>`;
    const page2 = `<a href="/c/">Contact</a><a href="/d/">Huntington</a>`;
    const result = computeAnchorRatio([page1, page2], services, towns);
    expect(result.total).toBe(4);
    expect(result.exactMatch).toBe(1);
    expect(result.ratio).toBe(0.25);
  });

  it('returns ratio 0 (not NaN) with zero anchors', () => {
    expect(computeAnchorRatio([''], services, towns).ratio).toBe(0);
  });

  it('flags a ratio above 30% (the CI threshold)', () => {
    const html = `<a href="/a/">Roof Replacement Huntington</a><a href="/b/">About</a>`;
    const result = computeAnchorRatio([html], services, towns);
    expect(result.ratio).toBeGreaterThan(0.3);
  });
});
