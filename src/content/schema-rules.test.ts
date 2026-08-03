import { describe, it, expect } from 'vitest';
import { hasResolvableContact, historicOverlayError } from './schema-rules';

describe('job publish gate — resolvable customer contact (CRITICAL)', () => {
  it('rejects missing / empty contact', () => {
    expect(hasResolvableContact(undefined)).toBe(false);
    expect(hasResolvableContact({})).toBe(false);
    expect(hasResolvableContact({ phone: '  ', email: '' })).toBe(false);
  });
  it('accepts a phone or an email', () => {
    expect(hasResolvableContact({ phone: '+15165550100' })).toBe(true);
    expect(hasResolvableContact({ email: 'a@example.com' })).toBe(true);
  });
});

describe('town publish gate — historic overlay', () => {
  it('allows a no-overlay town to publish', () => {
    expect(historicOverlayError({ applies: false })).toBe(true);
    expect(historicOverlayError({ applies: undefined })).toBe(true);
  });
  it('requires details when an overlay applies', () => {
    expect(historicOverlayError({ applies: true })).toMatch(/required/);
    expect(historicOverlayError({ applies: true, details: 'Cold Spring Harbor district' })).toBe(true);
  });
});
