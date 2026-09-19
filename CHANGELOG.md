# ResilientSA — Changelog
*Running record of what shipped to Vercel preview per Crew Order. Updated by O'Brien on order completion.*

---

## 2026-09-19 — ORDER 010 CLOSED, ORDER 011 §3/§4.1/§4.2-redesign, and a live incident (2026-09-12 → 2026-09-19)

*Consolidated entry, same precedent as the 2026-09-11 backfill: an index of what shipped, not a replacement for the session record. **Full detail lives in [`OBRIEN_STANDUP.md`](OBRIEN_STANDUP.md:1190)** — the 2026-09-12, 09-13, 09-15, 09-18 and 09-19 entries.*

### ORDER 010 — catch-all routing depth ✅ CLOSED

- **Path A refuted on Preview** (two variants): the `functions` glob was not the cause, and the runtime pin is not required at all under Vercel CLI 59.1.3. Nothing was merged from it, since it didn't work
- **Path B shipped** (merge `760fb60`): the steward catch-all replaced by real nested files — `api/steward/[op]/[cellId].ts` plus `api/admin/members/[userId]/{cell,role}.ts`. **11 functions total**, under the Hobby limit of 12 — the order's own math had assumed 8 and would have come out at 14
- Logic ported verbatim; `setMemberRole`'s strict positive allowlist preserved
- Live-verified Preview-first then Production: the six routes 401 unauthenticated / 403 authenticated on Preview, 401 on Production
- **`scripts/smoke-routes.ts` added** as a standing pre-deploy routing check. Its discriminator is the point: a routed handler always returns JSON, which catches both Vercel's platform 404 page *and* the SPA rewrite answering a bad path with HTML at 200. Negative control must FAIL — it does (0/15 vs the 15/15 on Production)
- **Two routing rules now documented and encoded:** `[...path]` catch-alls match exactly **one** segment, and they do **not** match depth 0
- `b3b68c0`'s causal claim corrected in the record: it was necessary but never sufficient, and the steward dashboard stayed broken until `760fb60`

### ORDER 011 — RLS (§3, §4.1, §4.3)

- **§3 confirmed live, and the mechanism was not what the order assumed:** `neondb_owner` carries the **BYPASSRLS** attribute, which overrides every policy and is *not* the exemption `FORCE ROW LEVEL SECURITY` closes. So a dedicated non-owner role is not merely preferred — it is the only viable fix, correcting the order's own §4.2 options
- **§4.1 complete:** `tx` threaded through `withRLSContext` into **31 call sites across 9 files**, verified by grep rather than `tsc`
- **§4.3 test added**, including a false PASS caught and fixed: the first version reported PASS on zero rows from an *empty* table. It now probes a non-empty table and exits INCONCLUSIVE (not PASS) when there is nothing to protect
- `AGENTS.md`'s POPIA RLS checklist item corrected to CANNOT BE TICKED, with the live evidence and the inert window (2026-07-02 → §4.2)

### Live incident — 2026-09-14/15 → CRIT-002 FIXED

