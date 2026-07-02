# CREW ORDER — 002
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-002
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY — awaiting O'Brien
**Date issued:** 2026-07-02
**Depends on:** CREW-ORDER-001 ✅ COMPLETE

---

## 1. STRATEGIC CONTEXT

ORDER 001 is complete. McCoy has delivered a Bones-approved prototype and a full Living Soil Design System committed to `design/prototype-v1/`. ORDER 002 is the first engineering task: set up the React + Vite PWA project, wire the Living Soil token system into it, and get a Vercel preview deployment running. Nothing functional is built in this order — it is entirely infrastructure and design token wiring. Every subsequent order builds on what ORDER 002 establishes.

---

## 2. MISSION OBJECTIVE

Scaffold the ResilientSA PWA project with the correct architecture, wire the Living Soil Design System tokens, create the Six Pillars TypeScript constants, and deploy a working empty shell to Vercel preview.

---

## 3. BONES BRIEF

No human-facing output in this order. Bones review not required. The design tokens wired here will be tested by Bones from ORDER 004 onward when real UI is built.

---

## 4. WORF BRIEF

No PII in this order. No sensitive data handled. No security review required.

---

## 5. DESIGN SYSTEM REFERENCE

**Before writing a single line of code, do the following:**

1. Open `design/prototype-v1/ui_kits/resilientsa-app/index.html` in a browser. This is the visual target for everything you build in this mission. Keep it open.
2. Read `design/prototype-v1/readme.md` in full. This is McCoy's design system documentation.
3. Read `design/prototype-v1/tokens/colors.css` — these are the authoritative colour tokens.

**The canonical pillar colours are (from McCoy — these override the original brand palette doc):**

| Pillar | Colour Name | Hex | CSS Token |
|---|---|---|---|
| Water | Rainwater Blue | `#3D6B8C` | `--pillar-water` |
| Food | Fynbos Aloe | `#4A7256` | `--pillar-food` |
| Health | Protea Rose | `#B24C63` | `--pillar-health` |
| Safety | Ochre Earth | `#C85A3C` | `--pillar-safety` |
| Energy | Sunbaked Clay | `#E6A854` | `--pillar-energy` |
| Skills & Trade | Indigo Cloth | `#5E5A8C` | `--pillar-skills` |

Health is now Protea Rose, not Fynbos Aloe. Skills & Trade is now Indigo Cloth, not Sunbaked Clay. Use these values everywhere. Do not use the old brand-palette-v1.0.md hex values for these two pillars.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 Project Initialisation

```bash
npm create vite@latest resilientsa-app -- --template react-ts
cd resilientsa-app
npm install
npm install idb react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

The project lives at the repo root in a folder called `resilientsa-app/`. Do not put it in `src/` or anywhere else.

### 6.2 Directory Structure

Create this structure inside `resilientsa-app/`:

```
resilientsa-app/
  src/
    components/
      trade-exchange/
      marketplace/
      steward-dashboard/
      gifts-profile/
      crisis-mode/
      shared/
    hooks/
      useOutboxSync.ts      (empty stub — implemented in ORDER 006)
      useOfflineStatus.ts   (empty stub — implemented in ORDER 006)
    i18n/
      index.ts
      locales/
        en.json
        af.json
        zu.json             (empty — Phase 2)
    lib/
      api.ts
      pillars.ts
    styles/
      index.css             (imports all token files below)
  index.html
  vite.config.ts
  tailwind.config.js
  tsconfig.json
```

### 6.3 Copy Design System Tokens

Copy these files from `design/prototype-v1/tokens/` into `resilientsa-app/src/styles/`:

```
design/prototype-v1/tokens/colors.css     → src/styles/colors.css
design/prototype-v1/tokens/typography.css → src/styles/typography.css
design/prototype-v1/tokens/spacing.css    → src/styles/spacing.css
design/prototype-v1/tokens/fonts.css      → src/styles/fonts.css
```

Create `src/styles/index.css` that imports all four:

```css
@import './fonts.css';
@import './colors.css';
@import './typography.css';
@import './spacing.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import `src/styles/index.css` in `src/main.tsx`.

### 6.4 Tailwind Configuration

