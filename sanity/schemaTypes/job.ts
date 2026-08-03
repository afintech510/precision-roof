import { defineArrayMember, defineField, defineType } from 'sanity';
import { hasResolvableContact, type Contact } from '../../src/content/schema-rules';

// job — F-013. CRITICAL (prior review): a job MUST carry a resolvable customer
// contact (phone OR email) or it cannot publish. The review-request engine
// (Phase 09) depends on this; the missing-contact bug lived here.
export const job = defineType({
  name: 'job',
  title: 'Job',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'town', type: 'reference', to: [{ type: 'town' }], validation: (r) => r.required() }),
    defineField({ name: 'service', type: 'reference', to: [{ type: 'service' }], validation: (r) => r.required() }),
    defineField({ name: 'completedAt', type: 'date', validation: (r) => r.required() }),
    defineField({
      name: 'customerContact',
      type: 'customerContact',
      validation: (r) =>
        r.required().custom((value) =>
          hasResolvableContact(value as Contact | undefined)
            ? true
            : 'A resolvable customer contact (phone or email) is required to publish a job',
        ),
    }),
    defineField({ name: 'summary', type: 'text' }),
    defineField({
      name: 'photos',
      type: 'array',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'completedAt' } },
});
