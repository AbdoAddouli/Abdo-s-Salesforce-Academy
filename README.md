# Abdo's Salesforce Academy

> **One studio for all 8 Salesforce roadmaps.** Master the Salesforce ecosystem from a single site — official-style study roadmaps for certification tracks and skills, each with phases, lessons, quizzes, exercises, progress tracking and printable certificates.

🔗 **Live site:** https://abdoaddouli.github.io/Abdo-s-Salesforce-Academy/

---

## Table of contents

- [What is this?](#what-is-this)
- [The 8 academies](#the-8-academies)
- [How to use the site](#how-to-use-the-site)
- [Progress, bookmarks & certificates](#progress-bookmarks--certificates)
- [Tech stack & architecture](#tech-stack--architecture)
- [Local development](#local-development)
- [Deployment](#deployment)
- [Additional resources](#additional-resources)
- [License](#license)

---

## What is this?

The original eight certification roadmaps each lived in their **own GitHub repo and its own little website**. This project merges them all into **one single-page application** so you can:

- see your **overall progress across every certification** on one dashboard,
- **search once** and find lessons, quizzes and concepts from any academy,
- **switch academies** (Administrator → Developer → Service Cloud…) without leaving the page,
- keep **one progress store** (your checkmarks in the old sites are migrated over automatically).

### Why was it built this way?

- Every source academy is a Salesforce DX-style project whose curriculum lives in a single `curriculum.js` data file.
- A small build script (`build/build-data.mjs`) reads all eight files, **renames module ids** so they never collide, and merges everything into one data bundle.
- `app.js` renders that bundle — same look & feel as the original sites, but unified.

No server, no database, no framework dependencies. Everything runs in the browser and your progress stays on your machine.

---

## The 8 academies

| # | Academy | Phases | Focus | Source repo | Live site |
|---|---------|-------:|-------|-------------|-----------|
| 1 | **Salesforce Administrator** | 14 | Org setup, security, object model, automation (Flows), reports & dashboards — for the **Administrator** certification | [Salesforce_Administrator_RoadMap](https://github.com/AbdoAddouli/Salesforce_Administrator_RoadMap) | [open](https://abdoaddouli.github.io/Salesforce_Administrator_RoadMap/) |
| 2 | **Salesforce Business Analyst** | 17 | Discovery, requirements gathering, data mapping & stakeholder alignment — for the **Business Analyst** certification | [Salesforce-Business-Analyst-Roadmap](https://github.com/AbdoAddouli/Salesforce-Business-Analyst-Roadmap) | [open](https://abdoaddouli.github.io/Salesforce-Business-Analyst-Roadmap/) |
| 3 | **CPQ & Revenue Cloud** | 17 | Products, bundles, options, pricing, quoting & billing — for the **CPQ / Revenue Cloud** track | [Salesforce-CPQ-Revenue-Cloud-Roadmap](https://github.com/AbdoAddouli/Salesforce-CPQ-Revenue-Cloud-Roadmap) | [open](https://abdoaddouli.github.io/Salesforce-CPQ-Revenue-Cloud-Roadmap/) |
| 4 | **Data Cloud 360** | 18 | Ingestion, data model, identity resolution, segmentation & activation — for the **Data Cloud** track | [Salesforce-Data-cloud-360-RoadMap](https://github.com/AbdoAddouli/Salesforce-Data-cloud-360-RoadMap) | [open](https://abdoaddouli.github.io/Salesforce-Data-cloud-360-RoadMap/) |
| 5 | **Developer I & II** | 17 | Apex, Lightning Web Components, integrations, async processing & testing — for **Platform Developer I / II** | [Salesforce-Dev-I-II-Roadmap](https://github.com/AbdoAddouli/Salesforce-Dev-I-II-Roadmap) | [open](https://abdoaddouli.github.io/Salesforce-Dev-I-II-Roadmap/) |
| 6 | **Headless & MCP** | 16 | Headless architecture via APIs, and Model Context Protocol (MCP) servers for Agentforce & AI tooling | [Salesforce-HeadLeess-MCP](https://github.com/AbdoAddouli/Salesforce-HeadLeess-MCP) | [open](https://abdoaddouli.github.io/Salesforce-HeadLeess-MCP/) |
| 7 | **Sales Cloud** | 11 | Leads & opportunities, forecasting, Sales Engagement, Einstein — for the **Sales Cloud Consultant** certification | [Salesforce-SalesCloud-RoadMap](https://github.com/AbdoAddouli/Salesforce-SalesCloud-RoadMap) | [open](https://abdoaddouli.github.io/Salesforce-SalesCloud-RoadMap/) |
| 8 | **Service Cloud** | 17 | Case management, Omni-Channel, Einstein bots, flows & knowledge — for the **Service Cloud Consultant** certification | [Salesforce-Service-Cloud-RoadMap](https://github.com/AbdoAddouli/Salesforce-Service-Cloud-RoadMap) | [open](https://abdoaddouli.github.io/Salesforce-Service-Cloud-RoadMap/) |

---

## How to use the site

### The dashboard (`#/`)
The first screen shows a card for every academy with its live progress bar, a few overall stats (units completed, quiz questions answered perfectly, estimated remaining study time) and a "Continue" button that drops you back exactly where you left off.

### Navigation & academy switcher
- The **sidebar** shows the current academy's phases; a **dropdown at the top** switches between all eight academies.
- The **top bar** has a global **search** — press `/` anywhere (or click the search box) and search across every academy. Results include phases, lessons and quizzes.

### Routes (hash-based, bookmarkable)

| Address | What you get |
|---------|--------------|
| `#/` | Dashboard |
| `#/a/<academy>` | Academy home — full phase roadmap with progress |
| `#/a/<academy>/phase/<module>` | A phase/module overview + all its lessons + Exercises & Mini Projects |
| `#/a/<academy>/lesson/<module>/<n>` | A single lesson with notes, self-check quiz and resource links |
| `#/a/<academy>/quiz/<module>` | The module's quiz with instant feedback and score |
| `#/a/<academy>/certificate` | A printer-friendly certificate reflecting your progress |

### Gated solutions
Many quizzes and exercises hide their solution until you **answer or attempt the question first** — the same behaviour as the original sites. This keeps you honest and makes studying stick.

---

## Progress, bookmarks & certificates

- **Storage:** everything is saved in your browser's `localStorage` under the key `abdo-academy-v1`. No account, no server.
- **Migration:** the original sites stored progress under their own keys (`devacademy-v1`, `scacademy-v1`, `sccacademy-v1`). On first visit, the app **reads those old keys and merges them in** — so what you already completed in the standalone sites counts here too.
- **Tools:** use **Export** (downloads your progress as a JSON file) and **Import** (restore it, e.g. on a new browser), plus a **Reset** if you want a clean sheet.
- **Per-academy certificate:** each academy home screen has a certificate you can print once you complete the phase(s).
- **Notes & bookmarks:** lessons support inline notes; you can bookmark lessons to a `#/bookmarks` list.

---

## Tech stack & architecture

**Pure static web app — no build step, no dependencies at runtime.**

```
8 source academies                          THIS REPO: Abdo-s-Salesforce-Academy
(salesforce-* RoadMap repos)               ┌──────────────────────────────────────┐
  docs/assets/curriculum.js                 │  docs/  (what GitHub Pages serves)   │
  docs/assets/answers.js                    │  ├─ index.html   (app shell)         │
  (const ACADEMY, const GUIDE)              │  ├─ assets/curricula.js  (merged     │
        │                                   │  │                  data bundle)     │
        │  build/build-data.mjs             │  ├─ assets/app.js     (router +      │
        ▼  runs locally, deterministic      │  │                  renderer + quiz  │
     ─────────────────────────►            │  │                  engine + store)  │
        │  1. sandbox-loads every           │  └─ assets/style.css  (design system)│
        │     curriculum.js / answers.js    │                                      │
        │  2. prefixes module ids by        │  .github/workflows/deploy.yml        │
        │     academy slug (no collisions)  │       ↳ validates bundle, uploads    │
        │  3. normalizes each module's      │         docs/ as a Pages artifact,   │
        │     shape into one schema         │         deploys on every push        │
        └────────────────────────  → emits docs/assets/curricula.js
```

- `docs/assets/curricula.js` — the merged data bundle for all 8 academies. **Generated by `build/build-data.mjs` — do not edit by hand.**
- `docs/assets/app.js` — the unified application (routing, rendering, quiz engine, gated exercises, progress store, search).
- `docs/assets/style.css` — design system shared by every view.
- `.github/workflows/deploy.yml` — deploys `docs/` to GitHub Pages on every push to `main`.

---

## Local development

```bash
# 1. serve the docs/ folder (pick one)
npx serve docs
python -m http.server 8000 -d docs

# 2. open
#    http://localhost:3000  (npx serve)   or   http://localhost:8000
```

### Regenerating the data bundle

Run this whenever a curriculum in one of the eight source academies changes:

```bash
node build/build-data.mjs
```

What it does:

1. Walks the **sibling folders** next to this repo (the eight academy repos).
2. Evaluates each `curriculum.js` / `answers.js` in a sandbox to read `ACADEMY` and `GUIDE`.
3. Prefixes every module id with the academy's slug (e.g. `fund` → `admin-fund`) so ids never clash — they collide between academies today.
4. Normalises the different module shapes (gated solutions, `ex`/`proj` blocks, inline answers, Data Cloud `hero` files…) into one schema.
5. Writes `docs/assets/curricula.js`, deterministically — running it twice produces the exact same bytes, so commits stay clean.

> **CI safety net:** the Pages workflow **validates the committed bundle** on every push (asks Node to parse it and confirm all **8 academies** are present), so a broken bundle can never be deployed.

---

## Deployment

GitHub Pages is configured with **Source → GitHub Actions**. The workflow:

```yaml
jobs:
  build:    # validates curricula.js, then uploads docs/ as a Pages artifact
  deploy:   # deploys that artifact (deploy-pages action)
```

Every `git push` to `main` triggers it automatically. You can also run it manually from the **Actions** tab ("Run workflow").

The live site is served at:
**https://abdoaddouli.github.io/Abdo-s-Salesforce-Academy/**

---

## Additional resources

A curated toolkit to help you study, practice, and go all the way to certification.

### Official certification pages (exam guides, cost, registration)

| Academy | Official page |
|---------|---------------|
| Administrator | https://trailhead.salesforce.com/credentials/administrator |
| Business Analyst | https://trailhead.salesforce.com/credentials/business-analyst |
| CPQ / Revenue Cloud | https://trailhead.salesforce.com/credentials/cpq-specialist |
| Data Cloud | https://trailhead.salesforce.com/credentials/data-cloud-consultant |
| Developer I | https://trailhead.salesforce.com/credentials/platform-developer-i |
| Developer II | https://trailhead.salesforce.com/credentials/platform-developer-ii |
| Sales Cloud Consultant | https://trailhead.salesforce.com/credentials/sales-cloud-consultant |
| Service Cloud Consultant | https://trailhead.salesforce.com/credentials/service-cloud-consultant |

Every one of those pages links the official **exam guide (PDF)** — read it before booking the exam.

### Learn & practice

- **Trailhead** — Salesforce's free learning platform. Complete the badges/trails that align with each roadmap: https://trailhead.salesforce.com
- **Trailhead Academy / Certification** — instructor-led classes and the official practice exams: https://trailhead.salesforce.com/en/credentials
- **Focus on Force** — the most popular third-party study guides & practice exams for Salesforce certs: https://www.focusonforce.com
- **Salesforce Ben** — free certification study guides, exam-tip blogs and practice quizzes: https://www.salesforceben.com
- **SFDC Study** — free self-paced daily study-group program for certification candidates: https://www.sfdcstudy.com
- **Salesforce Stack Exchange** — ask (or answer) real questions; exam topics often show up here: https://salesforce.stackexchange.com
- **r/salesforce** — the community subreddit, great for "how did you pass" threads: https://www.reddit.com/r/salesforce/
- **Trailblazer Community** — official forums, groups and mentorship: https://trailblazer.salesforce.com

### Documentation & reference

- **Salesforce Help** (feature docs, Setup guidance): https://help.salesforce.com
- **Salesforce Developers** (docs, platform APIs, developer guides): https://developer.salesforce.com/docs
- **Object Reference** (every standard object & its fields — a must for the admin/dev exams): https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_objects_list.htm
- **Release notes** — each quarterly release changes exam-relevant behaviour; check the newest notes before your exam: https://help.salesforce.com/s/articleView?id=release-notes.salesforce_release_notes.htm&type=5 (redirects to the current release)
- **Lightning Design System** — the CSS framework behind modern Salesforce UIs: https://www.lightningdesignsystem.com

### Headless & MCP (academy 6 — no traditional exam, but these are the core references)

- **Model Context Protocol** — the open specification itself: https://modelcontextprotocol.io
- **Salesforce official MCP repository** — connectors and samples: https://github.com/forcedotcom/MCP
- **Salesforce Developers blog** — headless architecture, APIs and Agentforce posts: https://developer.salesforce.com/blogs

### Booking & verifying an exam

- **Register / schedule** (official Salesforce exam provider): https://www.webassessor.com/salesforce
- **Verify a credential** (for employers/recruiters): https://trailhead.salesforce.com/credentials/verification

---

## License

Copyright © AbdoAddouli. Personal education project — study content credits go to each source academy repo linked in the table above, plus the external resources listed here. Not affiliated with or endorsed by Salesforce.