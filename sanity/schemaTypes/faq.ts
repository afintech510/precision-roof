import { defineField, defineType } from 'sanity';

// faq — global FAQ library (page-level FAQs live inline as faqItem on town/service).
export const faq = defineType({
  name: 'faq',
  title: 'FAQ (global)',
  type: 'document',
  fields: [
    defineField({ name: 'question', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'answer', type: 'array', of: [{ type: 'block' }], validation: (r) => r.required() }),
    defineField({ name: 'category', type: 'string' }),
    defineField({ name: 'relatedService', type: 'reference', to: [{ type: 'service' }] }),
    defineField({ name: 'relatedTown', type: 'reference', to: [{ type: 'town' }] }),
  ],
  preview: { select: { title: 'question', subtitle: 'category' } },
});
