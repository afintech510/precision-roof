import { describe, it, expect } from 'vitest';
import { requireOperatorAccess } from './access';

// Direct unit coverage for the pure Access gate — every operator route test exercises
// this through the route adapter, but nothing hits requireOperatorAccess in isolation.
describe('requireOperatorAccess', () => {
  it('returns the operator identity when Access injects the verified email', () => {
    const request = new Request('https://example.com/api/operator/leads', {
      headers: { 'Cf-Access-Authenticated-User-Email': 'adam@example.com' },
    });
    expect(requireOperatorAccess(request)).toEqual({ operatorId: 'adam@example.com' });
  });

  it('returns null when the Access header is absent', () => {
    const request = new Request('https://example.com/api/operator/leads');
    expect(requireOperatorAccess(request)).toBeNull();
  });

  it('returns null when the Access header is empty', () => {
    const request = new Request('https://example.com/api/operator/leads', {
      headers: { 'Cf-Access-Authenticated-User-Email': '' },
    });
    expect(requireOperatorAccess(request)).toBeNull();
  });
});
