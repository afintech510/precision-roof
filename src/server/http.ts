// Tiny JSON response helper for the SSR API routes. `no-store` by default — quote
// + webhook responses are per-request and must not be cached at the edge.
export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  });
}
