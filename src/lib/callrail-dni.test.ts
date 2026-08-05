import { describe, it, expect } from 'vitest';
import { callrailSwapScriptUrl } from './callrail-dni';

describe('callrailSwapScriptUrl', () => {
  it('builds the documented CallRail swap.js embed URL from company + script IDs', () => {
    expect(callrailSwapScriptUrl('COMP123', 'SCRIPT456')).toBe(
      'https://cdn.callrail.com/companies/COMP123/SCRIPT456/12/swap.js',
    );
  });
});
