# TraceFork — Firebase & GitHub Setup

## Prerequisites

- Firebase project: **`tracefork-3f5ac`** (Spark plan)
- Firebase CLI installed: `firebase --version`
- Git + GitHub account

---

## Part 1 — Firebase

### Step 1: Enable Firestore

1. [Firebase Console](https://console.firebase.google.com/project/tracefork-3f5ac) → **Build** → **Firestore Database**
2. **Create database**
3. Mode: **Production mode** (rules are deployed from this repo)
4. Region: **`europe-west1`** or the nearest available region (e.g. `me-central1` if available)

### Step 2: Service Account (for Python seed / backend)

1. [Project Settings](https://console.firebase.google.com/project/tracefork-3f5ac/settings/serviceaccounts/adminsdk) → **Service accounts**
2. **Generate new private key** → download JSON
3. Save the file as: `tracefork/service-account.json`
4. **Never** commit this file (it is listed in `.gitignore`)

### Step 3: Web App (for Phase 3 UI)

1. Project Overview → **Add app** → **Web** (`</>`)
2. App nickname: `TraceFork Dashboard`
3. Copy the Firebase SDK config (for frontend `.env`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=tracefork-3f5ac.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tracefork-3f5ac
VITE_FIREBASE_STORAGE_BUCKET=tracefork-3f5ac.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Step 4: Local `.env` (Python)

```bash
cd tracefork
copy .env.example .env
```

`.env` contents:

```env
GEMINI_API_KEY=your_gemini_key_from_aistudio

USE_FIRESTORE_EMULATOR=false
GOOGLE_CLOUD_PROJECT=tracefork-3f5ac
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Comment out or remove the emulator line:
# FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

### Step 5: Login and select project

```bash
cd tracefork
firebase login
firebase use tracefork-3f5ac
```

### Step 6: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Step 7: Seed test database

```bash
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed_firestore.py
```

### Step 8: Verify

```bash
python scripts/run_scenario.py --all --source firestore
```

In Console → Firestore → collections: `nodes`, `products`, `batches`, `shipments`, `demo_scenarios`

---

## Part 2 — GitHub

### Step 1: Create Repository

1. [github.com/new](https://github.com/new)
2. Name: `tracefork` (or `TraceFork-Kaggle-Capstone`)
3. **Public** (required for capstone)
4. No initial README (we already have a local repo)

### Step 2: Init and Push

```bash
cd C:\YallaYum\Kaggle\tracefork
git init
git add .
git status
# Make sure .env and service-account.json are not listed
git commit -m "Phase 1: TraceFork foundation — Firestore schema, seed data, domain logic"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tracefork.git
git push -u origin main
```

### Step 3: Sensitive files — never push

| File | Reason |
|------|--------|
| `.env` | API keys |
| `service-account.json` | Admin access |
| `.venv/` | Virtual environment |

### Step 4 (optional): GitHub Secret for CI

Settings → Secrets → `GOOGLE_APPLICATION_CREDENTIALS_JSON` (JSON contents)

---

## Part 3 — Link Firebase ↔ GitHub (optional)

For automated Hosting deploy (Phase 3):

1. Firebase Console → **Build** → **Hosting** → Get started
2. GitHub → repo → Actions → Firebase deploy workflow
3. Or manually: `firebase deploy --only hosting`

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Permission denied` on seed | Valid service account JSON + Firestore enabled |
| `Project not found` | `firebase use tracefork-3f5ac` |
| Emulator Java error | `USE_FIRESTORE_EMULATOR=false` for production |
| Rules block write | seed with Admin SDK is OK; client is read-only |
