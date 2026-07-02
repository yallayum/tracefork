---
name: TraceFork System
colors:
  surface: '#0f1419'
  surface-dim: '#0f1419'
  surface-bright: '#353a3f'
  surface-container-lowest: '#0a0f14'
  surface-container-low: '#171c21'
  surface-container: '#1b2025'
  surface-container-high: '#252a30'
  surface-container-highest: '#30353b'
  on-surface: '#dee3ea'
  on-surface-variant: '#bacac5'
  inverse-surface: '#dee3ea'
  inverse-on-surface: '#2c3136'
  outline: '#859490'
  outline-variant: '#3c4a46'
  surface-tint: '#3cddc7'
  primary: '#57f1db'
  on-primary: '#003731'
  primary-container: '#2dd4bf'
  on-primary-container: '#00574d'
  inverse-primary: '#006b5f'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#d1daee'
  on-tertiary: '#283140'
  tertiary-container: '#b5bed2'
  on-tertiary-container: '#444d5e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#62fae3'
  primary-fixed-dim: '#3cddc7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#dae3f7'
  tertiary-fixed-dim: '#bec7db'
  on-tertiary-fixed: '#131c2a'
  on-tertiary-fixed-variant: '#3e4758'
  background: '#0f1419'
  on-background: '#dee3ea'
  surface-variant: '#30353b'
  success: '#34D399'
  warning: '#FBBF24'
  danger: '#F87171'
  text-primary: '#F1F5F9'
  text-muted: '#94A3B8'
  border-subtle: '#334155'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  hash-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  tight: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for the high-stakes environment of food supply chain intelligence. It balances the technical rigor of a developer tool with the life-critical clarity of a safety platform. The brand personality is **trustworthy, precise, and calm under pressure**, utilizing a "Modern Enterprise" aesthetic that favors functional density over decorative flair.

The design style is a hybrid of **Minimalism** and **Glassmorphism**, set against a deep, technical dark mode. It draws inspiration from high-performance dashboards like Vercel and Stripe, using:
- **Atmospheric Depth:** Multi-layered dark surfaces with subtle translucent overlays to organize complex data.
- **Precision Typography:** A dual-font system that separates UI controls from raw, immutable data.
- **Functional Color:** A focused palette where color is never decorative, only informative—signaling compliance, risk, and movement.

## Colors

The color system is optimized for a dark-room "command center" environment. The primary background (`#0F1419`) provides a low-strain foundation, while surface levels use varying degrees of luminosity to create hierarchy.

- **Primary Teal (#2DD4BF):** Reserved for "the path of truth"—trace routes, primary actions, and successful state indicators.
- **Secondary Sky (#38BDF8):** Used for informational elements, links, and neutral system status.
- **Semantic Accents:** Danger Red, Warning Amber, and Success Green are high-chroma to ensure they demand immediate attention during recall scenarios or cold-chain violations.
- **Neutral Stack:** Text primary is off-white to prevent "halogen glare," while muted text is used for metadata and timestamps to reduce visual noise in dense tables.

## Typography

This design system uses a strategic pairing of **Inter** and **JetBrains Mono**. 

- **Inter** handles all structural UI, navigation, and narrative text. It is chosen for its exceptional legibility in dark mode and professional, neutral tone.
- **JetBrains Mono** is utilized for "immutable" data: Lot IDs, Blockchain hashes, temperature readings, and SKU numbers. This distinction helps users instantly recognize what is a system control versus a raw data point.

For mobile, headlines scale down to prevent excessive wrapping in the Split-Timeline view. Use `label-caps` for table headers and section overviews to provide clear anchoring in dense layouts.

## Layout & Spacing

The layout follows a **12-column fluid grid** for the Command Center, but shifts to a **Functional Split-Pane** model for the Trace Explorer. 

- **Trace Explorer Layout:** A 40/60 split on desktop. The left pane (40%) is a scrollable vertical timeline with high information density. The right pane (60%) is a canvas for the interactive node-link graph.
- **Spacing Rhythm:** A 4px base unit is used. Dense data tables should utilize `tight` (8px) vertical padding to maximize information "at-a-glance," while Hero sections and the Command Center use `lg` and `xl` spacing to provide "calm" during high-pressure navigation.
- **Breakpoints:**
  - **Desktop (≥1280px):** Dual-pane horizontal view.
  - **Tablet (768px - 1279px):** Timeline stacks above the graph.
  - **Mobile (<768px):** Single-column vertical flow; graph nodes collapse into a simplified step-list.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism**, avoiding traditional heavy shadows which can feel muddy in dark enterprise UIs.

1.  **Level 0 (Base):** `#0F1419` - The canvas.
2.  **Level 1 (Card/Surface):** `#1A2332` with a 1px stroke of `#334155`. These surfaces use a subtle backdrop blur (8px to 12px) when appearing over the graph canvas.
3.  **Level 2 (Elevated/Hover):** `#243044`. Used for tooltips, dropdown menus, and active states.
4.  **Recall Overlay:** When a recall is active, use a semi-transparent `danger` tint overlay on affected nodes to create a "pulsing" emergency state.

All cards should feature a very subtle inner glow (0.5px white at 5% opacity) on the top border to simulate "Stripe-like" clarity and edge definition.

## Shapes

The shape language is modern and approachable but remains disciplined. 
- **Cards:** Use a consistent 12px (`rounded-lg`) radius. This softens the technical interface without making it feel "bubbly."
- **Buttons & Inputs:** Use a tighter 8px (`rounded-md`) radius to signal interactivity and precision.
- **Status Pills:** Fully rounded (pill-shaped) for Pass/Fail indicators to distinguish them from clickable buttons.
- **Graph Nodes:** Use 12px radius squares for entities (Farms, Plants) to maintain alignment with the card system.

## Components

### Buttons & Controls
- **Primary:** Filled `#2DD4BF` with `#0F1419` text. High contrast, reserved for "Trace" or "Run Simulation."
- **Secondary:** Ghost style with `#334155` border and `#F1F5F9` text.
- **Recall Action:** Filled `#F87171` with white text, used only for final recall execution.

### Data Displays
- **Dense Tables:** No cell borders; use subtle row zebra-striping on hover (`#243044`). Text is aligned strictly: IDs (Mono) are left-aligned, status badges centered, and timestamps right-aligned.
- **Compliance Gauge:** A circular SVG stroke using the primary teal for the percentage, with a central grade (e.g., "EXCELLENT") in `label-caps`.
- **Integrity Blocks:** Small horizontal cards linked by `git-branch` style connectors, displaying JetBrains Mono hashes.

### Icons (Lucide/Phosphor Style)
Use 20px icons with a 1.5px stroke weight.
- **Package:** Batch/Inventory.
- **Truck:** Logistics/Transit.
- **Thermometer:** Cold-chain monitoring (tint red if violation).
- **Shield-Check:** Verified integrity/Audit pass.
- **Alert-Triangle:** Risk/Violation/Recall.
- **Git-Branch:** The trace graph and relationship mapping.

### Input Fields
Dark backgrounds (`#1A2332`) with a focused border of `#2DD4BF`. Placeholders should use `text-muted` and Mono font for Lot Number entries.