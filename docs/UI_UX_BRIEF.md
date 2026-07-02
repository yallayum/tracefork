# TraceFork — UI/UX Design Brief

> **Purpose:** Feed this document to Google AI Studio / design tools to generate the TraceFork dashboard UI.

---

## 1. Product Overview

**Product name:** TraceFork  
**Tagline:** *Trace faster. Recall smarter.*  
**Category:** B2B Food Supply Chain Intelligence Platform  
**Platform:** Web dashboard (responsive desktop-first, tablet-friendly)  
**Backend:** Google Firebase Firestore (real-time data)  
**Target release:** Kaggle Capstone demo + portfolio piece  

### One-line description
TraceFork is an AI-powered food traceability dashboard that lets quality managers trace batch journeys from farm to shelf, detect cold-chain violations, simulate product recalls, and generate audit-ready compliance reports—in seconds, not hours.

### Brand personality
- **Trustworthy** — food safety is life-critical  
- **Precise** — data-driven, no fluff  
- **Calm under pressure** — recall scenarios feel controlled, not chaotic  
- **Modern enterprise** — not consumer-playful; think Linear × Stripe for food ops  

---

## 2. Target Users

| Persona | Role | Primary goals |
|---------|------|---------------|
| **Sara** | Quality Manager, mid-size dairy plant | Trace a lot number before audit; simulate recall impact |
| **Omar** | Cold Chain Ops Lead | Spot temperature violations across shipments |
| **Lina** | Compliance Officer | Export compliance score + event integrity report |

**Demo judge persona:** Technical evaluator who needs to understand architecture and see a working trace in < 2 minutes.

---

## 3. Design System

### Color palette
| Token | Hex | Usage |
|-------|-----|--------|
| `--bg-primary` | `#0F1419` | App background (dark mode default) |
| `--bg-surface` | `#1A2332` | Cards, panels |
| `--bg-elevated` | `#243044` | Hover states, modals |
| `--accent-primary` | `#2DD4BF` | Teal — trace path, primary CTA |
| `--accent-secondary` | `#38BDF8` | Sky — links, info |
| `--success` | `#34D399` | PASS, compliant, valid hash chain |
| `--warning` | `#FBBF24` | Partial trace, medium risk |
| `--danger` | `#F87171` | FAIL, recall CRITICAL, cold-chain breach |
| `--text-primary` | `#F1F5F9` | Headings, body |
| `--text-muted` | `#94A3B8` | Labels, timestamps |
| `--border` | `#334155` | Dividers, graph edges |

### Typography
- **Headings:** Inter or DM Sans, 600–700 weight  
- **Body / data:** Inter 400–500  
- **Monospace (Lot IDs, hashes):** JetBrains Mono or IBM Plex Mono  

### Iconography
- Lucide or Phosphor icons  
- Food chain: package, truck, thermometer, shield-check, alert-triangle, git-branch (trace graph)  

### Spacing & radius
- Base unit: 4px  
- Card radius: 12px  
- Button radius: 8px  
- Dense data tables; generous whitespace on hero/trace views  

---

## 4. Information Architecture

```
TraceFork Dashboard
├── Home / Command Center
├── Trace Explorer          ← primary workflow
├── Recall Simulator
├── Cold Chain Monitor
├── Compliance & Integrity
├── Demo Scenarios          ← capstone judge mode
└── Settings / Export
```

---

## 5. Key Screens (detailed)

### 5.1 Command Center (Home)

**Layout:** 3-column grid on desktop  

**Hero strip:**
- Headline: "Food Supply Chain Command Center"
- Sub: "Real-time batch traceability powered by Firebase + AI agents"
- **Primary search:** Large input — placeholder `Enter Lot Number (e.g. LOT-2026-0421)` + QR scan icon
- Quick-pick chips: 3 demo lots as one-click buttons

**KPI cards (4):**
1. Active Batches — count  
2. Avg Compliance Score — % with trend  
3. Open Cold-Chain Alerts — count (red if > 0)  
4. Recall Simulations (24h) — count  

**Recent activity feed:** Last 5 trace/recall events with timestamp + status badge  

---

### 5.2 Trace Explorer (core screen)

**Split layout: 40% timeline | 60% supply chain graph**

**Left panel — Batch Summary Card:**
- Product name + category badge (Dairy / Packaged)  
- Lot number (mono, copy button)  
- Production / expiry dates  
- **Compliance Score** — circular gauge 0–100 with grade (EXCELLENT / GOOD / PARTIAL / INCOMPLETE)  
- **Cold Chain:** PASS / FAIL pill  
- **Integrity:** Valid chain ✓ or Tamper detected ✗  

**Left panel — Event Timeline (vertical):**
- Chronological steps: harvest → process → pack → receive → shelf  
- Each row: icon, node name, city, timestamp, temp (if any), document ref  
- Active step highlighted with teal left border  

**Right panel — Supply Chain Graph:**
- Interactive node-link diagram (horizontal flow left → right)  
- Node types color-coded:  
  - Farm = green  
  - Plant = blue  
  - Warehouse = purple  
  - Retail = orange  
- Animated path draw on load  
- Click node → side drawer with node details + certifications  