Wire the Living Soil tokens into Tailwind so utility classes are available. `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'baobab-bark':  '#2C2A29',
        'canvas-grey':  '#F4F4F2',
        'canvas-raised':'#FBFBF9',
        'canvas-sunk':  '#EAEAE6',
        'pillar-water':  '#3D6B8C',
        'pillar-food':   '#4A7256',
        'pillar-health': '#B24C63',
        'pillar-safety': '#C85A3C',
        'pillar-energy': '#E6A854',
        'pillar-skills': '#5E5A8C',
        'pillar-water-tint':  '#E0E8ED',
        'pillar-food-tint':   '#E4EBE5',
        'pillar-health-tint': '#F3E1E6',
        'pillar-safety-tint': '#F5E3DC',
        'pillar-energy-tint': '#F9EFDA',
        'pillar-skills-tint': '#E7E5F0',
        'action-primary': '#4A7256',
        'signal-urgent':  '#C85A3C',
        'signal-pending': '#E6A854',
        'signal-info':    '#3D6B8C',
      },
      fontFamily: {
        heading: ['Ubuntu', 'Work Sans', 'sans-serif'],
        body:    ['Inter', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'sm':   '12px',
        'md':   '16px',
        'lg':   '22px',
        'full': '999px',
      },
    },
  },
  plugins: [],
}
```

### 6.5 The Six Pillars Constants — `src/lib/pillars.ts`

This is the single source of pillar truth in code. Every component imports from here. Never redefine pillar data per component.

```typescript
// src/lib/pillars.ts
// THE SINGLE SOURCE OF PILLAR TRUTH IN CODE
// McCoy canonical values — do not use brand-palette-v1.0.md for Health or Skills colours

export enum Pillar {
  Water       = 'water',
  Food        = 'food',
  Health      = 'health',
  Safety      = 'safety',
  Energy      = 'energy',
  SkillsTrade = 'skills',
}

export const PILLAR_COLOURS: Record<Pillar, string> = {
  [Pillar.Water]:       '#3D6B8C', // Rainwater Blue
  [Pillar.Food]:        '#4A7256', // Fynbos Aloe
  [Pillar.Health]:      '#B24C63', // Protea Rose — McCoy addition, SA national flower
  [Pillar.Safety]:      '#C85A3C', // Ochre Earth
  [Pillar.Energy]:      '#E6A854', // Sunbaked Clay
  [Pillar.SkillsTrade]: '#5E5A8C', // Indigo Cloth — McCoy addition, shweshwe textile
} as const

export const PILLAR_TINTS: Record<Pillar, string> = {
  [Pillar.Water]:       '#E0E8ED',
  [Pillar.Food]:        '#E4EBE5',
  [Pillar.Health]:      '#F3E1E6',
  [Pillar.Safety]:      '#F5E3DC',
  [Pillar.Energy]:      '#F9EFDA',
  [Pillar.SkillsTrade]: '#E7E5F0',
} as const

export const PILLAR_LABELS: Record<Pillar, string> = {
  [Pillar.Water]:       'Water',
  [Pillar.Food]:        'Food',
  [Pillar.Health]:      'Health',
  [Pillar.Safety]:      'Safety',
  [Pillar.Energy]:      'Energy',
  [Pillar.SkillsTrade]: 'Skills & Trade',
} as const

export const PILLAR_ICONS: Record<Pillar, string> = {
  [Pillar.Water]:       'droplets',
  [Pillar.Food]:        'wheat',
  [Pillar.Health]:      'heart-pulse',
  [Pillar.Safety]:      'shield',
  [Pillar.Energy]:      'sun',
  [Pillar.SkillsTrade]: 'handshake',
} as const

export const CRISIS_PROTECTED_PILLARS: Pillar[] = [
  Pillar.Water,
  Pillar.Food,
  Pillar.Health,
] as const

export const PILLAR_PRIORITY: Record<Pillar, number> = {
  [Pillar.Water]:       1,
  [Pillar.Food]:        2,
  [Pillar.Health]:      3,
  [Pillar.Safety]:      4,
  [Pillar.Energy]:      5,
  [Pillar.SkillsTrade]: 6,
} as const

export const ENERGY_CASCADE_PILLARS: Pillar[] = [
  Pillar.Water,
  Pillar.Food,
  Pillar.Health,
] as const

export const DEFAULT_PILLAR = Pillar.SkillsTrade

export const ALL_PILLARS = Object.values(Pillar) as Pillar[]
```

