#!/usr/bin/env node
/**
 * Rendered-output gate.
 *
 * `check-i18n.js` proves every t() call site has a translation, but it cannot see
 * strings built at runtime by concatenation. That is exactly how `flow.support.faq.*`
 * once shipped to users as literal text. This script reads the *exported HTML* of
 * every route and fails if any visible text still looks like a translation key.
 *
 * Usage:  CI=1 npx expo export --platform web && node scripts/check-rendered.js
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
// A leaked key looks like `some.namespace.key` / `some.namespace.keyTwo`.
const KEY_LIKE = /\b[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9_]+)?\b/g;
// Text that legitimately contains dots and must not be reported.
const ALLOW = [/\.(js|css|png|jpg|jpeg|svg|webp|ico|json|woff2?)\b/, /(?:^|\s)i\.e\.|e\.g\.|etc\./, /^\d+(\.\d+)+$/];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === '_expo') continue;
      walk(full, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run: CI=1 npx expo export --platform web');
  process.exit(1);
}

const pages = walk(DIST);
const offenders = [];
let rawKeyPages = 0;

for (const page of pages) {
  const text = visibleText(fs.readFileSync(page, 'utf8'));
  // Only inspect text inside the app root, not the document head/meta.
  const body = text.split('Exported').pop();
  const hits = (body.match(KEY_LIKE) || []).filter((hit) => !ALLOW.some((re) => re.test(hit)));
  if (hits.length) {
    rawKeyPages += 1;
    offenders.push({ page: path.relative(DIST, page), hits: [...new Set(hits)].slice(0, 6) });
  }
}

console.log(`rendered pages checked: ${pages.length}`);
if (rawKeyPages === 0) {
  console.log(`check-rendered OK — 0 of ${pages.length} pages show raw translation keys.`);
  process.exit(0);
}

console.error(`\n✗ ${rawKeyPages} page(s) render raw translation keys:\n`);
for (const { page, hits } of offenders) {
  console.error(`  ${page}`);
  console.error(`      ${hits.join(', ')}`);
}
process.exit(1);
