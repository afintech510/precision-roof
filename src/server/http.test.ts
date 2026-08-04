import { describe, it, expect } from 'vitest';
import { json, redirect } from './http';

describe('json', () => {
  it('defaults to 200, application/json, no-store', () => {
    const res = json({ ok: true });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('accepts a custom status and extra headers', () => {
    const res = json({ error: 'x' }, 429, { 'retry-after': '60' });
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('60');
  });
});

describe('redirect', () => {
  it('303s with the Location header set, no body', async () => {
    const res = redirect('/contact/?lead=sms');
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/contact/?lead=sms');
    expect(await res.text()).toBe('');
  });
});
