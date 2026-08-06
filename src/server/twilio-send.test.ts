import { describe, it, expect, vi, afterEach } from 'vitest';
import { twilioSender } from './twilio-send';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('twilioSender', () => {
  it('POSTs to the Twilio Messages REST API with Basic auth + form-encoded body', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ sid: 'SM123' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const send = twilioSender({ accountSid: 'AC123', authToken: 'tok-abc', fromNumber: '+15551234567' });
    const result = await send('+15559876543', 'hello there');

    expect(result).toEqual({ ok: true, messageSid: 'SM123' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json');
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers.authorization).toBe(`Basic ${btoa('AC123:tok-abc')}`);
    const body = new URLSearchParams(init.body as string);
    expect(body.get('To')).toBe('+15559876543');
    expect(body.get('From')).toBe('+15551234567');
    expect(body.get('Body')).toBe('hello there');
  });

  it('returns ok:false with the vendor error code/message on an HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ code: 21211, message: 'Invalid To Number' }), { status: 400 })),
    );
    const send = twilioSender({ accountSid: 'AC123', authToken: 'tok-abc', fromNumber: '+15551234567' });
    const result = await send('not-a-number', 'hello');
    expect(result).toEqual({ ok: false, errorCode: 21211, message: 'Invalid To Number' });
  });

  it('returns ok:false with a fallback message when the error body omits one', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({}), { status: 500 })));
    const send = twilioSender({ accountSid: 'AC123', authToken: 'tok-abc', fromNumber: '+15551234567' });
    const result = await send('+15559876543', 'hello');
    expect(result).toEqual({ ok: false, errorCode: undefined, message: 'twilio_http_500' });
  });

  it('returns ok:false on a network error rather than throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const send = twilioSender({ accountSid: 'AC123', authToken: 'tok-abc', fromNumber: '+15551234567' });
    const result = await send('+15559876543', 'hello');
    expect(result).toEqual({ ok: false, message: 'network down' });
  });
});
