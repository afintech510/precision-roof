import { defineArrayMember, defineField, defineType } from 'sanity';

// siteSettings — singleton. F-019 license/NAP + the consent source-of-truth
// (spec §3.2, §7.3): the rendered consent version drives the client payload.
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'businessName', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'licenseNumber', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'dcaVerifyUrl', title: 'DCA license verify URL', type: 'url' }),
    defineField({ name: 'nap', title: 'NAP (name/address/phone)', type: 'object', fields: [
      defineField({ name: 'address', type: 'address' }),
      defineField({ name: 'phone', type: 'string' }),
      defineField({ name: 'email', type: 'string' }),
    ] }),
    defineField({ name: 'consentText', type: 'text', validation: (r) => r.required() }),
    defineField({ name: 'consentVersion', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      of: [defineArrayMember({ type: 'url' })],
    }),
  ],
  preview: { select: { title: 'businessName' } },
});