- **Production was never affected.** The `DATABASE_URL` switch *and* its rollback were both inert: the API resolves **`POSTGRES_URL`** via `@vercel/postgres`, which contains zero runtime references to `DATABASE_URL`. Confirmed by a real Playwright login: `200 request-code`, `200 verify-code`, `200 /api/me`, `/trade` rendering, `/admin` 200
- **The genuine breakage was in Preview**, where the new role *was* live: every DB-touching route 500'd **including login**, because all policies called `current_setting()` without `missing_ok` → `42704`. No token → 401 everywhere → "no cell" on trade. That is the reported symptom sequence, and its source was Preview, not Production
- **CRIT-002 — FIXED, deployed, live-verified A/B.** `POST /api/auth/request-code` returned `err.message`, which embeds the SQL **and its bound parameters** — one being the plaintext OTP — plus a stack trace, to an *unauthenticated* caller. Now returns `{"error":"Internal server error"}`; the SQL prefix is logged server-side with the `params:` tail stripped (Pattern 003's rule, extended from logs to responses)
- Filed: [`WORF_ALERTS/2026-09-15-live-incident-order011-section42-app-role-breakage.md`](WORF_ALERTS/2026-09-15-live-incident-order011-section42-app-role-breakage.md:1) (CRIT-002/003/004, HIGH-005/006, MED-007) and [`ENGINEERING_ESCALATIONS/2026-09-15-order011-section42-app-role-unviable.md`](ENGINEERING_ESCALATIONS/2026-09-15-order011-section42-app-role-unviable.md:1)

### ORDER 011 §4.2 REDESIGN — approved 2026-09-18, steps 1–3 executed 2026-09-19

- **Approved in full** ([`approval`](CREW_ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-approval.md:1)) — split connection identity, three GUCs, per-table policy reasoning. Spock also corrected `AGENTS.md` Rule #2 (`DATABASE_URL` → `POSTGRES_URL`) at source, commit `58c1884`
- **Step 1 — A1 applied:** 20 policies made NULL-tolerant. Policy count 23 → 23 and the zero-policy set unchanged, owner reads unchanged — behaviour-neutral confirmed by assertion, not assumed
- **Step 2 — A2 applied:** +7 policies for the 5 deny-all tables. **Zero-policy tables 5 → 0**
- **Step 3 — Part B built**, shipped to branch `order-011-4.2-part-b` only, so `main` and Production stay untouched. Fail-closed proven live on Preview: privileged pool unaffected (`/api/me`, `/api/admin/nodes`, `request-code` all 200), node-scoped routes 503
- **New gate `scripts/verify-rls-live.ts`** — the application-level check §6 called for. Validated in **both** directions: exit 3 INCONCLUSIVE without a session token, exit 1 FAIL with one. It would have failed the 2026-09-14 rollout
- **Stopped at the step-4 checkpoint.** No environment variable set anywhere; `POSTGRES_URL_APP` does not yet exist as a live variable

**Build:** `tsc -b && vite build` — zero errors, **77 modules**

**Open:** **CRIT-001** (Production still `bypassrls=true` — closes only at rollout step 6 plus a passing gate); rollout step 4 (needs `POSTGRES_URL_APP`, Sensitive, Preview first, Captain); Bones live reviews for ORDER 007 / 008 / 009a, now genuinely testable; **MED-007** (two client routes unroutable by construction); the **api-typecheck gap** (`tsc -p api/tsconfig.json` checks *nothing* without `--ignoreDeprecations`); AT sender-ID registration not started

---

## 2026-09-11 — CONSOLIDATED BACKFILL: ORDER 008 → ORDER 009a (2026-08-01 → 2026-09-11)

*Backfilled 2026-09-11 as a single consolidated entry, per Captain direction — deliberately **not** backfilled entry-by-entry. This is an index of what shipped, not a replacement for the session record. **Full detail lives in [`OBRIEN_STANDUP.md`](OBRIEN_STANDUP.md:790)** (2026-09-10 pt.1–pt.6, and the 2026-09-11 entries). This entry exists because the changelog had been stale since 2026-07-19.*

### ORDER 008 — Community Marketplace ✅ built
- Backend + UI: `api/marketplace/[...path].ts`, `Marketplace.tsx`, `ProgrammeCard.tsx`
- Grounder identity resolved via the `grounders` table; schema fix delivered
- Live-verified 8/8 route checks (2026-09-10)
- **Bones: CONDITIONAL PASS** — carried conditions: offline *browsing* cache not implemented (request queuing works); Afrikaans placeholders
- Naming discipline held under review: never "Marketplace", never "Grounder" in community-facing copy

### ORDER 009a — Node & Cell Formation ✅ built (unblocks ORDER 009)
- **Schema:** migration `0004_nodes_created_by.sql` — `nodes.created_by` nullable, purely additive. First attempt used Drizzle `.references()`, which created a `nodes.ts` ↔ `users.ts` circular import and broke `tsc` (TS7022/TS7024); fixed by keeping the FK at the DB level, matching the ORDER 004 precedent
- `api/admin/[...path].ts` — 7 routes (nodes GET/POST, cells GET/POST, members GET, members/:id/cell PATCH, members/:id/role PATCH). Function count 7 → 8, under the Hobby limit of 12
- `NodeAdmin.tsx` + `adminApi` client + `AdminNode`/`AdminCell`/`AdminMember` types + `admin.*` i18n keys (af as English fallback)
- `/admin` was previously an **unguarded** static `<div>` with no `ProtectedRoute` at all — now auth-gated and role-gated
- Bootstrap: first `regional_steward` granted (Captain's test user), applied via a narrow token-gated temp endpoint, created → called once → deleted next commit → confirmed removed
- **Worf/POPIA notes:** this is the platform's first role-*granting* surface. Second-eyes review filed 2026-09-11 — [`WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md`](WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md:1) — 4/4 requested checks PASS, plus CRIT-001 and four Medium findings
- **Bones: not yet reviewed** (no prototype exists for this screen; from-scratch judgement call owed against the live app)

### Platform fixes — 2026-09-10 (Spock, interim — O'Brien offline)
- **Credential rotation:** Neon `neondb_owner` password reset; the previously-hardcoded string treated as compromised
- **Six** hardcoded Neon credential instances removed (not one) — `test-listings-api.ts`, `assign-cell.ts`, `verify-db.ts`, `add-rls-new-tables.ts`, `create-default-node.ts`, `apply-custom-migration.ts`. All now `process.env.DATABASE_URL` + startup guard. Original 2026-08-17 alert scope was incomplete; corrected. Old string remains in git history only — rotated and inert
- **Vercel Deployment Protection disabled** — "Require Log In" was blocking *all* public access, independent of the credential problem
- **SCOTTY_PATTERNS 004–007 documented:** module-type boundary doesn't stop at `api/`; crash-at-import from eager third-party client construction; catch-all param arrives as `'...path'`; double-prefixed API path causing a permanent false empty state
- **Login verified end-to-end for the first time.** SMS OTP runs on the `OTP_DEBUG_LOG` fallback (Pattern 003) — `AT_API_KEY`/`AT_USERNAME` still not in Vercel
- ORDER 007 Bones fixes (all five) + `BottomNav` wired in + test user assigned to Cell 4
- `assign-cell.ts` rewritten to take an explicit target user id rather than `ORDER BY created_at DESC LIMIT 1`

### Platform fixes — 2026-09-11 (O'Brien resumed)
- `StewardDashboard.tsx` demo-sentinel `cellId` fix (`b3b68c0`) — every real user hitting `/steward` was getting a 404 because the dashboard called a demo-only sentinel cell. Introduced by the 2026-09-10 Bones-fix rewrite; had no changelog or standup entry until backfilled
- **Local build-environment fix** — `NODE_ENV=production` + `npm omit=dev` were silently swallowing all devDependencies, so `npm run build` failed with "Cannot find module 'vite'". Local/env only; no repo change, lockfile untouched
- **Dependency triage** — `npm audit --omit=dev` returns the same 19 (4 moderate, 15 high, 0 critical) as the full audit, i.e. **0 dev-only**. Three accepted risks registered in [`SECURITY_NOTES.md`](SECURITY_NOTES.md:1)
- ORDER 009a role-escalation second-eyes review completed and filed

**Build:** `tsc -b && vite build` — zero errors, **77 modules**

**Open:** live Bones reviews for ORDER 007 / 008 / 009a (all three currently source-level only); **CRIT-001** (RLS enabled but not enforced — with Spock for a Crew Order); ORDER 009 not yet built; AT sender-ID registration not started (long lead time — Captain action)

---

## 2026-07-19 — CREW-ORDER-007b SHIPPED ✅
**Vercel Serverless Conversion — all Express routes converted to Vercel Functions**
- 17 serverless functions in `api/` — auth, gifts-profile, listings, matches, trade-completions, steward, community-exchange-reference
- Shared middleware library: `api/_lib/` (db, session, db-context, crypto, otp, at, gifts-nudge)
- `@vercel/node` runtime configured in `vercel.json`
- Frontend `BASE_URL` switched from `http://localhost:3001` → `/api` (same-origin, no CORS)
- `express` server preserved for local development (set `VITE_API_URL=http://localhost:3001` in `.env.local`)

**ORDER 007 deferred sub-components completed:**
- `IsolateList.tsx` — collapsible isolate viewer with "Reach out" nudge buttons
- `HubList.tsx` — collapsible hub connector viewer with risk badges (attention/concern/none)
- `LogOfflineTrade.tsx` — manual trade logging form (member selectors, pillar picker, description)
- All three wired into `StewardDashboard.tsx` as collapsible sections below NeedsRadar

**Schema bugs discovered and fixed during tsc compilation:**
- `tradeCompletions` table has no `nodeId` or `listingId` columns — Express routes had silent runtime bugs
- Log-offline-trade now skips TradeCompletion creation (requires `matchId` NOT NULL, no match exists for manual trades)

**Build:** `tsc -b && vite build` — zero errors, 70 modules, 332 KB JS

**Status:** Bones review PENDING. Worf review PENDING (serverless security boundary).

## 2026-07-09 — ORDER 007 Session 1 (COMPLETE — superseded by 007b)
**Cell Steward Dashboard + Batch Jobs — backend complete, frontend built, not yet Bones-reviewed**
- 5 API routes: `/steward/dashboard`, `/steward/isolates`, `/steward/hubs`, `/steward/network-summary`, `/steward/log-offline-trade`
- Batch jobs: `NetworkPhaseSnapshot` (June Holley four-phase) + `InternalForecast` (listing/connection velocity)
- `StewardDashboard.tsx` — NeedsRadar, NetworkSummary, MemberRow (inline sub-components)
- 9 steward TypeScript types, 5 stewardApi methods
- **Status:** Bones review PENDING. IsolateList, HubList, LogOfflineTrade now completed in 007b.

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
