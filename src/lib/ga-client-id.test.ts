import { describe, it, expect } from 'vitest';
import { parseGaClientId } from './ga-client-id';

describe('parseGaClientId', () => {
  it('extracts the client_id from a standard _ga cookie value', () => {
    expect(parseGaClientId('_ga=GA1.2.123456789.987654321')).toBe('123456789.987654321');
  });

  it('finds _ga among other cookies', () => {
    expect(parseGaClientId('_gid=GA1.2.111; _ga=GA1.2.123456789.987654321; other=x')).toBe(
      '123456789.987654321',
    );
  });

  it('handles a GA1.3 (or other depth marker) variant the same way', () => {
    expect(parseGaClientId('_ga=GA1.3.123456789.987654321')).toBe('123456789.987654321');
  });

  it('returns undefined when the cookie header is absent', () => {
    expect(parseGaClientId(undefined)).toBeUndefined();
    expect(parseGaClientId(null)).toBeUndefined();
    expect(parseGaClientId('')).toBeUndefined();
  });

  it('returns undefined when _ga is not present', () => {
    expect(parseGaClientId('_gid=GA1.2.111; other=x')).toBeUndefined();
  });

  it('returns undefined for a malformed _ga value', () => {
    expect(parseGaClientId('_ga=not-a-real-value')).toBeUndefined();
    expect(parseGaClientId('_ga=GA1.2.onlyone')).toBeUndefined();
  });

  it('returns undefined when the trailing two segments are not both numeric', () => {
    expect(parseGaClientId('_ga=GA1.2.abc.987654321')).toBeUndefined();
    expect(parseGaClientId('_ga=GA1.2.123456789.abc')).toBeUndefined();
  });
});
