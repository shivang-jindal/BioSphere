# 🌿 BIOSPHERE — The Living Planet Simulator

> **A real-time biosphere simulator. Every tracked species, every migration, every birth and death, every predator-prey dance, every extinction risk. The planet's pulse in your hands.**

---

## 🌿 The Vision

**BioSphere** is a **real-time living planet simulator** — a photorealistic 3D globe showing Earth's *living layer* in real-time. Not a species map — a **living biosphere simulator** showing every tracked organism, every ecological relationship, every planetary heartbeat.

See everything:
- **🦜 Species migrations** — 10,000+ tracked species (birds, mammals, marine, terrestrial), real-time GPS/satellite/acoustic
- **🌊 Population dynamics** — Real-time abundance estimates, breeding success, mortality, carrying capacity
- **🦁 Predator-prey** — Real-time food webs, trophic cascades, keystone species impacts
- **🌲 Ecosystem health** — NDVI/EVI, biomass, productivity, fragmentation, connectivity
- **🌡️ Climate impacts** — Range shifts, phenology mismatches, thermal limits, refugia
- **🚨 Extinction risk** — IUCN Red List live, population viability analysis, extinction debt
- **🛤️ Migration corridors** — Flyways, swimways, terrestrial corridors, bottlenecks, barriers
- **🔊 Acoustic monitoring** — Bioacoustics (BirdNET, FrogID), passive acoustic monitoring
- **🛰️ Satellite tracking** — GPS/Argos/ICARUS collars, tags, biologgers
- **🧬 eDNA** — Environmental DNA from water/soil/air, species detection

---

## 🎮 The Experience

### The Globe View (CesiumJS + Custom Shaders)
A **photorealistic 3D globe** where life *is* the terrain:
- **Species density** — glowing particle fields, color = taxonomic group, density = abundance
- **Migration flows** — animated great-circle arcs, seasonal pulses, stopover sites glowing
- **Population heatmaps** — kernel density, time-series animation, trend arrows
- **Ecosystem health** — NDVI/EVI time series, productivity, fragmentation, connectivity
- **Range shifts** — animated range polygons, leading/trailing edges, velocity vectors
- **Extinction risk** — IUCN categories pulsing, population viability analysis (PVA) trajectories
- **Migration corridors** — flyways/swimways/corridors, bottlenecks, barriers, protection gaps
- **Acoustic clouds** — bioacoustic activity clouds, species ID confidence, phenology

### The Species Explorer
Click any species → **Species Inspector**:
- **Distribution** — current range (breeding/non-breeding/migration), historical, projected
- **Population** — global estimate, trends (increasing/decreasing/stable/unknown), subpopulations
- **Demographics** — age structure, sex ratio, survival rates, fecundity, generation time
- **Migration** — timing, routes, stopovers, wintering/breeding grounds, fidelity
- **Ecology** — diet, foraging, habitat, nesting, social structure, predators, competitors
- **Threats** — IUCN threats classification, severity, scope, timing
- **Conservation** — protected area coverage, actions needed, funding gaps, success stories
- **Genetics** — population structure, genetic diversity, inbreeding, adaptive potential
- **Tracking** — live tracks (if tagged), historical tracks, home ranges, utilization distributions

### The Ecosystem Dashboard
Click any region → **Ecosystem Inspector**:
- **Biodiversity** — species richness, endemism, phylogenetic diversity, functional diversity
- **Productivity** — GPP/NPP, carbon sequestration, biomass, phenology
- **Health** — fragmentation, connectivity, edge effects, degradation, restoration potential
- **Climate** — velocity of climate change, refugia, exposure, adaptive capacity
- **Human footprint** — HFP, fragmentation, pollution, overexploitation, invasive species
- **Protection** — PA coverage, OECMs, connectivity, management effectiveness, funding

### The Migration Theater
**Real-time migration visualization:**
- **Flyways** — 9 major flyways, animated particle flows, stopover networks
- **Swimways** — marine migrations (tuna, sharks, whales, turtles, salmon)
- **Terrestrial corridors** — wildebeest, caribou, elephants, altitudinal migrants
- **Stopover networks** — critical sites, capacity, threats, protection status
- **Barriers** — fences, roads, dams, urban areas, wind farms, light pollution

