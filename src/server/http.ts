// Tiny JSON response helper for the SSR API routes. `no-store` by default — quote
// + webhook responses are per-request and must not be cached at the edge.
export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  });
}

/** 303 redirect (spec §4/§9 native-POST form fallback): a plain `<form
 * method="post">` submit must navigate somewhere sensible, not render raw
 * JSON. 303 (not 302) forces the follow-up GET regardless of the original
 * method, which is what a post-submit redirect needs. */
export function redirect(location: string, status: 303 = 303): Response {
  return new Response(null, { status, headers: { location, 'cache-control': 'no-store' } });
}
