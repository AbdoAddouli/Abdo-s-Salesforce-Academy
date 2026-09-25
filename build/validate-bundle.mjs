import fs from 'node:fs';
import path from 'node:path';
import { PROJECT } from './academies.mjs';

const DATA = path.join(PROJECT, 'docs', 'assets', 'curricula.js');
const GUIDES = path.join(PROJECT, 'docs', 'assets', 'guides');
const MANIFEST = path.join(GUIDES, 'manifest.json');
const ANSWERS = path.join(PROJECT, 'docs', 'assets', 'answers');
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
let answerKeys = 0;
let answerKb = 0;
let exIndexed = 0;

if (fs.existsSync(DATA)) {
  const data = loadJs(DATA).ABDO_DATA || {};
  academies = Object.keys(data).length;
  if (academies !== 8) fail(`expected 8 academies in curricula.js, found ${academies}`);

  for (const [slug, entry] of Object.entries(data)) {
    /* ---- exercise answer keys ---- */
    const ids = Array.isArray(entry.answerIds) ? entry.answerIds : [];
    const exercises = new Set();

    /* Exercise code is authored several ways: a plain string, {x, lang}, or a map
       of named snippets ({setup: [...], apex}). Anything else breaks the code block. */
    const textOk = (v) => typeof v === 'string' ? v.trim().length > 0
      : Array.isArray(v) && v.length > 0 && v.every(x => typeof x === 'string' && x.trim());
    const codeOk = (code, where) => {
      if (code == null) return;
      if (typeof code === 'string' || Array.isArray(code)) { if (!textOk(code)) fail(`${where}: empty exercise code`); return; }
      if (typeof code !== 'object') { fail(`${where}: exercise code must be a string, array or object`); return; }
      if (code.x != null) { if (!textOk(code.x)) fail(`${where}: exercise code.x is empty`); return; }
      const keys = Object.keys(code);
      if (!keys.length) { fail(`${where}: exercise code object is empty`); return; }
      const bad = keys.filter(k => !textOk(code[k]));
      if (bad.length) fail(`${where}: exercise code has unusable snippet(s): ${bad.join(', ')}`);
    };

    for (const m of entry.modules) {
      /* exIndex is what makes the phase-page "Exercises & Mini Projects" section
         work for academies whose exercises live inside lesson blocks instead of
         m.exercises. It must cover every exercise exactly once and point at a
         real lesson. */
      if (!Array.isArray(m.exIndex)) fail(`${slug}/${m.id}: no exIndex array`);
      else {
        const seen = new Set();
        (m.exercises || []).forEach((ex, card) => {
          const e = m.exIndex[card];
          if (!e || e.li !== -1 || e.card !== card) fail(`${slug}/${m.id}: exIndex card ${card} does not map to exercises[${card}]`);
        });
        m.exIndex.filter(e => e.li !== -1).forEach(e => {
          const key = e.li + '|' + e.id;
          if (seen.has(key)) fail(`${slug}/${m.id}: exIndex lists ${e.id} twice for lesson ${e.li + 1}`);
          seen.add(key);
          const lesson = (m.lessons || [])[e.li];
          if (!lesson) { fail(`${slug}/${m.id}: exIndex points at missing lesson ${e.li + 1}`); return; }
          const found = (lesson.blocks || []).some(b => (b.t === 'ex' || b.t === 'proj') && (b.id || null) === (e.id || null));
          if (!found) fail(`${slug}/${m.id}: exIndex points at lesson ${e.li + 1} for ${e.id || '(no id)'}, which has no such exercise`);
        });
        const real = (m.exercises || []).length +
          (m.lessons || []).reduce((n, l) => n + (l.blocks || []).filter(b => b.t === 'ex' || b.t === 'proj').length, 0);
        if (real && m.exIndex.length !== real) fail(`${slug}/${m.id}: exIndex has ${m.exIndex.length} entries but the module has ${real} exercise(s)`);
        /* The phase page deep links to #/<anchor> on the lesson page, and the card
           is rendered with that same id. Two exercises must not share one. */
        const anchors = new Map();
        for (const e of m.exIndex) {
          const a = e.li === -1
            ? 'ex-card-' + (() => { const ex = (m.exercises || [])[e.card || 0] || {}; return ex.id != null ? ex.id : (ex.n != null ? ex.n : (e.card || 0)); })()
            : 'ex-' + String(e.id != null ? e.id : 'ex' + e.li).replace(/[^\w-]/g, '-');
          if (anchors.has(a)) fail(`${slug}/${m.id}: exercises ${anchors.get(a)} and ${e.id} share the anchor id ${a}`);
          anchors.set(a, e.id);
        }
        exIndexed += m.exIndex.length;
      }

      for (const ex of m.exercises || []) {
        if (ex.id) exercises.add(ex.id);
        codeOk(ex.code, `${slug}/${m.id} exercise ${ex.id || ex.n}`);
      }
      for (const l of m.lessons || []) {
        for (const b of l.blocks || []) {
          if (b.t !== 'ex' && b.t !== 'proj') continue;
          if (b.id) exercises.add(b.id);
          codeOk(b.code, `${slug}/${m.id} block ${b.id || '(no id)'}`);
        }
      }
    }
    for (const id of ids) if (!exercises.has(id)) fail(`${slug}: answerIds references unknown exercise ${id}`);

    if (ids.length) {
      const ansFile = path.join(ANSWERS, slug + '.json');
      if (!fs.existsSync(ansFile)) {
        fail(`missing answers/${slug}.json for ${ids.length} answer key(s) - run node build/build-data.mjs`);
      } else {
        answerKb += Math.round(fs.statSync(ansFile).size / 1024);
        let map;
        try { map = JSON.parse(fs.readFileSync(ansFile, 'utf8')); }
        catch (e) { fail(`unparseable answers/${slug}.json: ${e.message}`); map = null; }
        if (map) {
          for (const id of ids) {
            const html = map[id];
            if (typeof html !== 'string' || !html.trim()) { fail(`answers/${slug}.json has no html for ${id}`); continue; }
            answerKeys++;
            if (html.includes(NUL)) fail(`answers/${slug}.json contains a raw NUL byte (${id})`);
            if (html.includes('&amp;lt;') || html.includes('&amp;gt;')) fail(`answers/${slug}.json has double-escaped html (${id})`);
            if (html.includes('object Object')) fail(`answers/${slug}.json contains "[object Object]" (${id})`);
            const prose = html.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code class="inline">[\s\S]*?<\/code>/g, '');
            if (/^#{1,6} /m.test(prose)) fail(`answers/${slug}.json still contains raw markdown headings (${id})`);
            if (prose.includes('```')) fail(`answers/${slug}.json still contains a code fence (${id})`);
            if (prose.includes('](')) fail(`answers/${slug}.json still contains a markdown link (${id})`);
            for (const tag of ['table', 'thead', 'tbody', 'tr', 'ul', 'ol', 'li', 'code', 'pre', 'div', 'p']) {
              const open = (html.match(new RegExp('<' + tag + '[ >]', 'g')) || []).length;
              const close = (html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
              if (open !== close) fail(`answers/${slug}.json (${id}) unbalanced <${tag}>: ${open} open, ${close} close`);
            }
          }
        }
      }
    } else if (fs.existsSync(path.join(ANSWERS, slug + '.json'))) {
      fail(`answers/${slug}.json exists but ${slug} declares no answerIds`);
    }

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

console.log(`OK - ${academies} academies, ${phases} phases, ${guides} bundled guides, ~${kb} KB of guide HTML, ${answerKeys} answer keys (~${answerKb} KB), ${exIndexed} indexed exercises`);
