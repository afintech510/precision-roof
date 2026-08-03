// NY GBL §771-B content lint (spec §7.5). Fails the build if regulated
// financing/insurance phrasing is published. Pure + configurable so it unit-
// tests without Sanity; the build step runs it over fetched content.
//
// SPEC-AMBIGUITY: the exact banned-phrase list needs legal sign-off. The list
// below is a conservative starter covering the financing/insurance claims
// §771-B targets; extend `BANNED_PATTERNS` after legal review.

export interface BannedPattern {
  id: string;
  pattern: RegExp;
  note: string;
}

export const BANNED_PATTERNS: BannedPattern[] = [
  { id: 'no-money-down', pattern: /\bno\s+money\s+down\b/i, note: 'financing inducement' },
  { id: 'zero-percent', pattern: /\b0%\s*(?:apr|financing|interest)\b/i, note: 'financing claim requires disclosure' },
  { id: 'free-roof-insurance', pattern: /\bfree\s+roof\b/i, note: 'insurance/“free” inducement' },
  { id: 'we-waive-deductible', pattern: /\bwaive\b[^.]*\bdeductible\b/i, note: 'insurance-fraud adjacent — prohibited' },
  { id: 'guaranteed-approval', pattern: /\bguaranteed\s+(?:approval|financing)\b/i, note: 'financing claim' },
  { id: 'insurance-will-pay', pattern: /\binsurance\s+will\s+pay\b/i, note: 'unqualified insurance representation' },
];

export interface LintFinding {
  id: string;
  match: string;
  note: string;
  /** Optional locator the caller supplies (e.g. "town:huntington.body"). */
  where?: string;
}

/** Portable Text is an array of blocks; we only need the text spans. */
interface TextSpan { text?: string }
interface PortableBlock { _type?: string; children?: TextSpan[] }
export type LintableContent = string | PortableBlock[] | null | undefined;

function toText(content: LintableContent): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  return content
    .map((block) => (block.children ?? []).map((c) => c.text ?? '').join(' '))
    .join('\n');
}

/** Return every banned-phrase hit in the given content. Empty array = clean. */
export function lint(content: LintableContent, where?: string, patterns = BANNED_PATTERNS): LintFinding[] {
  const text = toText(content);
  const findings: LintFinding[] = [];
  for (const p of patterns) {
    const m = text.match(p.pattern);
    if (m) findings.push({ id: p.id, match: m[0], note: p.note, where });
  }
  return findings;
}

/** Convenience for the build step: throws with a readable report if anything is found. */
export function assertClean(items: Array<{ where: string; content: LintableContent }>): void {
  const all = items.flatMap((i) => lint(i.content, i.where));
  if (all.length > 0) {
    const report = all.map((f) => `  • [${f.id}] "${f.match}" in ${f.where ?? '?'} — ${f.note}`).join('\n');
    throw new Error(`§771-B content lint failed:\n${report}`);
  }
}
