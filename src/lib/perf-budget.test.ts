import { describe, it, expect } from 'vitest';
import { countThirdPartyScripts, imagesMissingDimensions, checkBudget } from './perf-budget';

const HOST = 'roof.benchworksai.com';

describe('performance budget', () => {
  it('ignores inline and same-origin scripts', () => {
    const html = `<script>console.log(1)</script><script src="/_astro/x.js"></script><script src="https://roof.benchworksai.com/a.js"></script>`;
    expect(countThirdPartyScripts(html, HOST)).toBe(0);
  });

  it('counts third-party async scripts', () => {
    const html = `<script src="https://www.googletagmanager.com/gtag.js"></script><script src="//cdn.callrail.com/s.js"></script>`;
    expect(countThirdPartyScripts(html, HOST)).toBe(2);
  });

  it('fails the budget over 4 third-party scripts', () => {
    const html = Array.from({ length: 5 }, (_, i) => `<script src="https://vendor${i}.com/s.js"></script>`).join('');
    expect(checkBudget(html, HOST).ok).toBe(false);
  });

  it('flags images without explicit dimensions', () => {
    const html = `<img src="a.avif" width="800" height="600"><img src="b.avif">`;
    expect(imagesMissingDimensions(html)).toBe(1);
  });

  it('passes clean output', () => {
    expect(checkBudget(`<img src="a.avif" width="1" height="1">`, HOST).ok).toBe(true);
  });
});
