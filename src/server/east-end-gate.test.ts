import { describe, it, expect } from 'vitest';
import {
  normalizeZip,
  resolveZipGate,
  SUFFOLK_ZIP_GATE,
  type ZipGateTable,
} from './east-end-gate';

describe('normalizeZip', () => {
  it('accepts a bare 5-digit ZIP', () => {
    expect(normalizeZip('11743')).toBe('11743');
    expect(normalizeZip('  11743 ')).toBe('11743');
  });
  it('accepts ZIP+4 and canonicalizes to 5 digits', () => {
    expect(normalizeZip('11743-1234')).toBe('11743');
    expect(normalizeZip('117431234')).toBe('11743');
  });
  it('rejects malformed input as null', () => {
    expect(normalizeZip('1174')).toBeNull();
    expect(normalizeZip('abcde')).toBeNull();
    expect(normalizeZip('11743-12')).toBeNull();
    expect(normalizeZip('')).toBeNull();
    expect(normalizeZip(undefined)).toBeNull();
    expect(normalizeZip(11743 as unknown)).toBeNull();
  });
});

describe('resolveZipGate', () => {
  it('resolves a western/central ZIP to advertising', () => {
    const r = resolveZipGate('11743');
    expect(r).toEqual({ kind: 'advertising', townSlugs: ['huntington'] });
  });

  it('resolves an East-End ZIP to informational_only (never a price)', () => {
    expect(resolveZipGate('11968')?.kind).toBe('informational_only'); // Southampton
    expect(resolveZipGate('11937')?.kind).toBe('informational_only'); // East Hampton
    expect(resolveZipGate('11964')?.kind).toBe('informational_only'); // Shelter Island
    expect(resolveZipGate('11971')?.kind).toBe('informational_only'); // Southold (North Fork)
  });

  it('resolves an unknown well-formed ZIP to out_of_area', () => {
    expect(resolveZipGate('90210')).toEqual({ kind: 'out_of_area', townSlugs: [] });
  });

  it('returns null for a malformed ZIP (caller names it malformed)', () => {
    expect(resolveZipGate('nope')).toBeNull();
    expect(resolveZipGate('123')).toBeNull();
  });

  it('applies the fail-safe conflict rule — any gated match wins', () => {
    const table: ZipGateTable = {
      '11111': [
        { townSlug: 'west-town', advertisingAllowed: true },
        { townSlug: 'east-town', advertisingAllowed: false },
      ],
    };
    const r = resolveZipGate('11111', table);
    expect(r?.kind).toBe('informational_only');
    expect(r?.townSlugs).toEqual(['east-town']);
  });

  it('normalizes ZIP+4 before lookup', () => {
    expect(resolveZipGate('11743-9999')?.kind).toBe('advertising');
  });

  it('has no ZIP that is simultaneously advertising and gated in the shipped table', () => {
    for (const [zip, matches] of Object.entries(SUFFOLK_ZIP_GATE)) {
      const hasAdv = matches.some((m) => m.advertisingAllowed);
      const hasGated = matches.some((m) => !m.advertisingAllowed);
      expect(hasAdv && hasGated, `ZIP ${zip} straddles advertising+gated`).toBe(false);
    }
  });
});
