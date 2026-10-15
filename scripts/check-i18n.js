#!/usr/bin/env node
/**
 * Localization integrity check.
 *
 * Fails (exit 1) when:
 *   1. a key exists in en but not gu (or vice versa) — parity
 *   2. a `t('…')` call site in src references a key that no catalogue defines
 *      (this is the check that would have caught the `home.tagline` leak, where
 *       the raw key path rendered on screen instead of copy)
 *
 * Run: node scripts/check-i18n.js
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');

/** Transpiles a TS catalogue and evaluates it (they are plain object literals). */
function loadCatalogue(file) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('exports', 'module', 'require', js)(module.exports, module, require);
  return module.exports;
}

const dottedKeys = [];

function flatten(obj, prefix = '') {
  const out = {};
  for (const [rawKey, value] of Object.entries(obj)) {
    // keys containing dots are treated as nested paths, matching readPath
    const key = rawKey;
    if (value && typeof value === 'object') Object.assign(out, flatten(value, `${prefix}${key}.`));
    else {
      // Guard: LanguageContext.readPath splits the key path on '.', so a
      // literal key whose NAME contains a dot (e.g. `'faq.q1'`) is unreachable
      // at runtime even though it looks fine here. Collect them and fail below.
      if (rawKey.includes('.')) dottedKeys.push(`${prefix}${rawKey}`);
      out[`${prefix}${key}`] = value;
    }
  }
  return out;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const en = flatten(loadCatalogue('src/translations/en.ts').en);
const gu = flatten(loadCatalogue('src/translations/gu.ts').gu);

let failures = 0;

// A key named like a path cannot be resolved by readPath — catch it early.
if (dottedKeys.length) {
  failures += dottedKeys.length;
  console.error(`✗ ${dottedKeys.length} catalogue key(s) contain a '.' in the name (unreachable at runtime):`);
  dottedKeys.forEach((k) => console.error(`    ${k}`));
}

const missingInGu = Object.keys(en).filter((k) => !(k in gu));
const onlyInGu = Object.keys(gu).filter((k) => !(k in en));
if (missingInGu.length) {
  failures += missingInGu.length;
  console.error(`✗ ${missingInGu.length} key(s) missing from gu.ts:`);
  missingInGu.forEach((k) => console.error(`    ${k}`));
}
if (onlyInGu.length) {
  failures += onlyInGu.length;
  console.error(`✗ ${onlyInGu.length} key(s) only present in gu.ts:`);
  onlyInGu.forEach((k) => console.error(`    ${k}`));
}

// --- call-site audit: only literal keys can be checked statically ---
const used = new Map();
for (const file of walk(path.join(ROOT, 'src'))) {
  const source = fs.readFileSync(file, 'utf8');
  // single-quoted keys
  for (const match of source.matchAll(/\bt\(\s*'([^']+)'/g)) {
    if (!used.has(match[1])) used.set(match[1], path.relative(ROOT, file));
  }
  // backtick keys with no interpolation (a `` t(`a.b`) `` miss is otherwise invisible)
  for (const match of source.matchAll(/\bt\(\s*`([^`$]*)`/g)) {
    if (!used.has(match[1])) used.set(match[1], path.relative(ROOT, file));
  }
}
const unresolved = [...used.entries()].filter(([key]) => !(key in en));
if (unresolved.length) {
  failures += unresolved.length;
  console.error(`✗ ${unresolved.length} t() key(s) have no translation (would render raw):`);
  unresolved.forEach(([key, file]) => console.error(`    ${key}   <- ${file}`));
}

if (failures) {
  console.error(`\ncheck-i18n FAILED — ${failures} problem(s).`);
  process.exit(1);
}

console.log(`check-i18n OK — en ${Object.keys(en).length} keys, gu ${Object.keys(gu).length} keys, ` +
  `${used.size} literal call sites, 0 unresolved.`);
