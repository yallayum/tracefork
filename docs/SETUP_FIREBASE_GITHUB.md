# TraceFork — اتصال Firebase و GitHub

<div dir="rtl">

## پیش‌نیاز

- پروژه Firebase: **`tracefork-3f5ac`** (Spark plan)
- Firebase CLI نصب: `firebase --version`
- Git + حساب GitHub

---

## بخش ۱ — Firebase

### گام ۱: فعال‌سازی Firestore

1. [Firebase Console](https://console.firebase.google.com/project/tracefork-3f5ac) → **Build** → **Firestore Database**
2. **Create database**
3. حالت: **Production mode** (rules را از repo deploy می‌کنیم)
4. Region: **`europe-west1`** یا نزدیک‌ترین منطقه (مثلاً `me-central1` اگر در دسترس بود)

### گام ۲: Service Account (برای Python seed / backend)

1. [Project Settings](https://console.firebase.google.com/project/tracefork-3f5ac/settings/serviceaccounts/adminsdk) → **Service accounts**
2. **Generate new private key** → JSON دانلود
3. فایل را ذخیره کن: `tracefork/service-account.json`
4. **هرگز** این فایل را commit نکن (در `.gitignore` است)

### گام ۳: Web App (برای UI فاز ۳)

1. Project Overview → **Add app** → **Web** (`</>`)
2. App nickname: `TraceFork Dashboard`
3. Firebase SDK config را کپی کن (برای `.env` فرانت‌اند):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=tracefork-3f5ac.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tracefork-3f5ac
VITE_FIREBASE_STORAGE_BUCKET=tracefork-3f5ac.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### گام ۴: تنظیم `.env` محلی (Python)

```bash
cd tracefork
copy .env.example .env
```

محتوای `.env`:

```env
GEMINI_API_KEY=your_gemini_key_from_aistudio

USE_FIRESTORE_EMULATOR=false
GOOGLE_CLOUD_PROJECT=tracefork-3f5ac
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# خط emulator را comment کن یا حذف کن:
# FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

### گام ۵: Login و انتخاب پروژه

```bash
cd tracefork
firebase login
firebase use tracefork-3f5ac
```

### گام ۶: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### گام ۷: Seed دیتابیس تست

```bash
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed_firestore.py
```

### گام ۸: تأیید

```bash
python scripts/run_scenario.py --all --source firestore
```

در Console → Firestore → collections: `nodes`, `products`, `batches`, `shipments`, `demo_scenarios`

---

## بخش ۲ — GitHub

### گام ۱: ساخت Repository

1. [github.com/new](https://github.com/new)
2. Name: `tracefork` (یا `TraceFork-Kaggle-Capstone`)
3. **Public** (الزami capstone)
4. بدون README اولیه (repo محلی داریم)

### گام ۲: Init و Push

```bash
cd C:\YallaYum\Kaggle\tracefork
git init
git add .
git status
# مطمئن شو .env و service-account.json در status نیستند
git commit -m "Phase 1: TraceFork foundation — Firestore schema, seed data, domain logic"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tracefork.git
git push -u origin main
```

### گام ۳: فایل‌های حساس — هرگز push نشوند

| فایل | دلیل |
|------|------|
| `.env` | API keys |
| `service-account.json` | دسترسی admin |
| `.venv/` | محیط مجازی |

### گام ۴ (اختیاری): GitHub Secret برای CI

Settings → Secrets → `GOOGLE_APPLICATION_CREDENTIALS_JSON` (محتوای JSON)

---

## بخش ۳ — لینک Firebase ↔ GitHub (اختیاری)

برای deploy خودکار Hosting (فاز ۳):

1. Firebase Console → **Build** → **Hosting** → Get started
2. GitHub → repo → Actions → Firebase deploy workflow
3. یا دستی: `firebase deploy --only hosting`

---

## Troubleshooting

| خطا | راه‌حل |
|-----|--------|
| `Permission denied` on seed | Service account JSON درست + Firestore enabled |
| `Project not found` | `firebase use tracefork-3f5ac` |
| Emulator Java error | `USE_FIRESTORE_EMULATOR=false` برای production |
| Rules block write | seed با Admin SDK OK است؛ client فقط read |

</div>