### 6.6 API Client Stub — `src/lib/api.ts`

```typescript
// src/lib/api.ts
// Typed API client shell — endpoints added per order as they are built

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function getToken(): string | null {
  return localStorage.getItem('session_token')
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`)
  return res.json()
}

export const api = {
  get:    <T>(path: string)               => request<T>('GET', path),
  post:   <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string)               => request<T>('DELETE', path),
}
```

### 6.7 i18n Setup

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

`src/i18n/index.ts`:

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import af from './locales/af.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, af: { translation: af } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'af', 'zu'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'] },
  })

export default i18n
```

`src/i18n/locales/en.json`:

```json
{
  "nav": {
    "exchange": "Exchange",
    "support": "Get support",
    "steward": "Steward"
  },
  "pillars": {
    "water": "Water",
    "food": "Food",
    "health": "Health",
    "safety": "Safety",
    "energy": "Energy",
    "skills": "Skills & Trade"
  },
  "exchange": {
    "title": "Trade Exchange",
    "filter_all": "Everything",
    "filter_offer": "Offering",
    "filter_need": "Needing",
    "offer_label": "Offering",
    "need_label": "Needed",
    "i_want_this": "I want this",
    "i_can_help": "I can help",
    "match_member": "Match a member",
    "share_title": "Share with your cell",
    "im_offering": "I'm offering",
    "i_need_help": "I need help",
    "post_to_cell": "Post to the cell"
  },
  "support": {
    "title": "Get support",
    "question": "What kind of support does your community need?",
    "subtitle": "Tap one to see what other communities have used.",
    "request_btn": "Request for our community",
    "used_by": "{{count}} communities used this"
  },
  "steward": {
    "title": "Steward view",
    "network_summary": "More members are connecting directly with each other, not just through you.",
    "needs_title": "Where the need is",
    "members_title": "Your members",
    "out_of_touch": "{{count}} out of touch"
  }
}
```

`src/i18n/locales/af.json` — use English values as placeholders where professional translation is not yet available. Do not use machine-translated Afrikaans without review.

`src/i18n/locales/zu.json` — empty object `{}`. isiZulu is Phase 2.

Import i18n in `src/main.tsx` before the app renders:

```typescript
import './i18n'
```

### 6.8 App Shell — `src/App.tsx`

Minimal routing shell. No content yet.

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<div>Community Hub — ORDER 002 scaffold</div>} />
        <Route path="/trade"   element={<div>Trade Exchange — ORDER 006</div>} />
        <Route path="/support" element={<div>Community Marketplace — ORDER 008</div>} />
        <Route path="/profile" element={<div>Gifts Profile — ORDER 005</div>} />
        <Route path="/steward" element={<div>Steward Dashboard — ORDER 007</div>} />
        <Route path="/admin"   element={<div>Node Admin — Phase 2</div>} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 6.9 Vercel Deployment

Connect `resilientsa-app/` to Vercel:
- Framework: Vite
- Root directory: `resilientsa-app`
- Build command: `npm run build`
- Output directory: `dist`

Push to `main` → Vercel preview deploys automatically.

---

## 8. MILESTONES

1. `resilientsa-app/` running locally — `npm run dev` with no errors
2. `ALL_PILLARS` logs correctly to console from `App.tsx`
3. CSS token `--pillar-health` resolves to `#B24C63` in browser DevTools
4. Tailwind utility `bg-pillar-water` applies `#3D6B8C` correctly
5. `useTranslation()` returns English strings by default
6. Vercel preview URL live — paste into `OBRIEN_STANDUP.md`
7. `OBRIEN_STANDUP.md` entry committed

---

## 9. UHURA INTELLIGENCE REQUIRED

None for this order.

---

## 10. REPORTING BACK

O'Brien commits an `OBRIEN_STANDUP.md` entry on completion including:
- Vercel preview URL
- Confirmation of the three token/pillar verifications above
- Any deviations from this spec and why

Then await CREW-ORDER-003 (PostgreSQL Schema).

---

## 11. SAREK ESCALATION CLAUSE

Straightforward infrastructure. Escalation not anticipated. If blocked for 3 attempts on any single step, file in `ENGINEERING_ESCALATIONS/` and flag in standup.

---

**ORDER STATUS: READY — awaiting O'Brien**

*Issued by Spock — 2026-07-02*
