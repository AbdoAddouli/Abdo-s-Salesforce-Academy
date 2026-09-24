# Abdo's Salesforce Academy

All **eight** Salesforce certification and concept roadmaps in one interactive studio.

| # | Academy | Phases | Source repo | Live site |
|---|---------|-------:|-------------|-----------|
| 1 | Salesforce Administrator | 14 | [Salesforce_Administrator_RoadMap](https://github.com/AbdoAddouli/Salesforce_Administrator_RoadMap) | [open](https://abdoaddouli.github.io/Salesforce_Administrator_RoadMap/) |
| 2 | Salesforce Business Analyst | 17 | [Salesforce-Business-Analyst-Roadmap](https://github.com/AbdoAddouli/Salesforce-Business-Analyst-Roadmap) | [open](https://abdoaddouli.github.io/Salesforce-Business-Analyst-Roadmap/) |
| 3 | CPQ & Revenue Cloud | 17 | [Salesforce-CPQ-Revenue-Cloud-Roadmap](https://github.com/AbdoAddouli/Salesforce-CPQ-Revenue-Cloud-Roadmap) | [open](https://abdoaddouli.github.io/Salesforce-CPQ-Revenue-Cloud-Roadmap/) |
| 4 | Data Cloud 360 | 18 | [Salesforce-Data-cloud-360-RoadMap](https://github.com/AbdoAddouli/Salesforce-Data-cloud-360-RoadMap) | [open](https://abdoaddouli.github.io/Salesforce-Data-cloud-360-RoadMap/) |
| 5 | Developer I & II | 17 | [Salesforce-Dev-I-II-Roadmap](https://github.com/AbdoAddouli/Salesforce-Dev-I-II-Roadmap) | [open](https://abdoaddouli.github.io/Salesforce-Dev-I-II-Roadmap/) |
| 6 | Headless & MCP | 16 | [Salesforce-HeadLeess-MCP](https://github.com/AbdoAddouli/Salesforce-HeadLeess-MCP) | [open](https://abdoaddouli.github.io/Salesforce-HeadLeess-MCP/) |
| 7 | Sales Cloud | 11 | [Salesforce-SalesCloud-RoadMap](https://github.com/AbdoAddouli/Salesforce-SalesCloud-RoadMap) | [open](https://abdoaddouli.github.io/Salesforce-SalesCloud-RoadMap/) |
| 8 | Service Cloud | 17 | [Salesforce-Service-Cloud-RoadMap](https://github.com/AbdoAddouli/Salesforce-Service-Cloud-RoadMap) | [open](https://abdoaddouli.github.io/Salesforce-Service-Cloud-RoadMap/) |

## Features

- **Academy dashboard** — every roadmap in one view with live progress per academy.
- **Unified search** (press `/`) — find any lesson, quiz, challenge or concept across all eight academies.
- **Phase-by-phase journey** — roadmap modules, lessons, quizzes, guide pages and certificates.
- **Gated solutions** — lesson/quiz solutions and module exercises (Admin-style `Exercises & Mini Projects`) unlock only when you answer first, just like the standalone sites.
- **Progress tracking** — saved to `localStorage` (`abdo-academy-v1`), with export/import/reset tools. Progress from the standalone sites (`devacademy-v1`, `scacademy-v1`, `sccacademy-v1`) is migrated automatically on first visit.
- **Dark / light theme** (remembered), scroll-progress bar, and a printer-friendly certificate view.

## Tech

- Pure static site — **no build step, no dependencies**. Data lives in `docs/assets/curricula.js`.
- Deployed to GitHub Pages from the `docs/` folder (see `.github/workflows/deploy.yml`).

## Local development

```bash
# serve the docs/ folder
npx serve docs
# or
python -m http.server 8000 -d docs
```

Open http://localhost:3000.

### Regenerating the data bundle

`docs/assets/curricula.js` is generated from the eight source academies (each a
Salesforce DX project whose `docs/assets/curriculum.js` declares `const GUIDE`
and `const ACADEMY`). To rebuild after a curriculum changes:

```bash
node build/build-data.mjs
```

The script walks the sibling folders next to this repo, evaluates each
`curriculum.js`/`answers.js`, prefixes module ids with the academy slug (ids
collide between academies) and emits the aggregated bundle.

## Repo layout

```
docs/                       # built site (published to GitHub Pages)
  index.html                # app shell
  assets/
    curricula.js            # GENERATED — aggregated data for all 8 academies
    app.js                  # the unified app
    style.css               # shared styles
build/
  build-data.mjs            # generator for curricula.js
.github/workflows/deploy.yml # Pages deployment
```

## License

Copyright © AbdoAddouli. Personal education project — content credits to each
source academy repo linked above.