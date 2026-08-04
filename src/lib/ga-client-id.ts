// GA4 client_id capture for walk-up Cal.com bookings (spec §3.2 [C3: BRIDGE-002]).
// The `_ga` cookie (set by any GA4 web tag) encodes the browser client_id as
// `GA<version>.<depth>.<clientId part 1>.<clientId part 2>`, e.g.
// `GA1.2.123456789.987654321` → client_id `123456789.987654321` — the same
// value gtag.js exposes via `get client_id`. Pure so it unit-tests without a
// browser; the client script (CalcomFacade.astro) hands it `document.cookie`.
// No GA4 web tag is wired into the site yet (see README known gaps), so this
// currently always returns undefined in production — that's correct, not a
// bug: a booking must never be attributed with a minted/random client_id.
export function parseGaClientId(cookieHeader: string | undefined | null): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!match) return undefined;
  const parts = match[1].split('.');
  if (parts.length < 4) return undefined;
  const clientId = parts.slice(-2).join('.');
  return /^\d+\.\d+$/.test(clientId) ? clientId : undefined;
}
