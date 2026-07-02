# TraceFork

**Food batch traceability + recall simulation** — Kaggle Capstone (Firebase + Gemini Agents)

**Live Demo:** https://tracefork-3f5ac.web.app

## Quick Start

### 1. Setup Python

```bash
cd tracefork
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

### 2. Firestore Emulator

```bash
firebase emulators:start --only firestore
```

Emulator UI: http://127.0.0.1:4000/firestore

### 3. Seed database

```bash
python scripts/seed_firestore.py
```

### 4. Run demo scenarios

```bash
# Offline (seed JSON — no emulator needed)
python scripts/run_scenario.py --all

# Against Firestore emulator
python scripts/run_scenario.py --all --source firestore
```

### 5. Tests

```bash
pytest
```

## Demo Batches

| Lot | Scenario |
|-----|----------|
| `LOT-2026-0421` | Happy trace + recall (yogurt, UAE) |
| `LOT-2026-0315` | Cold chain violation (labneh, Jordan→KSA) |
| `LOT-2026-0199` | Incomplete trace (compote, Turkey) |

## Run Dashboard (Phase 2+3)

**Terminal 1 — API:**
```bash
python -m api.server
```

**Terminal 2 — Web UI:**
```bash
cd web-app && npm run dev
```

Open http://localhost:5173

Or use `scripts\start-dev.bat` (Windows).

**Deploy UI to Firebase Hosting:**
```bash
cd web-app && npm run build
firebase deploy --only hosting
```

> API runs locally for demo; judges use `python scripts/run_scenario.py --all --source firestore`

## CLI & Agent

```bash
python -m tracefork.cli trace LOT-2026-0421
python -m tracefork.cli recall LOT-2026-0421 --at-node dubai_plant --reason "listeria"
python -m tracefork.cli agent "Trace LOT-2026-0421 and summarize compliance"
python -m tracefork.cli demo
```

## Project Phases

See [PLAN.md](./PLAN.md):

- **Phase 1** ✅ Foundation — Firestore, seed, domain logic, scenarios
- **Phase 2** ✅ Agents + MCP + API + CLI
- **Phase 3** ✅ React UI (web-app/) — YouTube + Writeup pending

## Firestore Collections

```
nodes/{id}
products/{id}
batches/{lotNumber}
batches/{lotNumber}/events/{eventId}
shipments/{id}
demo_scenarios/{lotNumber}
```

## Connect to Production Firebase

Set in `.env`:

```
USE_FIRESTORE_EMULATOR=false
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

Then run `python scripts/seed_firestore.py`.

---

> TraceFork is an assistant — not a replacement for ERP, official inspectors, or authority notifications.
