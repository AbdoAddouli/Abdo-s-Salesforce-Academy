import fs from 'node:fs';
import path from 'node:path';
import { PROJECT } from './academies.mjs';

const DATA = path.join(PROJECT, 'docs', 'assets', 'curricula.js');
const GUIDES = path.join(PROJECT, 'docs', 'assets', 'guides');
const MANIFEST = path.join(GUIDES, 'manifest.json');
const NUL = String.fromCharCode(0);

const errors = [];
const fail = (m) => errors.push(m);

if (!fs.existsSync(DATA)) fail('docs/assets/curricula.js is missing');
if (!fs.existsSync(MANIFEST)) fail('docs/assets/guides/manifest.json is missing - run node build/build-guides.mjs');

const loadJs = (file) => {
  const ctx = { window: {} };
  new Function('window', fs.readFileSync(file, 'utf8'))(ctx.window);
  return ctx.window;
};

let academies = 0;
let phases = 0;
let guides = 0;
let kb = 0;

if (fs.existsSync(DATA)) {
  const data = loadJs(DATA).ABDO_DATA || {};
  academies = Object.keys(data).length;
  if (academies !== 8) fail(`expected 8 academies in curricula.js, found ${academies}`);

  for (const [slug, entry] of Object.entries(data)) {
    for (const m of entry.modules) {
      phases++;
      const file = path.join(GUIDES, slug, m.id + '.json');
      if (!fs.existsSync(file)) { fail(`missing guide ${slug}/${m.id}.json`); continue; }
      let g;
      try { g = JSON.parse(fs.readFileSync(file, 'utf8')); }
      catch (e) { fail(`unparseable guide ${slug}/${m.id}.json: ${e.message}`); continue; }
      guides++;
      kb += Math.round(fs.statSync(file).size / 1024);

      if (!g.html || g.html.length < 200) fail(`guide ${slug}/${m.id}.json has no html`);
      if (!Array.isArray(g.toc)) fail(`guide ${slug}/${m.id}.json has no toc array`);
      if (g.title !== m.title) fail(`guide ${slug}/${m.id}.json title mismatch: ${g.title} != ${m.title}`);
      if (g.id !== m.id) fail(`guide ${slug}/${m.id}.json id mismatch: ${g.id}`);

      for (const t of g.toc || []) {
        if (!g.html.includes(`id="${t.id}"`)) fail(`guide ${slug}/${m.id}.json toc id not in html: ${t.id}`);
      }
      if (g.html.includes(NUL)) fail(`guide ${slug}/${m.id}.json contains a raw NUL byte`);
      if (g.html.includes('&amp;lt;') || g.html.includes('&amp;gt;')) fail(`guide ${slug}/${m.id}.json has double-escaped html`);

      const prose = g.html.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code class="inline">[\s\S]*?<\/code>/g, '');
      if (/^#{1,6} /m.test(prose)) fail(`guide ${slug}/${m.id}.json still contains raw markdown headings`);
      if (prose.includes('```')) fail(`guide ${slug}/${m.id}.json still contains a code fence`);
      if (prose.includes('](')) fail(`guide ${slug}/${m.id}.json still contains a markdown link`);
      if (/^\s*\|.*\|\s*$/m.test(prose)) fail(`guide ${slug}/${m.id}.json still contains a raw markdown table`);

      for (const tag of ['table', 'thead', 'tbody', 'tr', 'ul', 'ol', 'li', 'code', 'pre', 'div', 'p']) {
        const open = (g.html.match(new RegExp('<' + tag + '[ >]', 'g')) || []).length;
        const close = (g.html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
        if (open !== close) fail(`guide ${slug}/${m.id}.json unbalanced <${tag}>: ${open} open, ${close} close`);
      }
    }
  }
}

if (errors.length) {
  console.error(`FAILED - ${errors.length} problem(s):`);
  errors.slice(0, 40).forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

console.log(`OK - ${academies} academies, ${phases} phases, ${guides} bundled guides, ~${kb} KB of guide HTML`);
