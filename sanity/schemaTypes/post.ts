import { defineArrayMember, defineField, defineType } from 'sanity';

// post — F-022/F-006. relatedServices/relatedTowns drive blog↔money-page
// internal linking (finalized in Phase 06).
export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'excerpt', type: 'text', validation: (r) => r.max(300) }),
    defineField({ name: 'coverImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({ name: 'body', type: 'array', of: [defineArrayMember({ type: 'block' })], validation: (r) => r.required() }),
    defineField({
      name: 'relatedServices',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'service' }] })],
    }),
    defineField({
      name: 'relatedTowns',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'town' }] })],
    }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
  preview: { select: { title: 'title', subtitle: 'publishedAt' } },
});
