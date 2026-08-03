import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemaTypes';

// Sanity Studio config. Run standalone with `npx sanity dev` / deploy with
// `npx sanity deploy` (Phase 01). projectId/dataset are public identifiers.
export const projectId = process.env.SANITY_PROJECT_ID ?? 'af66eilq';
export const dataset = process.env.SANITY_DATASET ?? 'production';

export default defineConfig({
  name: 'precision-roof',
  title: 'Suffolk Roofing',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
