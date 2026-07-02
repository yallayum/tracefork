# TraceFork — 3-Phase Plan (Firebase Hybrid)

Kaggle Capstone project — food batch traceability, recall simulation, cold chain, and compliance on **Firestore**.

---

## Architecture Overview

```
ADK Agents + MCP (Python, Local)
        │
        ▼
Firestore (Emulator / Production)
        │
        ▼
UI Dashboard (Phase 3 — Streamlit or Hosting)
```

---

## Phase 1 — Foundation & Data Layer ✅

**Goal:** Core data and domain logic without agents — testable and demo-ready

| Deliverable | Description |
|-------------|-------------|
| Firebase config | `firebase.json`, rules, indexes, emulator |
| Firestore schema | nodes, products, batches, events, shipments, recalls, scenarios |
| Seed data | 3 batches (happy / cold chain / incomplete) |
| `seed_firestore.py` | idempotent seed + hash chain |
| Python domain layer | trace, compliance, cold chain, recall, integrity |
| Scenario runner | 5 YAML scenarios + `run_scenario.py` |
| Unit tests | pytest without emulator (domain) + integration (emulator) |

**Phase 1 output:**
```bash
firebase emulators:start --only firestore
python scripts/seed_firestore.py
python scripts/run_scenario.py --all
pytest
```

---

## Phase 2 — Agents & MCP

**Goal:** Google ADK multi-agent + MCP tools on Firestore

| Deliverable | Description |
|-------------|-------------|
| MCP Server | 12 tools connected to repository |
| 5 ADK Agents | Orchestrator, Intake, Trace, ColdChain, Recall, Report |
| Human-in-the-loop | gate for CRITICAL recall |
| Security | grounded answers, refusal, prompt guards |
| CLI | `tracefork trace LOT-xxx` |

**Phase 2 output:** agent end-to-end with Gemini API

---

## Phase 3 — UI, Eval & Submission

**Goal:** judge-ready demo + Kaggle submit

| Deliverable | Description |
|-------------|-------------|
| Streamlit dashboard | trace map, recall sim, scenario runner, export |
| Eval suite | 6/6 scenarios automated |
| Docs | README, ARCHITECTURE, DEMO.md |
| Assets | diagrams, cover image |
| Optional | Firebase Hosting / HF Spaces |
| Video script | 5-minute YouTube |

**Phase 3 output:** public GitHub + Kaggle writeup

---

## Timeline (through July 6, 2026)

| Days | Phase |
|------|-------|
| 1–2 | Phase 1 |
| 3–4 | Phase 2 |
| 5–6 | Phase 3 + submit |
