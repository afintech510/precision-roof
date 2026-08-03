// Dependency-free static server for the built marketing site (dist/client),
// used by Playwright's webServer for the axe a11y matrix (spec §9, §4 §4.4).
// The Cloudflare adapter emits prerendered HTML into dist/client, so a plain
// static server is enough to audit the rendered pages across viewports without
// wrangler. Builds first if the output is missing so the harness is
// deterministic regardless of gate ordering.

import { createServer } from 'node:http';
import { execSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'dist', 'client');
const PORT = Number(process.env.A11Y_PORT ?? 41411);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

async function ensureBuilt() {
  try {
    await stat(join(ROOT, 'index.html'));
  } catch {
    console.log('[serve-dist] dist/client missing — building…');
    execSync('npm run build', { stdio: 'inherit' });
  }
}

// Minimal Cloudflare Pages `_headers` file parser: blocks are a path pattern
// line followed by indented `Header: value` lines. Only `/*` (match-all) is
// needed here — per-path glob matching isn't implemented since nothing in
// this repo's _headers uses anything narrower yet.
async function loadHeaderRules() {
  let text;
  try {
    text = await readFile(join(ROOT, '_headers'), 'utf8');
  } catch {
    return [];
  }
  const rules = [];
  let current = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (line.trim() === '') continue;
    if (/^\s/.test(line)) {
      if (!current) continue;
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      current.headers[key] = value;
    } else {
      current = { pattern: line.trim(), headers: {} };
      rules.push(current);
    }
  }
  return rules;
}

function headersForPath(rules, pathname) {
  const out = {};
  for (const rule of rules) {
    if (rule.pattern === '/*' || rule.pattern === pathname) Object.assign(out, rule.headers);
  }
  return out;
}

/** Resolve a URL pathname to a file inside ROOT, or null if it escapes/absent. */
async function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname.split('?')[0]);
  // normalize + confine to ROOT (no path traversal).
  const rel = normalize(clean).replace(/^(\.\.[/\\])+/, '');
  const candidates = [];
  if (rel.endsWith('/') || rel === '') {
    candidates.push(join(ROOT, rel, 'index.html'));
  } else if (extname(rel) === '') {
    candidates.push(join(ROOT, `${rel}.html`));
    candidates.push(join(ROOT, rel, 'index.html'));
  } else {
    candidates.push(join(ROOT, rel));
  }
  for (const file of candidates) {
    if (!file.startsWith(ROOT)) continue;
    try {
      const s = await stat(file);
      if (s.isFile()) return file;
    } catch {
      /* try next */
    }
  }
  return null;
}

await ensureBuilt();
const headerRules = await loadHeaderRules();

const server = createServer(async (req, res) => {
  try {
    const pathname = (req.url ?? '/').split('?')[0];
    const extra = headersForPath(headerRules, pathname);
    const file = await resolveFile(req.url ?? '/');
    if (!file) {
      res.writeHead(404, { 'content-type': 'text/plain', ...extra });
      res.end('Not found');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', ...extra });
    res.end(body);
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('Server error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[serve-dist] serving ${ROOT} at http://127.0.0.1:${PORT}/`);
});
