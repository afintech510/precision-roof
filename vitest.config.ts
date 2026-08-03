import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    // Route handlers import bindings from the `cloudflare:workers` virtual module
    // (real only in the Worker runtime); alias it to a test stub so route-level
    // tests run under node. Tests use its __setEnv to inject bindings/secrets.
    alias: {
      'cloudflare:workers': fileURLToPath(new URL('./src/test/cf-workers-stub.ts', import.meta.url)),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Thresholds are introduced per-phase as real code lands.
    },
  },
});