### The Extinction Watch
**Real-time extinction risk monitoring:**
- **IUCN Red List live** — category changes, new assessments, reassessments
- **Population Viability Analysis (PVA)** — stochastic projections, extinction probability
- **Extinction debt** — committed extinctions, relaxation time, habitat loss lag
- **EDGE species** — Evolutionarily Distinct and Globally Endangered
- **Functional extinction** — ecological role loss before numerical extinction
- **De-extinction candidates** — feasibility, ecological role, ethical framework

### The Food Web Visualizer
**Interactive food webs:**
- **Trophic networks** — nodes = species/functional groups, edges = consumption
- **Trophic cascades** — keystone species removal/addition, cascade simulation
- **Energy flow** — biomass/energy transfer efficiencies, trophic levels
- **Keystone identification** — centrality metrics, interaction strength, redundancy

---

## 🛰️ Data Sources (All Open / Free Tier)

| Domain | Sources | Frequency | Auth |
|--------|---------|-----------|------|
| **Occurrences** | GBIF (2B+ records), iNaturalist (150M+), eBird (1B+), ALA | Real-time | 🟢 |
| **Tracking** | Movebank (10k+ studies), Argos, ICARUS, Motus, OTN | Real-time | 🟢 |
| **Acoustic** | BirdNET, FrogID, RFCx, PAMGuide, OpenSoundscape | Real-time | 🟢 |
| **Satellite** | Landsat, Sentinel-2, Planet, MODIS, VIIRS, GEDI, ICESat-2 | Daily | 🟢 |
| **eDNA** | OBIS, GenBank, BOLD, regional portals | Monthly | 🟢 |
| **IUCN Red List** | IUCN API, SIS, Red List Index | Quarterly | 🟢 |
| **Protected Areas** | WDPA, WD-OECM, UNEP-WCMC | Monthly | 🟢 |
| **Climate** | WorldClim, CHELSA, CMIP6, ERA5, PRISM | Monthly | 🟢 |
| **Land Cover** | ESA CCI, GLAD, Dynamic World, ESA WorldCover | Annual | 🟢 |
| **Human Footprint** | HFP, HII, GHSL, WSF, night lights | Annual | 🟢 |

---

## 🧠 The Intelligence Layer

### Population Modeling
- **IPMs/IBMs** — Integral Projection Models, Individual-Based Models
- **State-space models** — N-mixture, distance sampling, capture-recapture
- **IPMs + Climate** — climate-driven vital rates, range projections

### Connectivity Analysis
- **Circuit theory** — Circuitscape, Omniscape, resistance surfaces
- **Graph theory** — centrality, connectivity, modularity, corridors
- **Circuit theory + Climate** — climate-wise connectivity, climate corridors

### Extinction Risk
- **PVA** — Vortex, RAMAS, custom stochastic models
- **Red List automation** — criteria automation, uncertainty propagation
- **EDGE/EDGE2** — phylogenetic diversity + extinction risk

### Climate Vulnerability
- **Velocity of climate change** — spatial/temporal gradients
- **Refugia identification** — microrefugia, macrorefugia, connectivity
- **Assisted migration** — candidate identification, risk assessment

---

## 🎮 The Interface

### Globe View (CesiumJS + Custom Shaders)
- **Photorealistic 3D globe** — Cesium ion / Google Photorealistic 3D Tiles
- **Life shaders** — particle systems for species, migrations, acoustic clouds
- **Time** — real-time, seasonal, annual, decadal, geological, future projections
- **Layers** — species, migrations, populations, ecosystems, climate, threats

### Species Explorer
- **Taxonomic browser** — tree of life, search, filter (taxon, status, region)
- **Species profiles** — distribution, population, ecology, threats, conservation
- **Comparison tool** — side-by-side species comparisons

### Ecosystem Dashboard
- **Regional summaries** — biodiversity, productivity, health, threats, protection
- **Trend analysis** — time series, breakpoints, attribution
- **Scenario planning** — climate, land use, policy scenarios

### Migration Theater
- **Animated migrations** — particle flows, stopovers, timing, bottlenecks
- **Corridor planner** — corridor design, barrier removal, restoration priorities

### Extinction Watch
- **Red List monitor** — category changes, new assessments, alerts
- **PVA engine** — stochastic projections, sensitivity analysis
- **EDGE watchlist** — phylogenetic priority species