**Bottom action bar:**
- `Simulate Recall` (secondary)  
- `Export Audit Report` (primary)  
- `Run Demo Scenario` (ghost)  

---

### 5.3 Recall Simulator

**Wizard-style 3 steps:**

**Step 1 — Select batch**  
Dropdown or search; show product thumbnail placeholder + units in market  

**Step 2 — Contamination point**  
Visual graph with clickable nodes; selected node pulses red  
Reason textarea: e.g. "Listeria risk at pasteurization"  

**Step 3 — Impact preview**  
- **Severity badge:** CRITICAL / HIGH / MEDIUM  
- **Human approval gate** (if CRITICAL): checkbox + "Approve recall plan" button disabled until checked  
- **Affected retailers table:** Store name | Units | Action (WITHDRAW)  
- **Draft stakeholder notices** — expandable accordion with email preview  
- Block state if trace incomplete: amber banner — "Recall blocked — incomplete trace data"  

---

### 5.4 Cold Chain Monitor

**Top:** Batch selector + date range  

**Main:** Temperature timeline chart (line chart per shipment leg)  
- Horizontal safe zone band (≤ 4°C) shaded green  
- Violations highlighted red with annotation tooltip  

**Violation cards:**  
- Route: Amman Plant → Riyadh Transit  
- Peak: 9°C for 2h  
- Risk: HIGH  
- Recommendation: Quarantine stock at Spinneys Riyadh  

---

### 5.5 Compliance & Integrity

**Two tabs:**

**Compliance tab:**  
- Checklist table: field | status ✓/✗  
- Score breakdown bar chart  
- Trace gap warning if applicable  

**Integrity tab:**  
- Hash chain visualization (linked blocks like blockchain lite)  
- Each event: sequence #, event_hash (truncated), prev_hash  
- Green "6/6 events verified" or red failure at sequence N  

---

### 5.6 Demo Scenarios (Judge Mode)

**Purpose:** One-click capstone demo for video recording  

**Layout:** Card grid — 5 scenario cards  

Each card:  
- Scenario name + short description  
- Expected outcome pills (e.g. "Compliance ≥ 90", "3 retailers affected")  
- **Run Scenario** button → runs test, shows pass/fail checklist live  
- **View in Trace Explorer** link  

Footer: `5/5 scenarios passed` with green progress bar  

---

## 6. Interaction & Motion

- Page transitions: 200ms ease-out fade  
- Graph nodes: staggered appear 50ms apart  
- Recall simulation: downstream nodes turn red in cascade (300ms delay each)  
- Loading: skeleton screens on Firestore fetch, not spinners  
- Toast notifications: bottom-right, auto-dismiss 4s  
- Empty state: illustration + "Enter a lot number to begin tracing"  

---

## 7. Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| ≥1280px | Full split trace view |
| 768–1279px | Timeline above graph, stacked |
| <768px | Single column; graph simplified to step list |

---

## 8. Accessibility

- WCAG 2.1 AA contrast on all badges  
- Keyboard navigable timeline and graph nodes  
- Screen reader labels on compliance gauge  
- Don't rely on color alone — use icons + text for PASS/FAIL  

---

## 9. Sample Content (use in mockups)

**Batch:** LOT-2026-0421  
**Product:** Yogurt Plain 500g  
**Path:** Al Ain Farm → Dubai Plant → Gulf DC → Carrefour Marina, Lulu JBR, Satwa Market  
**Compliance:** 98% EXCELLENT  
**Cold chain:** PASS  

**Recall demo:** Contamination at Dubai Plant → 1,800 units → 3 retailers WITHDRAW  

---

## 10. Technical Constraints for Implementation

- **Framework suggestion:** React + Vite + Tailwind CSS  
- **Firebase:** Firestore real-time listeners on `batches/{lot}/events`  
- **Charts:** Recharts or Chart.js  
- **Graph:** React Flow or D3 force-directed (prefer horizontal DAG)  
- **Hosting:** Firebase Hosting  
- **No auth required for capstone demo** — read-only public rules  
- **RTL support (optional phase 2):** layout should not break with `dir="rtl"` for Persian labels  

---

## 11. Deliverables Requested from Design Tool

Please generate:

1. **Command Center** — desktop 1440px  
2. **Trace Explorer** — with LOT-2026-0421 loaded  
3. **Recall Simulator** — Step 3 impact view (CRITICAL state)  
4. **Cold Chain Monitor** — with violation highlighted  
5. **Design system page** — colors, type, buttons, badges, cards  
6. **Mobile** — Trace Explorer stacked layout  

**Style reference mood:** Vercel dashboard darkness + Stripe clarity + food safety seriousness (not playful food emojis).

---

## 12. Copy & Microcopy

| Element | Text |
|---------|------|
| Primary CTA | Trace Batch |
| Recall CTA | Simulate Recall |
| Export CTA | Download Audit Report |
| Disclaimer footer | TraceFork is an assistant tool—not a replacement for ERP systems or regulatory authorities. |
| Empty search | No batch found. Check the lot number and try again. |
| Blocked recall | Recall simulation requires a complete trace. Missing distributor handoff detected. |

---

*End of brief — TraceFork v0.1 — Project ID: tracefork-3f5ac*
