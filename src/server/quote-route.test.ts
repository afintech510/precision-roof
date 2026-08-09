import { describe, it, expect } from 'vitest';
import { POST, GET } from '../pages/api/quote';
import { __setEnv } from '../test/cf-workers-stub';

// Route-level test for the /api/quote adapter: no runtime env (so Turnstile is
// skipped and the blob falls back to an in-process build from sample content),
// proving the wiring end-to-end without Miniflare or vendor keys.

function ctx(body: unknown) {
  __setEnv({}); // no bindings → Turnstile skipped, blob falls back to content
  const request = new Request('https://premiumroofsolutions.com/api/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { request, clientAddress: '203.0.113.9' } as never;
}

async function call(body: unknown) {
  const res = await POST(ctx(body));
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

describe('POST /api/quote', () => {
  it('returns an estimate range for an advertising town from sample pricing', async () => {
    const { status, json } = await call({ townSlug: 'huntington', band: 'medium' });
    expect(status).toBe(200);
    expect(json.outcome).toBe('estimate');
    expect((json.estimate as { low: number }).low).toBeGreaterThan(0);
    expect(json.verified).toBe(false); // Turnstile skipped, still served (never fail closed)
  });

  it('never prices a gated East-End ZIP — informational only', async () => {
    const { status, json } = await call({ zip: '11968', band: 'medium' });
    expect(status).toBe(200);
    expect(json.outcome).toBe('informational_only');
    expect(json.estimate).toBeUndefined();
  });

  it('distinguishes malformed input with a 400', async () => {
    const { status, json } = await call({ zip: '117', band: 'medium' });
    expect(status).toBe(400);
    expect(json.outcome).toBe('malformed');
  });

  it('treats a well-formed out-of-area ZIP as 200 out_of_area', async () => {
    const { status, json } = await call({ zip: '90210', band: 'medium' });
    expect(status).toBe(200);
    expect(json.outcome).toBe('out_of_area');
  });

  it('rejects GET', async () => {
    const res = await GET({} as never);
    expect(res.status).toBe(405);
  });

  it('parses a form-encoded body (non-JSON content-type)', async () => {
    __setEnv({});
    const form = new URLSearchParams({ townSlug: 'huntington', band: 'medium' });
    const request = new Request('https://premiumroofsolutions.com/api/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const res = await POST({ request, clientAddress: '203.0.113.9' } as never);
    const json = (await res.json()) as Record<string, unknown>;
    expect(res.status).toBe(200);
    expect(json.outcome).toBe('estimate');
  });

  it('falls back to an empty body when parsing throws (unreadable stream)', async () => {
    __setEnv({});
    const request = new Request('https://premiumroofsolutions.com/api/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not valid json',
    });
    const res = await POST({ request, clientAddress: '203.0.113.9' } as never);
    const json = (await res.json()) as Record<string, unknown>;
    // empty body → no zip/townSlug → the quote engine's own missing_locator path
    // decides, proving parseBody's catch{} swallowed the JSON parse error
    // instead of throwing out of the route.
    expect(res.status).toBe(400);
    expect(json.outcome).toBe('malformed');
    expect(json.reason).toBe('missing_locator');
  });

  it('429s past the per-IP cap once RATE_LIMIT_KV is bound', async () => {
    const data = new Map<string, string>();
    const kv = {
      get: async (key: string) => data.get(key) ?? null,
      put: async (key: string, value: string) => {
        data.set(key, value);
      },
    };
    for (let i = 0; i < 20; i++) {
      __setEnv({ RATE_LIMIT_KV: kv });
      const request = new Request('https://premiumroofsolutions.com/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ townSlug: 'huntington', band: 'medium' }),
      });
      const res = await POST({ request, clientAddress: '203.0.113.9' } as never);
      expect(res.status).toBe(200);
    }
    __setEnv({ RATE_LIMIT_KV: kv });
    const request = new Request('https://premiumroofsolutions.com/api/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ townSlug: 'huntington', band: 'medium' }),
    });
    const res = await POST({ request, clientAddress: '203.0.113.9' } as never);
    expect(res.status).toBe(429);
    expect(((await res.json()) as { error: string }).error).toBe('rate_limited');
  });
});
