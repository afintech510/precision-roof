import { describe, it, expect } from 'vitest';
import { extractInternalLinks, buildLinkGraph, bfsDepths, findDepthViolations } from './link-graph';

describe('extractInternalLinks', () => {
  it('extracts relative internal hrefs', () => {
    const html = `<a href="/about/">About</a><a href="/contact/">Contact</a>`;
    expect(extractInternalLinks(html, 'example.com')).toEqual(['/about/', '/contact/']);
  });

  it('extracts same-host absolute hrefs and strips query/hash', () => {
    const html = `<a href="https://example.com/services/?ref=nav#top">Services</a>`;
    expect(extractInternalLinks(html, 'example.com')).toEqual(['/services/']);
  });

  it('ignores external hosts, mailto, tel and in-page anchors', () => {
    const html = `
      <a href="https://otherhost.com/x">ext</a>
      <a href="mailto:hi@example.com">mail</a>
      <a href="tel:+15551234567">call</a>
      <a href="#main">skip</a>
    `;
    expect(extractInternalLinks(html, 'example.com')).toEqual([]);
  });
});

describe('bfsDepths + findDepthViolations', () => {
  it('computes 0/1/2-hop depths from home', () => {
    const graph = {
      '/': ['/services/', '/services/roof-replacement/'],
      '/services/': ['/services/roof-repair/'],
      '/services/roof-replacement/': [],
      '/services/roof-repair/': [],
    };
    const depths = bfsDepths(graph, '/');
    expect(depths['/']).toBe(0);
    expect(depths['/services/']).toBe(1);
    expect(depths['/services/roof-replacement/']).toBe(1);
    expect(depths['/services/roof-repair/']).toBe(2);
  });

  it('flags pages unreachable from home as Infinity-depth violations', () => {
    const graph = {
      '/': ['/about/'],
      '/about/': [],
      '/orphan/': [],
    };
    const depths = bfsDepths(graph, '/');
    expect(depths['/orphan/']).toBe(Infinity);
    const violations = findDepthViolations(depths, 2);
    expect(violations).toContainEqual({ pathname: '/orphan/', depth: Infinity });
  });

  it('flags pages deeper than maxDepth', () => {
    const graph = {
      '/': ['/a/'],
      '/a/': ['/b/'],
      '/b/': ['/c/'],
      '/c/': [],
    };
    const depths = bfsDepths(graph, '/');
    const violations = findDepthViolations(depths, 2);
    expect(violations).toContainEqual({ pathname: '/c/', depth: 3 });
  });

  it('passes when every page is within maxDepth', () => {
    const graph = { '/': ['/a/'], '/a/': ['/b/'], '/b/': [] };
    expect(findDepthViolations(bfsDepths(graph, '/'), 2)).toEqual([]);
  });
});

describe('buildLinkGraph', () => {
  it('builds an adjacency map from page HTML keyed by pathname', () => {
    const pages = {
      '/': '<a href="/about/">About</a>',
      '/about/': '<a href="/">Home</a>',
    };
    const graph = buildLinkGraph(pages, 'example.com');
    expect(graph['/']).toEqual(['/about/']);
    expect(graph['/about/']).toEqual(['/']);
  });
});
