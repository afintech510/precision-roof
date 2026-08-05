// Outbound GA4 Measurement Protocol event send (spec §1.1, §3.2, BUILDPLAN
// Phase 05a Task 3). Mirrors twilio-send.ts/email-send.ts: a thin wrapper
// over the vendor REST API, injected as a dependency everywhere it's used so
// the calling core unit-tests with a fake sender and never makes a network
// call in tests.

export interface Ga4SendConfig {
  measurementId: string;
  apiSecret: string;
}

export interface Ga4Event {
  name: string;
  /** Real GA4 client_id — callers must never mint one; that corrupts source/medium. */
  clientId: string;
  params?: Record<string, string | number | boolean>;
}

export type SendGa4Event = (event: Ga4Event) => Promise<{ ok: boolean }>;

/** Build a real `SendGa4Event` against the GA4 Measurement Protocol (spec §1.1). */
export function ga4Sender(config: Ga4SendConfig): SendGa4Event {
  return async (event: Ga4Event): Promise<{ ok: boolean }> => {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(config.measurementId)}&api_secret=${encodeURIComponent(config.apiSecret)}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: event.clientId,
          events: [{ name: event.name, params: event.params ?? {} }],
        }),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  };
}
