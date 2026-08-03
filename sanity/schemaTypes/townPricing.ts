import { defineField, defineType } from 'sanity';

// townPricing — F-014/F-002. Prices are integer cents [F-014]. provisional
// drives the heavy-disclaimer path; effectiveYear feeds the non-stale coverage
// guarantee (spec §2.4, staleness N=2y).
export const townPricing = defineType({
  name: 'townPricing',
  title: 'Town pricing',
  type: 'document',
  fields: [
    defineField({ name: 'town', type: 'reference', to: [{ type: 'town' }], validation: (r) => r.required() }),
    defineField({ name: 'service', type: 'reference', to: [{ type: 'service' }], validation: (r) => r.required() }),
    defineField({
      name: 'homeSizeBand',
      type: 'string',
      options: { list: ['small', 'medium', 'large'] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'priceLowCents',
      title: 'Price low (integer cents)',
      type: 'number',
      validation: (r) => r.required().integer().min(0),
    }),
    defineField({
      name: 'priceHighCents',
      title: 'Price high (integer cents)',
      type: 'number',
      validation: (r) =>
        r.required().integer().custom((value, context) => {
          const low = (context.document as { priceLowCents?: number } | undefined)?.priceLowCents;
          if (typeof value === 'number' && typeof low === 'number' && value < low) {
            return 'High must be ≥ low';
          }
          return true;
        }),
    }),
    defineField({ name: 'currency', type: 'string', initialValue: 'USD' }),
    defineField({ name: 'effectiveYear', type: 'number', validation: (r) => r.required().integer().min(2000) }),
    defineField({ name: 'provisional', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'homeSizeBand', subtitle: 'effectiveYear' } },
});
