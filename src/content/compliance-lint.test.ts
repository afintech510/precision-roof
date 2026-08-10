import { describe, it, expect } from 'vitest';
import { lint, assertClean } from './compliance-lint';

describe('§771-B compliance lint', () => {
  it('passes clean copy', () => {
    expect(lint('We install quality roofs across Suffolk County. Book a free inspection.')).toEqual([]);
  });

  it('catches a banned financing phrase in a string', () => {
    const findings = lint('No money down and 0% APR for two years!');
    expect(findings.map((f) => f.id)).toEqual(expect.arrayContaining(['no-money-down', 'zero-percent']));
  });

  it('catches banned phrasing inside Portable Text blocks', () => {
    const blocks = [
      { _type: 'block', children: [{ text: 'Our crews are great. ' }, { text: 'We waive your deductible.' }] },
    ];
    const findings = lint(blocks, 'town:huntington.body');
    expect(findings[0]?.id).toBe('we-waive-deductible');
    expect(findings[0]?.where).toBe('town:huntington.body');
  });

  it('assertClean throws a readable report when content is dirty (build-fail path)', () => {
    expect(() => assertClean([{ where: 'service:financing.body', content: 'Insurance will pay for everything.' }]))
      .toThrow(/§771-B content lint failed/);
  });

  it('falls back to "?" in the report when a finding has no where locator', () => {
    // assertClean's own type requires `where: string`, but the report still
    // needs to degrade gracefully if a caller's locator resolves empty.
    const items = [{ content: 'Guaranteed approval for everyone.' }] as unknown as Array<{
      where: string;
      content: string;
    }>;
    expect(() => assertClean(items)).toThrow(/in \? —/);
  });

  it('assertClean is silent on clean content', () => {
    expect(() => assertClean([{ where: 'home', content: 'Transparent, itemized pricing.' }])).not.toThrow();
  });

  it('treats missing content (null/undefined) as clean rather than crashing', () => {
    expect(lint(null)).toEqual([]);
    expect(lint(undefined)).toEqual([]);
    expect(() => assertClean([{ where: 'town:riverhead.body', content: undefined }])).not.toThrow();
  });

  it('tolerates Portable Text blocks with no children and spans with no text', () => {
    const blocks = [
      { _type: 'block' },
      { _type: 'block', children: [{}, { text: 'No money down for qualified buyers.' }] },
    ];
    const findings = lint(blocks);
    expect(findings.map((f) => f.id)).toEqual(['no-money-down']);
  });
});
