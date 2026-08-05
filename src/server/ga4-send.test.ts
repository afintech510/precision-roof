import { describe, it, expect, vi, afterEach } from 'vitest';
import { ga4Sender } from './ga4-send';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ga4Sender', () => {
  it('POSTs a Measurement Protocol event with the real client_id', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    const send = ga4Sender({ measurementId: 'G-TEST123', apiSecret: 'secret-abc' });
    const result = await send({ name: 'booking_completed', clientId: '123.456', params: { booking_id: 'b-1' } });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('measurement_id=G-TEST123');
    expect(url).toContain('api_secret=secret-abc');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string) as { client_id: string; events: Array<{ name: string; params: unknown }> };
    expect(body.client_id).toBe('123.456');
    expect(body.events).toEqual([{ name: 'booking_completed', params: { booking_id: 'b-1' } }]);
  });

  it('returns ok:false without throwing when the vendor call fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })));
    const send = ga4Sender({ measurementId: 'G-TEST123', apiSecret: 'secret-abc' });
    const result = await send({ name: 'booking_completed', clientId: '123.456' });
    expect(result.ok).toBe(false);
  });

  it('returns ok:false on a network error rather than throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));
    const send = ga4Sender({ measurementId: 'G-TEST123', apiSecret: 'secret-abc' });
    const result = await send({ name: 'booking_completed', clientId: '123.456' });
    expect(result.ok).toBe(false);
  });
});
