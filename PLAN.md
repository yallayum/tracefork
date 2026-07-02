# TraceFork — پلن ۳ فازی (Firebase Hybrid)

<div dir="rtl">

پروژه Capstone Kaggle — رهگیری batch غذایی، recall simulation، cold chain و compliance روی **Firestore**.

---

## معماری کلی

```
ADK Agents + MCP (Python, Local)
        │
        ▼
Firestore (Emulator / Production)
        │
        ▼
UI Dashboard (فاز ۳ — Streamlit یا Hosting)
```

---

## فاز ۱ — Foundation & Data Layer ✅ (در حال اجرا)

**هدف:** دیتا و منطق هسته بدون agent — قابل تست و demo

| Deliverable | توضیح |
|-------------|--------|
| Firebase config | `firebase.json`, rules, indexes, emulator |
| Firestore schema | nodes, products, batches, events, shipments, recalls, scenarios |
| Seed data | ۳ batch (happy / cold chain / incomplete) |
| `seed_firestore.py` | idempotent seed + hash chain |
| Python domain layer | trace, compliance, cold chain, recall, integrity |
| Scenario runner | ۵ سناریو YAML + `run_scenario.py` |
| Unit tests | pytest بدون emulator (domain) + integration (emulator) |

**خروجی فاز ۱:**
```bash
firebase emulators:start --only firestore
python scripts/seed_firestore.py
python scripts/run_scenario.py --all
pytest
```

---

## فاز ۲ — Agents & MCP

**هدف:** Google ADK multi-agent + MCP tools روی Firestore

| Deliverable | توضیح |
|-------------|--------|
| MCP Server | ۱۲ tool متصل به repository |
| ۵ ADK Agent | Orchestrator, Intake, Trace, ColdChain, Recall, Report |
| Human-in-the-loop | gate برای recall CRITICAL |
| Security | grounded answers, refusal, prompt guards |
| CLI | `tracefork trace LOT-xxx` |

**خروجی فاز ۲:** agent end-to-end با Gemini API

---

## فاز ۳ — UI, Eval & Submission

**هدف:** demo آماده judges + Kaggle submit

| Deliverable | توضیح |
|-------------|--------|
| Streamlit dashboard | trace map, recall sim, scenario runner, export |
| Eval suite | ۶/۶ scenarios automated |
| Docs | README, ARCHITECTURE, DEMO.md |
| Assets | diagrams, cover image |
| Optional | Firebase Hosting / HF Spaces |
| Video script | ۵ دقیقه YouTube |

**خروجی فاز ۳:** GitHub public + Kaggle writeup

---

## Timeline (تا ۶ July 2026)

| روز | فاز |
|-----|-----|
| ۱–۲ | فاز ۱ |
| ۳–۴ | فاز ۲ |
| ۵–۶ | فاز ۳ + submit |

</div>
