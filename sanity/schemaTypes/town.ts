import { defineArrayMember, defineField, defineType } from 'sanity';

// town — F-002/F-003/F-019. Every content-depth field is required at publish
// (SOW §4): a town page cannot ship as a template swap. Jobs/reviews are
// "where available" so they are NOT publish-blocking.
export const town = defineType({
  name: 'town',
  title: 'Town',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({
      name: 'zips',
      title: 'ZIP codes',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'advertisingAllowed',
      title: 'Advertising allowed (East-End gate)',
      description: 'False for Southampton / East Hampton / Shelter Island until town-licensed — informational only.',
      type: 'boolean',
      initialValue: true,
      validation: (r) => r.required(),
    }),
    // 1–5: required primary-sourced depth fields
    defineField({ name: 'buildingDepartment', type: 'buildingDepartment', validation: (r) => r.required() }),
    defineField({ name: 'permit', type: 'permit', validation: (r) => r.required() }),
    defineField({ name: 'historicOverlay', type: 'historicOverlay', validation: (r) => r.required() }),
    defineField({ name: 'housingStock', type: 'housingStock', validation: (r) => r.required() }),
    defineField({
      name: 'localConditions',
      title: 'Roofing-relevant local conditions',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (r) => r.required().min(1),
    }),
    // 6: named local geography
    defineField({
      name: 'namedStreets',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (r) => r.required().min(3),
    }),
    defineField({
      name: 'hamlets',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (r) => r.required().min(2).max(4),
    }),
    defineField({
      name: 'landmarks',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (r) => r.required().min(1).max(2),
    }),
    // 7: social proof — "where available", not publish-blocking
    defineField({
      name: 'taggedJobs',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'job' }] })],
      validation: (r) => r.max(5),
    }),
    defineField({
      name: 'townReviews',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'review' }] })],
    }),
    // Search-voice FAQs (10–13) with FAQPage schema downstream
    defineField({
      name: 'faqs',
      type: 'array',
      of: [defineArrayMember({ type: 'faqItem' })],
      validation: (r) => r.required().min(10).max(13),
    }),
    defineField({ name: 'body', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
  preview: { select: { title: 'name', subtitle: 'advertisingAllowed' } },
});
