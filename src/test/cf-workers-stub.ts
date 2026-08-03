// Test stub for the `cloudflare:workers` virtual module (aliased in
// vitest.config.ts). Route handlers do `import { env } from 'cloudflare:workers'`;
// in the Worker runtime that's the real bindings object, but node/vitest has no
// such module. `env` is a live binding: tests call `__setEnv(...)` before
// invoking a route to control the bindings/secrets it sees. Each test file gets
// its own module instance, so there's no cross-file bleed.

// Reassigned via __setEnv; must stay a `let` for the live binding to update.
export let env: Record<string, unknown> = {};

export function __setEnv(next: Record<string, unknown>): void {
  env = next;
}
