// CallRail Dynamic Number Insertion — swap.js embed URL (spec §3.2/§5.3,
// Phase 05c Task 1). Pure so the URL shape is unit-testable without a DOM;
// the Astro component only decides whether to render the <script> tag.

export function callrailSwapScriptUrl(companyId: string, scriptId: string): string {
  return `https://cdn.callrail.com/companies/${companyId}/${scriptId}/12/swap.js`;
}
