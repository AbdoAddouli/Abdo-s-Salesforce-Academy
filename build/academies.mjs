/* ============================================================================
 * academies.mjs — the single source of truth for the nine academies.
 *
 * Shared by:
 *   build/build-data.mjs    -> docs/assets/curricula.js   (lesson summaries)
 *   build/build-guides.mjs  -> docs/assets/guides/**.json (full phase guides)
 *   build/validate-bundle.mjs
 *
 * `dir`       local checkout of the source roadmap (sibling folder)
 * `guideDir`  folder inside `dir` that holds the phase guide markdown
 * ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT = path.resolve(__dirname, '..');   // Abdo-s-Salesforce-Academy
export const ROOT    = path.resolve(PROJECT, '..');     // "Salesforce Abdo Academy"

export const ACADEMIES = [
  {
    slug: 'admin', cert: 'Salesforce Administrator', brand: 'Admin Academy',
    name: 'Salesforce Administration', icon: '☁️', color: '#00A1E0',
    desc: '14 phases from zero to cert-ready: data model, security, flows, approvals, data ops, analytics, and 5 capstone builds.',
    repo: 'Salesforce_Administrator_RoadMap',
    dir: path.join(ROOT, 'Salesforce Administrator', 'Salesforce Administration Roadmap'),
    guideDir: 'admin Roadmap',
  },
  {
    slug: 'ba', cert: 'Salesforce Business Analyst', brand: 'Business Analyst Academy',
    name: 'Business Analysis', icon: '📊', color: '#8B5CF6',
    desc: '17 phases on requirements, process mapping, agile discovery, and solution design with real artefact patterns.',
    repo: 'Salesforce-Business-Analyst-Roadmap',
    dir: path.join(ROOT, 'Salesforce Business Analyst', 'Salesforce Business Analyst Roadmap'),
    guideDir: 'developer Business Analyst Roadmap',
  },
  {
    slug: 'cpq', cert: 'Salesforce CPQ Specialist', brand: 'CPQ & Revenue Cloud Academy',
    name: 'CPQ & Revenue Cloud (Quote-to-Cash)', icon: '💰', color: '#F59E0B',
    desc: '17 phases of Quote-to-Cash: price books, quotes, approvals, amendment, multi-currency, and Revenue Cloud.',
    repo: 'Salesforce-CPQ-Revenue-Cloud-Roadmap',
    dir: path.join(ROOT, 'Salesforce CPQ & Revenue cloud', 'Salesforce CPQ  & Revenue Cloud Roadmap'),
    guideDir: 'developer CPQ & Revenue Cloud Roadmap',
  },
  {
    slug: 'datacloud', cert: 'Salesforce Data Cloud Consultant', brand: 'Data Cloud Consultant Academy',
    name: 'Data Cloud 360', icon: '🗄️', color: '#10B981',
    desc: '18 phases across data lifecycle, DLO/DMO, segmentation, identity resolution, harmonisation and activation.',
    repo: 'Salesforce-Data-cloud-360-RoadMap',
    dir: path.join(ROOT, 'Salesforce Data cloud 360', 'Salesforce Data Cloud Roadmap'),
    guideDir: 'docs/guide',
  },
  {
    slug: 'dev', cert: 'Platform Developer I & II', brand: 'Developer I & II Academy',
    name: 'Apex Development', icon: '🧑‍💻', color: '#6366F1',
    desc: '17 phases of Apex, triggers, testing, LWC, integration and governor-limit mastery for Developer I & II.',
    repo: 'Salesforce-Dev-I-II-Roadmap',
    dir: path.join(ROOT, 'Salesforce Dev I and II roadmap', 'Salesfoerce Dev I & II'),
    guideDir: 'docs/guide',
  },
  {
    slug: 'headless', cert: 'Headless + MCP (Agent-Readable APIs)', brand: 'Headless & MCP Academy',
    name: 'Headless Commerce & MCP', icon: '🤖', color: '#EC4899',
    desc: '16 phases on Headless 360 layers, Composable Storefront, and Model Context Protocol servers for AI agents.',
    repo: 'Salesforce-HeadLess-MCP',
    dir: path.join(ROOT, 'Salesforce HeadLeess and MCP', 'Salesforce headless & MCP'),
    guideDir: 'developer Headless and MCP Roadmap',
  },
  {
    slug: 'sales', cert: 'Sales Cloud Consultant', brand: 'Sales Cloud Academy',
    name: 'Sales Cloud', icon: '🎯', color: '#0EA5E9',
    desc: '11 phases covering pipelines, forecasting, territory management, CPQ-lite automation and Einstein selling.',
    repo: 'Salesforce-SalesCloud-RoadMap',
    dir: path.join(ROOT, 'salesforce Sales Cloud', 'Sales Cloud RoadMap'),
    guideDir: 'salesCloud Roadmap',
  },
  {
    slug: 'service', cert: 'Service Cloud Consultant', brand: 'Service Cloud Consultant Academy',
    name: 'Service Cloud', icon: '🎧', color: '#3B82F6',
    desc: '17 modules across case lifecycle, entitlements, Omni-Channel, knowledge, console, Einstein and certification prep.',
    repo: 'Salesforce-Service-Cloud-RoadMap',
    dir: path.join(ROOT, 'salesforce Service cloud', 'Salesforce Service cloud roadmap'),
    guideDir: 'developer Service Cloud Consultant Roadmap',
  },
  {
    slug: 'mktcloud', cert: 'Marketing Cloud Consultant', brand: 'Marketing Cloud Academy',
    name: 'Marketing Cloud', icon: '📣', color: '#14B8A6',
    desc: '17 phases across Marketing Cloud Engagement and Next: the subscriber data model, Data 360 identity resolution, deliverability, journeys, consent, Agentforce and analytics.',
    repo: 'Salesforce-Marketing-Cloud-RoadMap',
    dir: path.join(ROOT, 'Salesforce Marketing Cloud', 'Salesforce Mareketing Cloud Roadmap'),
    guideDir: 'docs/guide',
  },
];

export const repoBlob = (repo) => `https://github.com/AbdoAddouli/${repo}/blob/main/`;
export const liveUrl  = (repo) => `https://abdoaddouli.github.io/${repo}/`;
export const repoUrl  = (repo) => `https://github.com/AbdoAddouli/${repo}`;

export const GUIDE_OUT = path.join(PROJECT, 'docs', 'assets', 'guides');

/** Evaluates a source roadmap's curriculum.js in a throwaway function scope. */
export function evalCurriculum(file) {
  const src = fs.readFileSync(file, 'utf8');
  return new Function(src + '\n;return { ACADEMY, GUIDE };')();
}
export function evalAnswers(file) {
  const src = fs.readFileSync(file, 'utf8');
  return new Function(src + '\n;return { EXERCISE_ANSWERS };')();
}
