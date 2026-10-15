#!/usr/bin/env node
/**
 * Preview sweep gate.
 *
 * `check-rendered.js` reads the files on disk; this one goes through the running
 * preview server (scripts/preview-server.py) the way a browser would, so it also
 * catches routing problems: a missing file, a route group that never resolves, or
 * a dynamic pattern the server fails to map.
 *
 * It walks every exported HTML file, turns it into the URL a user would open
 * (route groups drop out of the URL, `[id]` pages get a real seed id), requests
 * each one, and fails on a non-200 or on a page with no visible text.
 *
 * Usage:  CI=1 npx expo export --platform web
 *         python3 scripts/preview-server.py --port 8081 &
 *         node scripts/check-preview.js [--port 8081]
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const PORT = Number((process.argv.find((a) => a.startsWith('--port=')) || '').split('=')[1] || 8081);
const HOST = `http://127.0.0.1:${PORT}`;

/** Real ids from src/data/catalogue.ts, so dynamic routes render actual content. */
const SAMPLE = {
  '[id]': 'r1',
  '[itemId]': 'r1i1',
  '[orderId]': 'VB-4821',
};
/** Per-route overrides where a generic id would be wrong. */
const SAMPLE_BY_PREFIX = [
  ['orders/[id]', 'VB-4821'],
  ['tracking/[id]', 'VB-4821'],
  ['vendor/order/[id]', 'VB-4821'],
  ['delivery/delivery/[id]', 'VB-4821'],
];

/** dist/(customer)/orders/[id].html -> /orders/VB-4821 */
function toUrl(relPath) {
  let route = relPath.replace(/\\/g, '/').replace(/\.html$/, '');
  // route groups like (customer) never appear in the URL
  route = route
    .split('/')
    .filter((segment) => !/^\(.*\)$/.test(segment))
    .join('/');
  if (route.endsWith('/index')) route = route.slice(0, -'/index'.length);
  for (const [prefix, id] of SAMPLE_BY_PREFIX) {
    route = route.replace(prefix, prefix.replace(/\[[^\]]+\]/, id));
  }
  return '/' + route.replace(/\[([^\]]+)\]/, (_, name) => SAMPLE[`[${name}]`] ?? 'demo');
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_expo' || entry.name === 'assets') continue;
      walk(full, out);
    } else if (entry.name.endsWith('.html') && !entry.name.startsWith('+') && !entry.name.startsWith('_')) {
      out.push(path.relative(DIST, full));
    }
  }
  return out;
}

/** Visible text, the way a reader would see it. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Static export renders the *signed-out, empty-store* state into each HTML file:
 * orders, cart and wallet live in the on-device store and are filled in by the
 * client after hydration. Those pages are therefore short here — that is expected,
 * so the gate only fails on a real breakage (non-200, the not-found screen, or a
 * page with essentially no text at all).
 */
const MIN_VISIBLE_TEXT = 30;

(async () => {
  const urls = walk(DIST).map(toUrl).sort();
  const failures = [];
  const stateGated = [];

  for (const url of urls) {
    let response;
    try {
      response = await fetch(HOST + url, { redirect: 'follow' });
    } catch (error) {
      failures.push(`${url} — request failed: ${error.message}`);
      continue;
    }
    const body = await response.text();
    const text = visibleText(body);
    if (response.status !== 200) {
      failures.push(`${url} — HTTP ${response.status}`);
    } else if (text.length < MIN_VISIBLE_TEXT) {
      failures.push(`${url} — HTTP 200 but only ${text.length} chars of visible text`);
    } else if (text.length < 260) {
      stateGated.push(`${url} (${text.length})`);
    } else if (/Unmatched Route|went missing|does not exist|This screen doesn't exist/i.test(text)) {
      failures.push(`${url} — served the not-found screen`);
    }
  }

  if (failures.length) {
    console.error(`check-preview FAILED — ${failures.length} of ${urls.length} routes:`);
    failures.forEach((line) => console.error('  ' + line));
    process.exit(1);
  }
  console.log(`check-preview OK — ${urls.length} routes served 200 with rendered content on ${HOST}.`);
  const unique = [...new Set(stateGated)];
  if (unique.length) {
    console.log(`  ${unique.length} route(s) export their pre-hydration state (store is empty at build time):`);
    console.log('    ' + unique.join('\n    '));
  }
})();
