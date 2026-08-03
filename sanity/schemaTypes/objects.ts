import { defineField, defineType } from 'sanity';
import { historicOverlayError, type HistoricOverlay } from '../../src/content/schema-rules';

// Reusable object types shared across documents (spec §2.2, SOW §4).

export const address = defineType({
  name: 'address',
  title: 'Address',
  type: 'object',
  fields: [
    defineField({ name: 'street', type: 'string' }),
    defineField({ name: 'city', type: 'string' }),
    defineField({ name: 'state', type: 'string', initialValue: 'NY' }),
    defineField({ name: 'zip', type: 'string' }),
  ],
});

export const buildingDepartment = defineType({
  name: 'buildingDepartment',
  title: 'Building department',
  type: 'object',
  fields: [
    defineField({ name: 'streetAddress', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'phone', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'counterHours', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'filingMethod',
      type: 'string',
      options: { list: ['efile', 'in_person', 'both'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'sourceUrl', type: 'url', validation: (r) => r.required() }),
  ],
});

export const permit = defineType({
  name: 'permit',
  title: 'Permit',
  type: 'object',
  fields: [
    defineField({ name: 'requiredForReroof', type: 'boolean', validation: (r) => r.required() }),
    defineField({ name: 'fee', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'turnaroundBusinessDays', type: 'number', validation: (r) => r.required().min(0) }),
    defineField({ name: 'sourceUrl', type: 'url', validation: (r) => r.required() }),
  ],
});

export const historicOverlay = defineType({
  name: 'historicOverlay',
  title: 'Historic district / overlay',
  type: 'object',
  fields: [
    defineField({ name: 'applies', type: 'boolean', validation: (r) => r.required() }),
    defineField({
      name: 'details',
      type: 'text',
      // Required only when an overlay applies, so a no-overlay town can publish [C2-030].
      validation: (r) =>
        r.custom((value, context) =>
          historicOverlayError({
            applies: (context.parent as { applies?: boolean } | undefined)?.applies,
            details: value as string | undefined,
          } as HistoricOverlay),
        ),
    }),
  ],
});

export const housingStock = defineType({
  name: 'housingStock',
  title: 'Dominant housing stock',
  type: 'object',
  fields: [
    defineField({ name: 'era', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'type', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'typicalRoofSquares', type: 'number', validation: (r) => r.required().min(1) }),
  ],
});

export const customerContact = defineType({
  name: 'customerContact',
  title: 'Customer contact',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'phone', type: 'string' }),
    defineField({ name: 'email', type: 'string' }),
  ],
});

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ',
  type: 'object',
  fields: [
    defineField({ name: 'question', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'answer', type: 'text', validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'question' } },
});

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({ name: 'metaTitle', type: 'string', validation: (r) => r.max(70) }),
    defineField({ name: 'metaDescription', type: 'text', validation: (r) => r.max(170) }),
  ],
});

export const objectTypes = [
  address,
  buildingDepartment,
  permit,
  historicOverlay,
  housingStock,
  customerContact,
  faqItem,
  seo,
];
