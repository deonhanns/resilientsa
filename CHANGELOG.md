# ResilientSA — Changelog
*Running record of what shipped to Vercel preview per Crew Order. Updated by O'Brien on order completion.*

---

## 2026-07-09 — ORDER 007 Session 1 (IN PROGRESS)
**Cell Steward Dashboard + Batch Jobs — backend complete, frontend built, not yet Bones-reviewed**
- 5 API routes: `/steward/dashboard`, `/steward/isolates`, `/steward/hubs`, `/steward/network-summary`, `/steward/log-offline-trade`
- Batch jobs: `NetworkPhaseSnapshot` (June Holley four-phase) + `InternalForecast` (listing/connection velocity)
- `StewardDashboard.tsx` — NeedsRadar, NetworkSummary, MemberRow (inline sub-components)
- 9 steward TypeScript types, 5 stewardApi methods
- **Status:** Bones review PENDING. IsolateList, HubList, LogOfflineTrade deferred.

---

## 2026-07-03 — ORDER 006 SHIPPED ✅
**Trade Exchange — core product experience live on Vercel preview**
- Full listing CRUD (`POST/GET/PATCH/DELETE /listings`)
- Match proposal and confirmation flow (`POST /matches`, `PATCH /matches/:id/confirm`)
- Fairness confirmation + ConnectionEvent write (`POST /trade-completions/:id/confirm-fairness`)
- Community Exchange Reference (`GET /community-exchange-reference`)
- Offline Outbox pattern — IndexedDB queue, drains on reconnect, exponential backoff
- McCoy-approved UI: ListingCard (6px pillar border), PillarFilterRow, CreateListingSheet, TradeExchange feed
- phoneHash fix — deterministic user lookup (discovered and fixed non-deterministic encryptPhone bug)
- Bones: CONDITIONAL PASS. Worf: not required.

---

## 2026-07-03 — ORDER 005 SHIPPED ✅
**Gifts Profile — first community member experience after auth**
- `GET/PUT /gifts-profile/me` API
- RLS context gap from ORDER 004 resolved — `withRLSContext` via `SELECT set_config()`
- Three-question sequential capture UI — no "profile" language, no progress bar, warm completion
- Complementary gifts nudge to Cell Steward on first profile creation
- Post-auth redirect to `/profile` if no gifts profile exists
- Bones: PASS. Worf: not required.

---

## 2026-07-02 — ORDER 004 SHIPPED ✅
**Authentication — SMS OTP via Africa's Talking, IndexedDB sessions**
- `POST /auth/request-code` → Africa's Talking SMS OTP (10-minute expiry, single-use)
- `POST /auth/verify-code` → 30-day session token stored in IndexedDB
- AES-256-CBC phone encryption, HMAC-SHA256 phone hashing, SA number normalisation
- `requireSession` middleware — Bearer token validation, user context attachment
- Auth screens: "Join your community" → "Check your messages" → Trade Exchange
- New schema tables: `otp_codes`, `session_tokens`
- Bones: CONDITIONAL PASS (Afrikaans placeholders — pre-production blocker). Worf: CONDITIONAL PASS.

---

## 2026-07-02 — ORDER 003 SHIPPED ✅
**PostgreSQL Schema — 25 tables, Neon hosted, full RLS and encryption**
- 22 public tables + 3 coop_pii tables via Drizzle ORM
- pgcrypto enabled, all PII fields as bytea (phone_number, id_number, address, etc.)
- coop_pii schema namespace — FoundingMember access restricted to node_admin role only
- RLS enabled on all tables, node_id tenant isolation
- 19 indexes for query performance
- Worf: ALL CLEAR (5/5 checks).

---

## 2026-07-02 — ORDER 002 SHIPPED ✅
**Project Scaffold + Design Tokens + i18n — Vercel preview live**
- React + Vite + TypeScript PWA at `resilientsa-app/`
- Living Soil Design System tokens wired (colors, typography, spacing, fonts)
- Tailwind v4 with all pillar colours and tints
- `src/lib/pillars.ts` — Six Pillars TypeScript constants (canonical McCoy colours)
- react-i18next — English + Afrikaans (placeholders) + isiZulu scaffold
- 6 route stubs, stub hooks, PWA manifest
- Vercel preview: https://resilientsa-app.vercel.app

---

## 2026-07-02 — ORDER 001 COMPLETE ✅
**Clickable Prototype — Bones-approved, Living Soil Design System committed**
- Three screens designed in Claude Design (McCoy): Trade Exchange, Get Support, Steward Dashboard
- All screens Bones-approved (PASS or CONDITIONAL PASS with corrections applied)
- Living Soil Design System committed to `design/prototype-v1/`
- 104 CSS custom properties, full component library, NeedsRadar, MemberRow, NetworkSummary
- Prototype URL: `design/prototype-v1/ui_kits/resilientsa-app/index.html`
- Claude Design project: https://claude.ai/design/p/6bdfddb8-c5a4-4333-b384-e052f1fe531a

---

*Updated by O'Brien at end of each completed order.*
*Read by Spock for deployment visibility.*
*Captain checks this to know what is live on Vercel preview.*
