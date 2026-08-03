import { defineArrayMember, defineField, defineType } from 'sanity';

// service — F-004/F-018. isEmergencyCluster marks storm/leak/emergency pages
// (click-to-call hero, no time-bound promise).
export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({
      name: 'category',
      type: 'string',
      options: { list: ['urgent', 'standard'] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'isEmergencyCluster',
      title: 'Emergency cluster (storm/leak/emergency)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'jsonLdServiceType', title: 'schema.org Service type', type: 'string' }),
    defineField({ name: 'summary', type: 'text', validation: (r) => r.required() }),
    defineField({ name: 'body', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
    defineField({
      name: 'faqs',
      type: 'array',
      of: [defineArrayMember({ type: 'faqItem' })],
    }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
  preview: { select: { title: 'name', subtitle: 'category' } },
});
