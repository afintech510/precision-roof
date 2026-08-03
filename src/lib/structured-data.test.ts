import { describe, it, expect } from 'vitest';
import { roofingContractor, breadcrumbs, serviceSchema, faqPage } from './structured-data';
import { sampleSite, sampleServices } from './sample';

describe('structured data (JSON-LD)', () => {
  it('emits a RoofingContractor with name, phone and license', () => {
    const s = roofingContractor(sampleSite);
    expect(s['@type']).toBe('RoofingContractor');
    expect(s.name).toBe(sampleSite.businessName);
    expect(s.telephone).toBe(sampleSite.phoneHref.replace('tel:', ''));
    expect(s.identifier).toBe(sampleSite.licenseNumber);
  });

  it('numbers breadcrumb positions from 1 with absolute URLs', () => {
    const b = breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Areas', path: '/areas/' }]);
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(b.itemListElement[0].item).toMatch(/^https:\/\//);
  });

  it('builds a Service tied to the business', () => {
    const svc = serviceSchema(sampleServices[0], sampleSite);
    expect(svc['@type']).toBe('Service');
    expect(svc.provider.name).toBe(sampleSite.businessName);
  });

  it('builds a FAQPage from question/answer pairs', () => {
    const f = faqPage([{ question: 'Q?', answer: 'A.' }]);
    expect(f['@type']).toBe('FAQPage');
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('A.');
  });
});
