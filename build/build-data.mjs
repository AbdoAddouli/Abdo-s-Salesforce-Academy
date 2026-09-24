/* ============================================================================
 * build-data.mjs
 * Aggregates the 8 Salesforce Academy curricula (+ exercise answer keys) into
 * a single namespaced file for the unified "Abdo's Salesforce Academy" site.
 *
 * It reads each source roadmap's docs/assets/curriculum.js and answers.js,
 * evaluates them in a sandbox, prefixes module ids with an academy slug so
 * they never collide, normalises the module schema, and emits
 *   docs/assets/curricula.js
 *
 * Re-run any time a source roadmap changes:  node build/build-data.mjs
 * ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, '..');          // Abdo-s-Salesforce-Academy
const ROOT    = path.resolve(PROJECT, '..');            // "Salesforce Abdo Academy"
const OUT     = path.join(PROJECT, 'docs', 'assets', 'curricula.js');

const ACADEMIES = [
  {
    slug: 'admin', cert: 'Salesforce Administrator', brand: 'Admin Academy',
    name: 'Salesforce Administration', icon: '☁️', color: '#00A1E0',
    desc: '14 phases from zero to cert-ready: data model, security, flows, approvals, data ops, analytics, and 5 capstone builds.',
    repo: 'Salesforce_Administrator_RoadMap',
    dir: path.join(ROOT, 'Salesforce Administrator', 'Salesforce Administration Roadmap'),
  },
  {
    slug: 'ba', cert: 'Salesforce Business Analyst', brand: 'Business Analyst Academy',
    name: 'Business Analysis', icon: '📊', color: '#8B5CF6',
    desc: '17 phases on requirements, process mapping, agile discovery, and solution design with real artefact patterns.',
    repo: 'Salesforce-Business-Analyst-Roadmap',
    dir: path.join(ROOT, 'Salesforce Business Analyst', 'Salesforce Business Analyst Roadmap'),
  },
  {
    slug: 'cpq', cert: 'Salesforce CPQ Specialist', brand: 'CPQ & Revenue Cloud Academy',
    name: 'CPQ & Revenue Cloud (Quote-to-Cash)', icon: '💰', color: '#F59E0B',
    desc: '17 phases of Quote-to-Cash: price books, quotes, approvals, amendment, multi-currency, and Revenue Cloud.',
    repo: 'Salesforce-CPQ-Revenue-Cloud-Roadmap',
    dir: path.join(ROOT, 'Salesforce CPQ & Revenue cloud', 'Salesforce CPQ  & Revenue Cloud Roadmap'),
  },
  {
    slug: 'datacloud', cert: 'Salesforce Data Cloud Consultant', brand: 'Data Cloud Consultant Academy',
    name: 'Data Cloud 360', icon: '🗄️', color: '#10B981',
    desc: '18 phases across data lifecycle, DLO/DMO, segmentation, identity resolution, harmonisation and activation.',
    repo: 'Salesforce-Data-cloud-360-RoadMap',
    dir: path.join(ROOT, 'Salesforce Data cloud 360', 'Salesforce Data Cloud Roadmap'),
  },
  {
    slug: 'dev', cert: 'Platform Developer I & II', brand: 'Developer I & II Academy',
    name: 'Apex Development', icon: '🧑‍💻', color: '#6366F1',
    desc: '17 phases of Apex, triggers, testing, LWC, integration and governor-limit mastery for Developer I & II.',
    repo: 'Salesforce-Dev-I-II-Roadmap',
    dir: path.join(ROOT, 'Salesforce Dev I and II roadmap', 'Salesfoerce Dev I & II'),
  },
  {
    slug: 'headless', cert: 'Headless + MCP (Agent-Readable APIs)', brand: 'Headless & MCP Academy',
    name: 'Headless Commerce & MCP', icon: '🤖', color: '#EC4899',
    desc: '16 phases on Headless 360 layers, Composable Storefront, and Model Context Protocol servers for AI agents.',
    repo: 'Salesforce-HeadLess-MCP',
    dir: path.join(ROOT, 'Salesforce HeadLeess and MCP', 'Salesforce headless & MCP'),
  },
  {
    slug: 'sales', cert: 'Sales Cloud Consultant', brand: 'Sales Cloud Academy',
    name: 'Sales Cloud', icon: '🎯', color: '#0EA5E9',
    desc: '11 phases covering pipelines, forecasting, territory management, CPQ-lite automation and Einstein selling.',
    repo: 'Salesforce-SalesCloud-RoadMap',
    dir: path.join(ROOT, 'salesforce Sales Cloud', 'Sales Cloud RoadMap'),
  },
  {
    slug: 'service', cert: 'Service Cloud Consultant', brand: 'Service Cloud Consultant Academy',
    name: 'Service Cloud', icon: '🎧', color: '#3B82F6',
    desc: '17 modules across case lifecycle, entitlements, Omni-Channel, knowledge, console, Einstein and certification prep.',
    repo: 'Salesforce-Service-Cloud-RoadMap',
    dir: path.join(ROOT, 'salesforce Service cloud', 'Salesforce Service cloud roadmap'),
  },
];

function repoBlob(repo) {
  return `https://github.com/AbdoAddouli/${repo}/blob/main/`;
}
function live(repo) {
  return `https://abdoaddouli.github.io/${repo}/`;
}
function github(repo) {
  return `https://github.com/AbdoAddouli/${repo}`;
}

function evalFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const fn = new Function(src + '\n;return { ACADEMY, GUIDE };');
  return fn();
}

function evalAnswers(file) {
  const src = fs.readFileSync(file, 'utf8');
  const fn = new Function(src + '\n;return { EXERCISE_ANSWERS };');
  return fn();
}

const registry = [];
const warnings = [];

for (const cfg of ACADEMIES) {
  const assets = path.join(cfg.dir, 'docs', 'assets');
  const curFile = path.join(assets, 'curriculum.js');
  const ansFile = path.join(assets, 'answers.js');
  if (!fs.existsSync(curFile)) { warnings.push(`SKIP ${cfg.slug}: no curriculum.js`); continue; }

  const { ACADEMY, GUIDE } = evalFile(curFile);
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
    return norm;
  });

  let answers = {};
  if (fs.existsSync(ansFile)) {
    try { answers = evalAnswers(ansFile).EXERCISE_ANSWERS || {}; }
    catch (e) { warnings.push(`${cfg.slug}: answers.js eval failed (${e.message})`); }
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
      github: github(cfg.repo),
      live: live(cfg.repo),
      guideBase,
      repoBlob: repoBlob(cfg.repo),
      phases: modules.length,
      source: path.relative(ROOT, cfg.dir),
    },
    modules,
    answers,
  });

  const lessonCount = modules.reduce((a, m) => a + m.lessons.length, 0);
  console.log(`✓ ${slug.padEnd(10)} ${String(modules.length).padStart(2)} phases · ${String(lessonCount).padStart(3)} lessons · ${Object.keys(answers).length} answers`);
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