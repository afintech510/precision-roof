// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Static-first (spec §1.2). API routes opt into on-demand rendering per-route
// with `export const prerender = false`, served by the Cloudflare adapter.
export default defineConfig({
  site: 'https://example.com', // TODO: replace with the production domain
  output: 'static',
  adapter: cloudflare(),
  // AVIF/WebP responsive images (SOW §8) configured per-image in later phases.
});
