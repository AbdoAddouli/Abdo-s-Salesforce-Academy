import fs from 'node:fs';
import path from 'node:path';
import { ACADEMIES, PROJECT, GUIDE_OUT, repoBlob, evalCurriculum } from './academies.mjs';
import { renderMarkdown } from './markdown.mjs';

const MANIFEST = path.join(GUIDE_OUT, 'manifest.json');
const warnings = [];
let total = 0;
let bytes = 0;

const manifest = { generated: new Date().toISOString().slice(0, 10), academies: {} };

function cleanName(file) {
  return path.basename(file).replace(/\.md$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function slugOfTitle(title) {
  return String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function writeJson(file, obj) {
  const json = JSON.stringify(obj).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  fs.writeFileSync(file, json, 'utf8');
  bytes += Buffer.byteLength(json);
}

for (const cfg of ACADEMIES) {
  const curriculumFile = path.join(cfg.dir, 'docs', 'assets', 'curriculum.js');
  if (!fs.existsSync(curriculumFile)) { warnings.push(`SKIP ${cfg.slug}: no curriculum.js`); continue; }

  const guideDir = path.join(cfg.dir, cfg.guideDir);
  if (!fs.existsSync(guideDir)) { warnings.push(`SKIP ${cfg.slug}: no ${cfg.guideDir}`); continue; }

  const { ACADEMY, GUIDE } = evalCurriculum(curriculumFile);
  const remoteBase = (GUIDE && GUIDE.trim()) ? GUIDE : repoBlob(cfg.repo) + cfg.guideDir + '/';
  const byFile = new Map();

  ACADEMY.forEach((m, i) => {
    const modId = cfg.slug + '-' + m.id;
    const n = m.n || i + 1;
    if (m.guide) byFile.set(cleanName(m.guide), { modId, n, title: m.title });
    else byFile.set('__index' + n, { modId, n, title: m.title });
  });

  const files = fs.readdirSync(guideDir).filter((f) => f.endsWith('.md')).sort();
  const numbered = files.filter((f) => /^\d\d-/.test(f));
  const out = {};
  let ok = 0;

  for (const m of ACADEMY) {
    const modId = cfg.slug + '-' + m.id;
    const n = m.n || ACADEMY.indexOf(m) + 1;
    const file = (m.guide && fs.existsSync(path.join(guideDir, m.guide)))
      ? m.guide
      : (numbered[n - 1] || numbered[ACADEMY.indexOf(m)] || null);

    if (!file) { warnings.push(`${cfg.slug}/${modId}: no guide file`); continue; }

    const source = path.join(guideDir, file);
    const markdown = fs.readFileSync(source, 'utf8');

    const linkFor = (href) => {
      const clean = href.split('#')[0].split('?')[0];
      if (!clean) return null;
      if (/^https?:\/\//i.test(clean)) return null;
      const key = cleanName(clean);
      const target = byFile.get(key);
      if (target) return `#/a/${cfg.slug}/guide/${target.modId}`;
      if (/\.md$/i.test(clean)) return remoteBase + clean.replace(/^\.\//, '');
      const rel = clean.replace(/^\.\//, '');
      return remoteBase + rel.split('/').map(encodeURIComponent).join('/');
    };

    const { html, toc, title } = renderMarkdown(markdown, { linkFor });
    const guideUrl = remoteBase + file.split('/').map(encodeURIComponent).join('/');

    out[modId] = {
      id: modId,
      slug: cfg.slug,
      n,
      title: m.title,
      docTitle: title || m.title,
      file,
      source: path.relative(PROJECT, source).split(path.sep).join('/'),
      url: guideUrl,
      toc,
      html,
    };
    ok++;
    total++;
  }

  const slugDir = path.join(GUIDE_OUT, cfg.slug);
  fs.mkdirSync(slugDir, { recursive: true });
  for (const key of fs.readdirSync(slugDir)) fs.rmSync(path.join(slugDir, key), { force: true });
  for (const [modId, data] of Object.entries(out)) writeJson(path.join(slugDir, modId + '.json'), data);

  manifest.academies[cfg.slug] = {
    brand: cfg.brand,
    guideDir: cfg.guideDir,
    repo: cfg.repo,
    modules: Object.values(out).map((g) => ({ id: g.id, n: g.n, title: g.title, file: g.file, toc: g.toc.length })),
  };

  console.log(`\u2713 ${cfg.slug.padEnd(10)} ${String(ok).padStart(2)}/${ACADEMY.length} guides \u00b7 ${files.length} md files \u00b7 ${cfg.guideDir}`);
  if (ok < ACADEMY.length) warnings.push(`${cfg.slug}: only ${ok}/${ACADEMY.length} guides bundled`);
}

fs.mkdirSync(GUIDE_OUT, { recursive: true });
writeJson(MANIFEST, manifest);

console.log(`\nBundled ${total} guides \u00b7 ${Math.round(bytes / 1024)} KB \u2192 ${path.relative(PROJECT, GUIDE_OUT)}`);
if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach((w) => console.log('  ' + w));
}
