import { describe, it, expect } from 'vitest';
import { POST, GET } from '../pages/api/quote';

// Route-level test for the /api/quote adapter: no runtime env (so Turnstile is
// skipped and the blob falls back to an in-process build from sample content),
// proving the wiring end-to-end without Miniflare or vendor keys.

function ctx(body: unknown) {
  const request = new Request('https://premiumroofsolutions.com/api/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  // No runtime.env → env is undefined; route uses the content fallback.
  return { request, locals: {}, clientAddress: '203.0.113.9' } as never;
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
});
