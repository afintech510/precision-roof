import { defineField, defineType } from 'sanity';

// review — F-007. Review/AggregateRating JSON-LD is emitted only from real
// feed data and suppressed when lastSyncedAt is stale (spec §2.2, handled in
// Phase 06); externalReviewId supports Google deletion/edit reconciliation.
export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({ name: 'authorName', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'rating', type: 'number', validation: (r) => r.required().min(1).max(5) }),
    defineField({ name: 'text', type: 'text' }),
    defineField({
      name: 'source',
      type: 'string',
      options: { list: ['google', 'manual'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'externalReviewId', type: 'string' }),
    defineField({ name: 'lastSyncedAt', type: 'datetime' }),
    defineField({ name: 'town', type: 'reference', to: [{ type: 'town' }] }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
  ],
  preview: { select: { title: 'authorName', subtitle: 'rating' } },
});
