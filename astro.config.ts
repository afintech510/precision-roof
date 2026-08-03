import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { perfBudget } from './src/integrations/perf-budget';

// Static-first (spec §1.2). API routes opt into on-demand rendering per-route
// with `export const prerender = false`, served by the Cloudflare adapter.
export default defineConfig({
  site: 'https://roof.benchworksai.com',
  output: 'static',
  adapter: cloudflare(),
  integrations: [sitemap(), perfBudget()],
});
