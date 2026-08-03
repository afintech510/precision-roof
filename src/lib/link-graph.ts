// Internal-linking model (spec §4.4, SOW §5, F-006): "no page >2 clicks from
// home". Pure graph functions over the emitted HTML's <a href> links so they
// unit-test without a filesystem; the Astro integration
// (src/integrations/seo-technical.ts) runs a BFS from `/` over every built
// page and fails the build if anything is unreachable within 2 hops.

/** Internal (same-host, non-mailto/tel/external) link targets on a page,
 * normalized to a path (query/hash stripped, trailing slash preserved). */
export function extractInternalLinks(html: string, siteHost: string): string[] {
  const out: string[] = [];
  const re = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    let pathname: string;
    if (href.startsWith('/')) {
      pathname = href;
    } else if (/^https?:\/\//i.test(href)) {
      let url: URL;
      try {
        url = new URL(href);
      } catch {
        continue;
      }
      if (url.host !== siteHost) continue;
      pathname = url.pathname;
    } else {
      continue; // relative-to-current-doc paths aren't used in this site
    }
    out.push(pathname.split('?')[0].split('#')[0]);
  }
  return out;
}

export type LinkGraph = Record<string, string[]>;

export function buildLinkGraph(pages: Record<string, string>, siteHost: string): LinkGraph {
  const graph: LinkGraph = {};
  for (const [pathname, html] of Object.entries(pages)) {
    graph[pathname] = extractInternalLinks(html, siteHost);
  }
  return graph;
}

/** BFS click-depth from `start`. Pages never reached appear with `Infinity`. */
export function bfsDepths(graph: LinkGraph, start = '/'): Record<string, number> {
  const depths: Record<string, number> = { [start]: 0 };
  const queue: string[] = [start];
  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;
    const depth = depths[current];
    for (const next of graph[current] ?? []) {
      if (!(next in graph)) continue; // only count links to pages we actually built
      if (next in depths) continue;
      depths[next] = depth + 1;
      queue.push(next);
    }
  }
  for (const pathname of Object.keys(graph)) {
    if (!(pathname in depths)) depths[pathname] = Infinity;
  }
  return depths;
}

export interface DepthViolation {
  pathname: string;
  depth: number;
}

/** Pages either unreachable from home or deeper than `maxDepth` clicks. */
export function findDepthViolations(depths: Record<string, number>, maxDepth = 2): DepthViolation[] {
  return Object.entries(depths)
    .filter(([, depth]) => depth > maxDepth)
    .map(([pathname, depth]) => ({ pathname, depth }));
}