### AI Ecologist
- **Natural language queries** → "Show me all migratory birds crossing the Sahara in October"
- **Conservation planning** → "Design a corridor network for jaguars in the Amazon"
- **Impact assessment** → "What's the impact of this highway on jaguar connectivity?"
- **Climate adaptation** → "Where should we establish climate refugia for corals?"

---

## 🏗️ Architecture

```
BioSphere/
├── client/                    # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # Globe, Panels, Inspectors, Theater
│   │   ├── layers/            # Species, Migrations, Populations, Ecosystems
│   │   ├── shaders/           # Particle systems, migration arcs, acoustic clouds
│   │   ├── models/            # Population models, PVA, connectivity
│   │   └── ai/                # AI ecologist, PVA engine
├── server/                    # FastAPI + Python (scientific stack)
│   ├── gbif/                  # GBIF/iNaturalist/eBird ingestion
│   ├── tracking/              # Movebank/Argos/ICARUS/MOTUS ingestion
│   ├── acoustic/              # BirdNET/FrogID/RFCx ingestion
│   ├── satellite/             # Sentinel/Landsat/Planet processing
│   ├── models/                # Population models, PVA, connectivity
│   ├── iucn/                  # Red List API, SIS integration
│   ├── climate/               # Climate data, velocity, refugia
│   └── auth/                  # Auth, quotas, billing
├── data-pipeline/             # Dagster/Airflow
│   ├── ingestion/             # GBIF, iNaturalist, eBird, Movebank, eBird
│   ├── processing/            # Species distribution models, SDMs
│   ├── modeling/              # Population models, PVA, connectivity
│   └── publishing/            # Vector tiles, STAC, API
├── ml/                        # ML models
│   ├── sdm/                   # Species Distribution Models (MaxEnt, BRT, RF, GAM)
│   ├── movement/              # Movement models (CTCRW, HMM, state-space)
│   ├── population/            # Population models (IPM, IBM, PVA)
│   └── connectivity/          # Connectivity (Circuitscape, graph theory)
└── infra/                     # Terraform
    ├── k8s/                   # EKS/GKE (inference, APIs)
    ├── database/              # Postgres/PostGIS, TimescaleDB, Neo4j
    └── monitoring/            # Prometheus, Grafana, Sentry
```

---

## 💰 Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Naturalist** | Free | Globe, 10 species/day, 5 range maps, 10 alerts |
| **Ecologist** | $79/mo | Unlimited species, unlimited ranges, PVA, exports, API |
| **Conservation** | $299/mo | 5 seats, collaboration, custom PVA, corridor planning, API |
| **Institution** | Custom | SSO, on-prem, custom models, dedicated support, SLA |

---

## 🚀 Roadmap

| Phase | Milestone | Target |
|-------|-----------|--------|
| **v0.1** | Globe + GBIF/eBird/Movebank ingestion + species explorer | Q1 2025 |
| **v0.2** | Migration theater + population trends + range maps | Q2 2025 |
| **v0.3** | Ecosystem dashboard + PVA engine + extinction watch | Q3 2025 |
| **v1.0** | AI ecologist + corridor planner + climate scenarios + API | Q1 2026 |
| **v1.5** | Food web visualizer + climate corridors + assisted migration | Q3 2026 |
| **v2.0** | Genomic integration, acoustic AI, real-time bioacoustics | Q1 2027 |

---

## 🎯 Why This Wins

1. **First Living Biosphere Simulator** — No one has a *photorealistic 3D globe* of Earth's living layer
2. **Real-Time + Historical** — Live tracking + 100-yr museum records + predictive
2. **Extinction Watch** — First *real-time* extinction risk monitor with PVA
3. **Migration Theater** — First *visual* migration theater with corridor planning
4. **Viral** — "Watch the monarch migration in 3D" → conservation social explosion
5. **Enterprise TAM** — Conservation NGOs, gov agencies, research institutes, ecotourism, carbon markets, insurance, supply chain
6. **Moat** — Multi-source bioinformatics pipeline + movement ecology + 3D globe = massive moat

---

## 📜 License

MIT — Open source core, commercial SaaS on top.

---

*"The planet is alive. BioSphere lets you feel its heartbeat."*