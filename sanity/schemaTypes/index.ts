import { objectTypes } from './objects';
import { town } from './town';
import { service } from './service';
import { townPricing } from './townPricing';
import { job } from './job';
import { review } from './review';
import { faq } from './faq';
import { post } from './post';
import { siteSettings } from './siteSettings';

// Full schema: 8 document types (spec §2.2) + supporting object types.
export const schemaTypes = [
  ...objectTypes,
  town,
  service,
  townPricing,
  job,
  review,
  faq,
  post,
  siteSettings,
];
