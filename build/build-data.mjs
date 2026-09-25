/* ============================================================================
 * build-data.mjs
 * Aggregates the 8 Salesforce Academy curricula (+ exercise answer keys) into
 * a single namespaced file for the unified "Abdo's Salesforce Academy" site.
 *
 * It reads each source roadmap's docs/assets/curriculum.js and answers.js,
 * evaluates them in a sandbox, prefixes module ids with an academy slug so
 * they never collide, normalises the module schema, and emits
 *   docs/assets/curricula.js        (lesson summaries + answer id list)
 *   docs/assets/answers/<slug>.json (answer keys pre-rendered to HTML)
 *
 * Answer keys are converted with the same markdown converter the phase guides
 * use, so the browser never needs a markdown parser and curricula.js stays
 * small - answer HTML is fetched on demand, like the guides.
 *
 * Re-run any time a source roadmap changes:  node build/build-data.mjs
 * ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { ACADEMIES, PROJECT, ROOT, repoBlob, liveUrl, repoUrl, evalCurriculum, evalAnswers } from './academies.mjs';
import { renderMarkdown } from './markdown.mjs';

const OUT = path.join(PROJECT, 'docs', 'assets', 'curricula.js');
const ANSWERS_OUT = path.join(PROJECT, 'docs', 'assets', 'answers');

const registry = [];
const warnings = [];

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);

for (const cfg of ACADEMIES) {
  const assets = path.join(cfg.dir, 'docs', 'assets');
  const curFile = path.join(assets, 'curriculum.js');
  const ansFile = path.join(assets, 'answers.js');
  if (!fs.existsSync(curFile)) { warnings.push(`SKIP ${cfg.slug}: no curriculum.js`); continue; }

  const { ACADEMY, GUIDE } = evalCurriculum(curFile);

  const slug = cfg.slug;
  const baseModule = path.join(cfg.dir, 'docs');

  /* Prefix module ids and normalise the module schema */
  const modules = (ACADEMY || []).map((m, i) => {
    const norm = Object.assign({}, m);
    norm.id = slug + '-' + m.id;
    if (!norm.n) norm.n = i + 1;
    if (!norm.icon) norm.icon = cfg.icon;
    if (!norm.color) norm.color = cfg.color;
    if (!norm.tagline) norm.tagline = '';
    norm.lessons = Array.isArray(norm.lessons) ? norm.lessons : [];
    if (!norm.quiz) norm.quiz = { title: 'Module quiz', mins: 8, questions: [] };
    norm.quiz.title = norm.quiz.title || 'Module quiz';
    norm.quiz.mins = norm.quiz.mins || 8;
    norm.quiz.questions = Array.isArray(norm.quiz.questions) ? norm.quiz.questions : [];

    /* Exercise index. Source roadmaps put exercises in two places: a
       module-level `exercises` array (Admin) or `t:'ex'`/`t:'proj'` blocks
       inside lesson blocks (everyone else). Collect both so the phase page can
       link to them. `li === -1` marks a module-level card (identified by its
       position in `card`); anything else is the owning lesson index.
       Titles stay in the source data to keep this index small. */
    norm.exIndex = [];
    (norm.exercises || []).forEach((ex, card) => {
      norm.exIndex.push({ id: ex.id || null, li: -1, card, kind: ex.type === 'project' ? 'proj' : 'card' });
    });
    norm.lessons.forEach((l, li) => {
      for (const b of l.blocks || []) {
        if (b.t !== 'ex' && b.t !== 'proj') continue;
        norm.exIndex.push({ id: b.id || null, li, kind: b.t, stars: b.stars || 0 });
      }
    });

    return norm;
  });

  let answers = {};
  if (fs.existsSync(ansFile)) {
    try { answers = evalAnswers(ansFile).EXERCISE_ANSWERS || {}; }
    catch (e) { warnings.push(`${cfg.slug}: answers.js eval failed (${e.message})`); }
  }

  /* Exercise ids referenced by the academy, used to keep curricula.js honest. */
  const exerciseIds = new Set();
  for (const m of modules) {
    for (const ex of m.exercises || []) if (ex.id) exerciseIds.add(ex.id);
    for (const l of m.lessons || []) {
      for (const b of l.blocks || []) if ((b.t === 'ex' || b.t === 'proj') && b.id) exerciseIds.add(b.id);
    }
  }

  const answerIds = Object.keys(answers).filter((id) => exerciseIds.has(id)).sort();
  const orphans = Object.keys(answers).filter((id) => !exerciseIds.has(id));
  if (orphans.length) warnings.push(`${cfg.slug}: ${orphans.length} answer key(s) with no matching exercise: ${orphans.slice(0, 5).join(', ')}${orphans.length > 5 ? '…' : ''}`);

  const answerHtml = {};
  for (const id of answerIds) {
    const value = answers[id];
    const isObj = value && typeof value === 'object';
    const body = String(isObj ? (value.body || '') : value).trim();
    let html = body
      ? renderMarkdown(body, { headingOffset: 2 }).html
      : '<p><em>No reference answer recorded yet.</em></p>';
    if (isObj && value.title) html = '<p><strong>' + esc(value.title) + '</strong></p>' + html;
    answerHtml[id] = html;
  }

  if (Object.keys(answerHtml).length) {
    fs.mkdirSync(ANSWERS_OUT, { recursive: true });
    const body = JSON.stringify(answerHtml).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    fs.writeFileSync(path.join(ANSWERS_OUT, cfg.slug + '.json'), body, 'utf8');
  }

  const guideBase = (GUIDE && GUIDE.trim()) ? GUIDE : repoBlob(cfg.repo) + 'docs/guide/';

  registry.push({
    slug,
    meta: {
      slug,
      brand: cfg.brand,
      name: cfg.name,
      cert: cfg.cert,
      icon: cfg.icon,
      color: cfg.color,
      desc: cfg.desc,
      repo: cfg.repo,
      github: repoUrl(cfg.repo),
      live: liveUrl(cfg.repo),
      guideBase,
      repoBlob: repoBlob(cfg.repo),
      phases: modules.length,
      source: path.relative(ROOT, cfg.dir),
    },
    modules,
    answerIds,
  });

  const lessonCount = modules.reduce((a, m) => a + m.lessons.length, 0);
  console.log(`✓ ${cfg.slug.padEnd(10)} ${String(modules.length).padStart(2)} phases · ${String(lessonCount).padStart(3)} lessons · ${answerIds.length} answers`);
}

/* ---- serialize (compact, safe line separators) ---- */
let out = '/* =============================================================================\n';
out += ' * Abdo\'s Salesforce Academy — aggregated curriculum data\n';
out += ' * GENERATED by build-data.mjs · do not edit by hand. Run  node build/build-data.mjs\n';
out += ' * to regenerate after any source roadmap changes.\n';
out += ' * ============================================================================= */\n\n';
out += 'window.ABDO_DATA = window.ABDO_DATA || {};\n';

for (const entry of registry) {
  const json = JSON.stringify(entry)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  out += `\nwindow.ABDO_DATA[${JSON.stringify(entry.slug)}] =\n  ${json};\n`;
}

fs.writeFileSync(OUT, out, 'utf8');
const kb = Math.round(fs.statSync(OUT).size / 1024);
console.log(`\nWrote ${path.relative(PROJECT, OUT)}  (${kb} KB, ${registry.length} academies)`);
if (warnings.length) { console.log('\nWarnings:\n' + warnings.join('\n')); }