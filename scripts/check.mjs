import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const root = process.cwd();
const errors = [];

function filesUnder(directory, extension) {
  const output = [];
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
    if (entry === '.git' || entry === 'node_modules') continue;
    if (statSync(full).isDirectory()) output.push(...filesUnder(full, extension));
    else if (!extension || extname(entry) === extension) output.push(full);
  }
  return output;
}

function report(file, message) {
  errors.push(`${relative(root, file)}: ${message}`);
}

function localTarget(sourceFile, rawUrl) {
  if (!rawUrl || rawUrl.startsWith('#') || /^(?:https?:|tel:|mailto:|data:)/i.test(rawUrl)) return null;
  const clean = rawUrl.split(/[?#]/, 1)[0];
  if (!clean) return null;
  let decoded;
  try { decoded = decodeURIComponent(clean); } catch { decoded = clean; }
  const target = decoded.startsWith('/') ? resolve(root, `.${decoded}`) : resolve(dirname(sourceFile), decoded);
  return target.endsWith('/') ? join(target, 'index.html') : target;
}

const htmlFiles = filesUnder(root, '.html');
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  if (!/^<!doctype html>/i.test(html)) report(file, 'missing HTML5 doctype');
  if (!/<html\s[^>]*lang="en"/i.test(html)) report(file, 'missing document language');
  if (!/<meta\s+name="viewport"/i.test(html)) report(file, 'missing viewport meta');
  if (!/<meta\s+name="description"/i.test(html)) report(file, 'missing description meta');
  if (!/<title>[^<]+<\/title>/i.test(html)) report(file, 'missing non-empty title');
  if (!/<main(?:\s|>)/i.test(html)) report(file, 'missing main landmark');
  if (file.endsWith('404.html') && !/<meta\s+name="robots"\s+content="noindex"/i.test(html)) report(file, '404 page must be noindex');

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  for (const id of new Set(ids)) {
    if (ids.filter((candidate) => candidate === id).length > 1) report(file, `duplicate id "${id}"`);
  }

  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const target = localTarget(file, match[1]);
    if (target && !existsSync(target)) report(file, `broken local reference "${match[1]}"`);
  }

  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    if (!/rel="[^"]*noopener[^"]*"/i.test(match[0])) report(file, 'target="_blank" link missing rel="noopener"');
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt="[^"]*"/i.test(match[0])) report(file, 'image missing alt attribute');
    if (!/\swidth="\d+"/i.test(match[0]) || !/\sheight="\d+"/i.test(match[0])) report(file, 'image missing intrinsic dimensions');
  }
}

for (const file of filesUnder(join(root, 'js'), '.js')) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (error) {
    report(file, String(error.stderr || error.message).trim());
  }
}

// Exercise the shared data and pickup-list rules without a browser dependency.
try {
  const storage = new Map();
  const context = {
    CustomEvent: class CustomEvent {
      constructor(type, options = {}) { this.type = type; this.detail = options.detail; }
    },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
    },
    addEventListener() {},
    dispatchEvent() {},
  };
  context.window = context;
  for (const filename of ['utils.js', 'data.js', 'cart.js']) {
    runInNewContext(readFileSync(join(root, 'js', filename), 'utf8'), context, { filename });
  }
  const regulated = context.AGS.PRODUCTS.find((product) => product.regulated && product.stock > 0);
  const eligible = context.AGS.PRODUCTS.find((product) => !product.regulated && product.stock > 0);
  if (!regulated || !eligible) throw new Error('sample catalog lacks products required for rule checks');
  if (context.AGSCart.add(regulated, 1).ok) throw new Error('regulated product was added to pickup list');
  if (!context.AGSCart.add(eligible, eligible.stock + 50).ok) throw new Error('eligible product could not be added');
  if (context.AGSCart.items()[0].qty !== eligible.stock) throw new Error('pickup-list quantity exceeded sample availability');
  context.AGSCart.setQty(eligible.id, 0);
  if (context.AGSCart.count() !== 0) throw new Error('zero quantity did not remove pickup-list item');
  if (context.AGSUtils.escapeHTML('<img onerror="x">').includes('<')) throw new Error('HTML escaping failed');
} catch (error) {
  errors.push(`Runtime rules: ${error.message}`);
}

const cssFiles = filesUnder(join(root, 'css'), '.css');
const cssText = cssFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
const definitions = new Set([...cssText.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
for (const match of cssText.matchAll(/var\((--[a-z0-9-]+)/gi)) {
  if (!definitions.has(match[1])) errors.push(`CSS: undefined custom property ${match[1]}`);
}

const allSource = filesUnder(root)
  .filter((file) => ['.html', '.js'].includes(extname(file)))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
for (const forbidden of ['data-pplx-inline-edit', 'cdn.jsdelivr.net/npm/chart.js', 'Checkout (mock)', 'Message sent.', "You're booked!"]) {
  if (allSource.includes(forbidden)) errors.push(`source contains removed prototype marker: ${forbidden}`);
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML pages, ${cssFiles.length} stylesheets, and ${filesUnder(join(root, 'js'), '.js').length} JavaScript files.`);
