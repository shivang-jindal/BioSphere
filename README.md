# BioSphere

> **Conservation research workbench for searching georeferenced GBIF occurrence records.**

[![CI](https://github.com/shivang-jindal/BioSphere/actions/workflows/ci.yml/badge.svg)](https://github.com/shivang-jindal/BioSphere/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4-lightgrey)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff)](https://vite.dev/)

---

## What it is

BioSphere is a deterministic living-planet simulator you can browse, compare,
and stress-test. Every species is a pure function of its seed: range,
population, habitat health, genetic diversity, migration, and extinction risk
all derive from the same 32-bit value. Share the seed and anyone reconstructs
the same biosphere.

The repository is a complete open-source product:

- **Client** — React 18, Vite 6, TypeScript, Tailwind v4, React Router, TanStack Query
- **Server** — Express 4, Zod-validated API, structured logging, security middleware
- **Shared** — one Zod schema and constant catalogue for runtime and types
- **Engine** — pure functions, no database required, fully reproducible

## Conservation field plans

BioSphere supports scenario comparison for conservation planning. Create a named field plan with a seed and assumptions, run habitat or climate interventions under that seed, and retain/export the modeled report. The bundled species catalogue and simulated outcomes are illustrative; they are not current field observations, population estimates, or conservation recommendations validated by ecologists. Studies are stored in `.data/workspaces.json` (override with `WORKSPACE_FILE`) on the server installation. This file is single-installation storage, not accounts or cloud collaboration.

---

## Current implementation and limits

The GBIF Observations workflow resolves a scientific name and searches up to 100 coordinate-bearing occurrence records in a supplied bounding box and optional year range. Results retain record dates, coordinates, basis of record, dataset identifiers, and source/citation links. GBIF occurrences are records of reported observations, not a census, abundance estimate, or evidence of absence. Sampling effort, taxonomic coverage, and georeferencing vary. The bundled species atlas and intervention simulations are illustrative, not current field data or validated conservation recommendations.

Some sections below describe the original product vision and aspirational capabilities. They are not a claim that those functions are implemented. See [SPEC.md](SPEC.md) for the vision and this section for present behavior.

## Features

### Living atlas
1. **Species catalogue** — 14 tracked populations spanning mammals, birds, marine life, reptiles, amphibians, insects, and plants.
2. **Search and filters** — by free text, taxon, biogeographic region, and conservation status.
3. **Risk ranking** — deterministic risk score derived from status and seed.
4. **Species dossier** — summary, six ecological metrics, a 12-point history, and related species.
5. **Portfolio analytics** — totals by status and taxon, average risk, top five at-risk species.
6. **Shareable views** — encode the current species and filters into a URL-safe token.

### Deterministic ecology
7. **Seeded PRNG** — FNV-1a seed derivation plus Mulberry32, identical on every platform.
8. **Taxonomic breadth** — mammals, birds, marine species, reptiles, amphibians, insects, and plants.
9. **Conservation model** — thriving, vulnerable, and endangered populations with distinct risk behaviour.
10. **History series** — a comparable 12-period habitat-health trend per species.
11. **Related-species graph** — taxonomic neighbours plus cross-taxon discovery.
12. **Seed explanation** — the assistant describes exactly how the seed propagates.

### Simulation lab
13. **Six ecological scenarios** — habitat loss, climate shift, invasive species, poaching surge, corridor restore, and rewilding.
14. **Intensity and horizon controls** — 0–1 intensity over 1–72 simulated hours.
15. **Impact scoring** — severity-weighted, bounded 0–100.
16. **Timeline projection** — habitat availability, pressure, and risk at seven checkpoints.
17. **Cascade analysis** — affected species with per-taxon severity.
18. **Actionable recommendations** — three field-ready steps per scenario.

### Assistant and integrations
19. **Intent-aware field ecologist** — focuses species, opens pages, and queues simulations from natural language.
20. **Structured API** — every capability is available headlessly under `/api/v1`.

---

## Quick start

Prerequisites: **Node 20.11+**, **npm 10+**.

```bash
git clone https://github.com/shivang-jindal/BioSphere.git
cd BioSphere
npm install
npm run dev
```

- Web: <http://localhost:5173>
- API: <http://localhost:4000/health>

Copy `.env.example` to `.env` to change ports, CORS origins, or logging.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | API + web with prefixed output |
| `npm run dev:server` | API only (tsx watch) |
| `npm run dev:client` | Vite dev server only |
| `npm run typecheck` | Shared build, then server and client type-checks |
| `npm run lint` | ESLint over the whole workspace |
| `npm test` | Vitest unit + integration suite |
| `npm run build` | Production build for shared, server, and client |
| `npm run verify` | The full gate: typecheck → lint → test → build |
| `npm run smoke` | Post-deployment smoke test against a running API |

---

## API

All endpoints are under `/api/v1` and validate input with Zod.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness/uptime probe |
| `GET` | `/api/v1/version` | Service name and API version |
| `GET` | `/api/v1/capabilities` | Categories, regions, metrics, actions |
| `GET` | `/api/v1/catalog` | Search and filter species |
| `GET` | `/api/v1/catalog/:id` | Detail with history and related species |
| `GET` | `/api/v1/analytics/summary` | Portfolio analytics |
| `POST` | `/api/v1/simulate` | Run a deterministic intervention |
| `POST` | `/api/v1/ai/chat` | Field-ecologist reply plus actions |
| `POST` | `/api/v1/share-links` | Encode a shareable view |
| `GET` | `/api/v1/share-links/:token` | Decode a shareable view |

Validation failures return `400` with a machine-readable `issues` array.
Unknown routes return a structured `404`, and unexpected failures never leak
internals.

---

## Architecture

```
BioSphere/
├── client/                 # React 18 + Vite 6 + Tailwind v4
│   └── src/
│       ├── components/     # shell, living globe, sparkline, toasts
│       ├── pages/          # overview, atlas, simulator, ecologist, settings
│       └── store/          # Zustand filters and selection
├── server/
│   └── src/
│       ├── domain/engine.ts  # deterministic ecology + simulation
│       ├── http/             # routes and middleware
│       └── app.ts            # testable Express factory
├── shared/                 # Zod schemas, catalogue, derived types
└── scripts/                # dev launcher, verify pipeline, smoke test
```

`createApp({ config, logger })` keeps the HTTP layer testable without binding a
port; the engine has no I/O and can be imported anywhere.

---

## Testing

The suite covers deterministic generation, filtering, pagination, risk scoring,
simulation bounds, share-link round-trips, assistant intents, validation, and
every public endpoint:

```bash
npm test
```

---

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and
the [Code of Conduct](CODE_OF_CONDUCT.md). Security reports go through
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Shivang Jindal
