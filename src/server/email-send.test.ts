import { describe, it, expect, vi, afterEach } from 'vitest';
import { postmarkSender } from './email-send';

afterEach(() => {
  vi.unstubAllGlobals();
});

const MSG = {
  to: 'customer@example.com',
  subject: 'How did we do?',
  textBody: 'Please review us.',
  htmlBody: '<p>Please review us.</p>',
  unsubscribeUrl: 'https://example.com/unsubscribe?token=abc',
};

describe('postmarkSender', () => {
  it('POSTs to the Postmark email API with the server token header + List-Unsubscribe headers', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ MessageID: 'msg-1' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const send = postmarkSender({ serverToken: 'tok-abc', fromAddress: 'reviews@example.com' });
    const result = await send(MSG);

    expect(result).toEqual({ ok: true, messageId: 'msg-1' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.postmarkapp.com/email');
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers['x-postmark-server-token']).toBe('tok-abc');
    const body = JSON.parse(init.body as string) as {
      From: string;
      To: string;
      Subject: string;
      Headers: Array<{ Name: string; Value: string }>;
    };
    expect(body.From).toBe('reviews@example.com');
    expect(body.To).toBe(MSG.to);
    expect(body.Subject).toBe(MSG.subject);
    expect(body.Headers).toEqual([
      { Name: 'List-Unsubscribe', Value: `<${MSG.unsubscribeUrl}>` },
      { Name: 'List-Unsubscribe-Post', Value: 'List-Unsubscribe=One-Click' },
    ]);
  });

  it('returns ok:false with the vendor error code/message on an HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ErrorCode: 300, Message: 'Invalid email' }), { status: 422 })),
    );
    const send = postmarkSender({ serverToken: 'tok-abc', fromAddress: 'reviews@example.com' });
    const result = await send(MSG);
    expect(result).toEqual({ ok: false, errorCode: 300, message: 'Invalid email' });
  });

  it('returns ok:false with a fallback message when the response omits MessageID without an HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })));
    const send = postmarkSender({ serverToken: 'tok-abc', fromAddress: 'reviews@example.com' });
    const result = await send(MSG);
    expect(result).toEqual({ ok: false, errorCode: undefined, message: 'postmark_http_200' });
  });

  it('returns ok:false on a network error rather than throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    const send = postmarkSender({ serverToken: 'tok-abc', fromAddress: 'reviews@example.com' });
    const result = await send(MSG);
    expect(result).toEqual({ ok: false, message: 'network down' });
  });

  it('falls back to a generic message when a non-Error value is thrown', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw 'connection reset';
      }),
    );
    const send = postmarkSender({ serverToken: 'tok-abc', fromAddress: 'reviews@example.com' });
    const result = await send(MSG);
    expect(result).toEqual({ ok: false, message: 'network_error' });
  });
});
