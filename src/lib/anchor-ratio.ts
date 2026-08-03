// Exact-match anchor-text ratio CI check (spec §4.4, SOW §5, F-006): capped
// ≤30% site-wide. Pure functions over rendered HTML so they unit-test without
// a filesystem; the Astro integration (src/integrations/seo-technical.ts)
// runs this over every built page.

export interface Anchor {
  href: string;
  text: string;
}

/** Internal <a> tags with their visible (tag-stripped) text. */
export function extractAnchors(html: string): Anchor[] {
  const out: Anchor[] = [];
  const re = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    const text = m[2]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) continue;
    out.push({ href, text });
  }
  return out;
}

/** "[service] [town]" exact-match pattern (spec §4.4): anchor text naming
 * both a service and a town, e.g. "Roof Replacement Huntington". */
export function isExactMatchAnchor(text: string, serviceNames: string[], townNames: string[]): boolean {
  const lower = text.toLowerCase();
  const hasService = serviceNames.some((s) => lower.includes(s.toLowerCase()));
  const hasTown = townNames.some((t) => lower.includes(t.toLowerCase()));
  return hasService && hasTown;
}

export interface AnchorRatioResult {
  total: number;
  exactMatch: number;
  ratio: number;
  exactMatchAnchors: Anchor[];
}

export function computeAnchorRatio(
  htmlDocs: string[],
  serviceNames: string[],
  townNames: string[],
): AnchorRatioResult {
  const anchors = htmlDocs.flatMap((html) => extractAnchors(html));
  const exactMatchAnchors = anchors.filter((a) => isExactMatchAnchor(a.text, serviceNames, townNames));
  const total = anchors.length;
  const exactMatch = exactMatchAnchors.length;
  return { total, exactMatch, ratio: total === 0 ? 0 : exactMatch / total, exactMatchAnchors };
}
