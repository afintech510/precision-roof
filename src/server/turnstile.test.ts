import { describe, it, expect, vi, afterEach } from 'vitest';
import { verifyTurnstile } from './turnstile';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('verifyTurnstile', () => {
  it('returns skipped without calling fetch when no secret is configured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await verifyTurnstile(undefined, 'some-token');
    expect(result).toEqual({ verified: false, skipped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns skipped without calling fetch when the token is missing or not a string', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await verifyTurnstile('secret-abc', undefined)).toEqual({ verified: false, skipped: true });
    expect(await verifyTurnstile('secret-abc', '')).toEqual({ verified: false, skipped: true });
    expect(await verifyTurnstile('secret-abc', 12345)).toEqual({ verified: false, skipped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs the secret/response/remoteip to siteverify and reports success', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await verifyTurnstile('secret-abc', 'the-token', '203.0.113.5');

    expect(result).toEqual({ verified: true, skipped: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init.method).toBe('POST');
    const body = new URLSearchParams(init.body as string);
    expect(body.get('secret')).toBe('secret-abc');
    expect(body.get('response')).toBe('the-token');
    expect(body.get('remoteip')).toBe('203.0.113.5');
  });

  it('reports verified:false when the vendor rejects the token', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: false }), { status: 200 })));
    const result = await verifyTurnstile('secret-abc', 'bad-token');
    expect(result).toEqual({ verified: false, skipped: false });
  });

  it('never fails closed — returns skipped:true on a network/verifier outage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const result = await verifyTurnstile('secret-abc', 'the-token');
    expect(result).toEqual({ verified: false, skipped: true });
  });
});
