import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createRepositories } from '../db/repositories';
import { d1Executor } from '../db/executor';
import { verifyUnsubscribeToken, authorizeUnsubscribe } from '../server/unsubscribe';

// GET/POST /unsubscribe (spec §5.5, SPEC-006, Phase 09 Task 3, F-013). The
// one-click unsubscribe target carried in every review-request email's
// List-Unsubscribe header. GET verifies the token WITHOUT suppressing
// anything (a mail-scanner prefetch of the link must never silently
// unsubscribe someone) and renders a confirm page; POST performs the actual
// suppression — used both by the automated RFC 8058 List-Unsubscribe-Post
// one-click request and by the confirm page's button. The token itself
// carries the email (see server/unsubscribe.ts), so it's read from the URL
// query string on both methods, matching what the mint step builds the link
// with.
export const prerender = false;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function page(body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Unsubscribe — Premium Roofing Solutions</title></head><body>${body}</body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
  );
}

const NOT_CONFIGURED = () => page('<p>Unsubscribe is not available right now.</p>', 503);
const INVALID = () => page('<p>This unsubscribe link is invalid or has expired.</p>', 400);

export const GET: APIRoute = async ({ url }) => {
  const secret = env.UNSUBSCRIBE_TOKEN_SECRET;
  if (!secret) return NOT_CONFIGURED();

  const token = url.searchParams.get('token');
  const v = await verifyUnsubscribeToken(token, secret, Date.now());
  if (!v.ok) return INVALID();

  return page(
    `<p>Unsubscribe ${escapeHtml(v.claims.email)} from Premium Roofing Solutions emails?</p>
     <form method="post" action="${url.pathname}?token=${encodeURIComponent(token ?? '')}">
       <button type="submit">Unsubscribe</button>
     </form>`,
  );
};

export const POST: APIRoute = async ({ url }) => {
  if (!env.OP_STORE) return NOT_CONFIGURED();
  const secret = env.UNSUBSCRIBE_TOKEN_SECRET;
  if (!secret) return NOT_CONFIGURED();

  const token = url.searchParams.get('token');
  const repos = createRepositories(d1Executor(env.OP_STORE));
  const outcome = await authorizeUnsubscribe(token, repos, { secret, now: Date.now() });
  if (outcome.status !== 'ok') return INVALID();

  return page(`<p>You've been unsubscribed from Premium Roofing Solutions emails.</p>`);
};
