# MISSION STATUS
**Mission:** ResilientSA
**Custodian:** Spock
**Status:** ACTIVE — build phase. Core loop live end-to-end. **As of 2026-09-19: ORDER 010 closed; ORDER 011 §3 and §4.1 done, §4.2 redesign approved and mid-rollout (steps 1–3 of 8 complete, deliberately stopped at the step-4 checkpoint). Production healthy and unchanged; the §4.2 Part B code is on a branch, deployed to Preview only.**

---

## CURRENT PHASE

**Build phase — core loop live end-to-end**, and since 2026-09-12 the routing layer underneath it actually works: ORDER 010's catch-all depth fix shipped, which is what made the steward dashboard and the admin member routes reachable at all. A real Playwright login through the UI is re-verified regularly as the live test (most recently 2026-09-19, against both Production and Preview).

**Crew configuration note — CORRECTED 2026-09-19.** This section previously read "O'Brien has been offline (out of credits) since 2026-08-31, indefinite", which stopped being true on **2026-09-11** and was 9 days stale. `AGENTS.md` carries the authoritative note: the interim arrangement is **historical**, O'Brien resumed 2026-09-11, and Spock has since re-entered execution only for schema/connection-layer decisions reserved by Rule #3 (e.g. ORDER 011 §4.2).

**Two verification-integrity findings from this period, recorded because they change how much confidence earlier "verified" claims deserve:**
1. **CRIT-001 was a false compliance record.** RLS was enabled on every table but enforced on none — the app connected as a role carrying `BYPASSRLS` — from 2026-07-02 onward. The POPIA checklist item for `coop_pii` read PASS while being functionally false.
2. **`tsc -p api/tsconfig.json --noEmit` checks nothing at all** (confirmed 2026-09-19 with a deliberate canary error; the config-level `TS5107` short-circuits file checking). Every past "api typecheck clean" claim was vacuous, and neither the build nor Vercel typechecks `api/`. See `OBRIEN_STANDUP.md` 2026-09-19.

**Git credentials:** Resolved 2026-07-19, still holding.

---

## BUILD SEQUENCE

| Order | What | Owner | Status |
|---|---|---|---|
| 001 | Clickable Prototype | McCoy | ✅ COMPLETE |
| 002 | Project Scaffold + Tokens + i18n | O'Brien | ✅ COMPLETE |
| 003 | PostgreSQL Schema | O'Brien | ✅ COMPLETE |
| 004 | Authentication | O'Brien | ✅ COMPLETE (live-verified end-to-end 2026-09-10) |
| 005 | Gifts Profile | O'Brien | ✅ COMPLETE (live-verified end-to-end 2026-09-10) |
| 006 | Trade Exchange | O'Brien | ✅ COMPLETE (live-verified 2026-09-10, `/api/me` cellId bug fixed) |
| 007 | Cell Steward Dashboard + Batch Jobs | O'Brien | 🟡 Built, deferred sub-components now shipped (ORDER 007b) — **Bones review still pending, now finally do-able against the live app** |
| 008 | Community Marketplace | O'Brien | 🟡 Built + schema fix delivered + live-verified (8/8 route checks pass) — **Bones review still pending** |
| 009 | Notifications (SMS + WhatsApp) | O'Brien | ⬜ QUEUED — draft written and marked NOT IN FORCE. Blocked on two Captain/Worf decisions: the POPIA ruling on unsolicited invites, and AT sender-ID registration (long lead time) |
| 010 | ⚠ **number reused** — Crisis Mode + Resource Map was the plan; the ORDER 010 actually issued was the **catch-all routing depth** fix | O'Brien | ✅ COMPLETE (routing fix) — live-verified 2026-09-12, smoke test 15/15, `760fb60`. **Crisis Mode remains unbuilt and now needs a fresh number — Spock to confirm** |
| 011 | RLS context never reached queries | Spock (§4.2) / O'Brien | 🟡 **IN PROGRESS** — §3 CONFIRMED live (the cause is `BYPASSRLS`, which FORCE RLS cannot override); §4.1 COMPLETE (31 call sites); §4.3 test added; §4.2 **redesign approved 2026-09-18**, steps 1–3 of 8 done 2026-09-19 — **stopped at the step-4 checkpoint** |

---

## NEW FINDING — ORDER 009a NOT YET SPEC'D

Discovered 2026-09-10 while tracing the dependency chain above cell assignment: **there is no product path anywhere in the code to create a node, create a cell, assign a Cell Steward, or grant `node_admin`.** Every signup is hardcoded into one placeholder node (`00000000-...0001`). Cells only exist via direct seed-script inserts. `/admin` is a literal unbuilt placeholder route.

**Proposed: ORDER 009a — Node & Cell Formation**, sequenced *before* ORDER 009's SMS invite work (invites are meaningless without a real node/cell to invite someone into). Not yet spec'd — needs a dedicated bridge session. Captain sign-off pending.

---

## WHAT IS LIVE ON VERCEL PREVIEW

`https://resilientsa.vercel.app`

- ✅ Auth (SMS OTP → session token) — live-verified end-to-end 2026-09-10
- ✅ Gifts Profile (three-question sequential) — live-verified
- ✅ Trade Exchange (listings, matches, fairness, offline outbox) — live-verified, `/api/me` cellId fix applied
- 🟡 Cell Steward Dashboard (backend + UI both built, incl. IsolateList/HubList/LogOfflineTrade) — Bones verdict still pending
- 🟡 Community Marketplace (backend + UI both built, grounder identity resolved) — Bones verdict still pending
- ❌ Notifications (ORDER 009 not started — blocked on 009a)
- ❌ Crisis Mode (ORDER 010 not started)
- ❌ Node/Cell/Steward formation (no product path exists — this is the 009a finding)
- ❌ Bottom navigation — `/trade`, `/support`, `/steward` are live routes with no UI to move between them; McCoy's `BottomNav` component exists in the design system but isn't wired into `App.tsx`

Prototype (McCoy): `design/prototype-v1/ui_kits/resilientsa-app/index.html`

---

## OPEN ITEMS

| Item | Priority | Status |
|---|---|---|
| Bones review — ORDER 007 StewardDashboard | 🔴 Immediate | Unblocked as of 2026-09-10 (live app now reachable) — not yet done |
| Bones review — ORDER 008 Marketplace | 🔴 Immediate | Unblocked as of 2026-09-10 — not yet done |
| ORDER 009a spec session (Node & Cell Formation) | 🔴 Immediate | Not yet spec'd — needs dedicated bridge session |
| **ORDER 011 §4.2 rollout step 4** — set `POSTGRES_URL_APP` on Preview | 🔴 Immediate (the one gated checkpoint) | **Awaiting Captain.** Sensitive value required; confirmation to Spock first per the approval. O'Brien ready |
| **api-typecheck gap** — `tsc -p api/tsconfig.json` checks no files at all without `--ignoreDeprecations` | 🔴 Immediate | Confirmed by canary 2026-09-19. Needs a real `npm run typecheck` gate — flagged to Scotty |
| Wire in BottomNav | ✅ Resolved 2026-09-10 | Shipped (standup 2026-09-10) |
| Assign Captain's test user a real `cellId` | 🟡 Quick | Not done — needed to see a populated Trade Exchange feed |
| AT sender-ID registration (real SMS, not `OTP_DEBUG_LOG`) | 🟡 Should start now, long lead time | Not started — Captain action, SA mobile network lead time is days–weeks |
| Hardcoded Neon credential in `test-listings-api.ts` | ✅ Resolved 2026-09-10 | Removed from source (swapped to `process.env.DATABASE_URL`); old password already rotated/inert; string remains in git history only |
| Afrikaans professional translation review | 🟡 Pre-production | After ORDER 010 |
| Facebook page live | 🟡 Captain action | Copy ready in `docs/facebook-page-copy-v1.0.md` |
| First Cape Town RA/CPF relationship | 🟡 Captain action | After Bones-approved prototype shown |
| SEDA outreach | 🟡 Captain action | Held pending pilot evidence |
| Cooperative Formation backend build | Phase 2 | Deferred |
| Network Health full graph visualisation | Phase 2 | Data substrate built in ORDER 007 |
| Voice/USSD interface | Phase 2 | Not started |
| Node Admin dashboard | Phase 2 | Deferred post-pilot — this is now entangled with the ORDER 009a finding |

---

## RECORD-KEEPING FILES

| File | Purpose | Updated by |
|---|---|---|
| `MISSION_STATUS.md` | Ground truth — current build state | Spock |
| `OBRIEN_STANDUP.md` | Session log — what O'Brien (or Spock, interim) built, blocked, flagged | O'Brien / Spock (interim) |
| `CHANGELOG.md` | What shipped per order — deployment record | O'Brien |
| `BONES_VERDICT.md` | Design gate verdicts | McCoy / Spock |
| `WORF_ALERTS/` | Security review verdicts | Worf |
| `SCOTTY_PATTERNS.md` | Engineering pattern library — Patterns 001–007 documented | Scotty / Spock (interim) |
| `ENGINEERING_ESCALATIONS/` | Blocked issue escalations | O'Brien → Scotty |
| `CREW_ORDERS/` | Engineering specs | Spock |
| `docs/` | Bridge documents — specs, strategy | Spock |

---

## WORF FLAGS — OPEN

**CORRECTED 2026-09-19. This section previously read "None Critical/High currently open." It was wrong, and wrong in the most misleading direction.**

| ID | Severity | Finding | Where |
|---|---|---|---|
| **CRIT-001** | Critical | RLS enabled but **not enforced** since 2026-07-02 — the app connects as `neondb_owner`, which carries `BYPASSRLS`. Closes only when ORDER 011 §4.2 rollout reaches step 6 and the live gate passes. | [`WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md`](WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md:1) §3 |
| **CRIT-002** | Critical | `POST /api/auth/request-code` returned Drizzle's `err.message` — SQL **plus bound parameters**, one being the plaintext OTP — to an **unauthenticated** caller. **FIXED, deployed, live-verified A/B** on 2026-09-15. | [`WORF_ALERTS/2026-09-15-live-incident-order011-section42-app-role-breakage.md`](WORF_ALERTS/2026-09-15-live-incident-order011-section42-app-role-breakage.md:1) §3.5 |
| **CRIT-003** | Critical | §4.2's original rollout made the application completely non-functional, **login included**. Superseded by the approved split-identity redesign. | same alert, and [`ENGINEERING_ESCALATIONS/2026-09-15-order011-section42-app-role-unviable.md`](ENGINEERING_ESCALATIONS/2026-09-15-order011-section42-app-role-unviable.md:1) |
| **CRIT-004** | Critical | The app resolves `POSTGRES_URL`, not `DATABASE_URL` — misdocumented from the project's start, and the direct cause of the 2026-09-14 confusion. **Doctrine corrected by Spock**, commit `58c1884`. | `AGENTS.md` Rule #2 |
| **HIGH-005/006** | High | Policies raised `42704` instead of filtering when context was absent; 5 further tables had RLS with **no policy** (deny-all). **Both remediated**: A1 made 20 policies NULL-tolerant, A2 gave the 5 tables real policies (zero-policy tables 5 → 0). | ORDER 011 §4.2 steps 1–2 |
| **MED-007** | Medium | Two client routes are unroutable by construction, so the Trade Exchange feed can never show real listings and the grounder lookups cannot be live-tested. Needs its own order. | ORDER 010 §5 rule 2 |

***Not*** accepted risk: **CRIT-001**. It is an open Critical finding, not a tolerated one.

---

## NEXT

1. **ORDER 011 §4.2 step 4** — Captain supplies `POSTGRES_URL_APP` for Preview; then step 5 = the gate (`verify-rls-live.ts`) against Preview, step 6 = Production, step 7 = A3 hardening, step 8 = AGENTS.md POPIA item → PASS and the order closes. **CRIT-001 closes at step 6.**
2. **Bones live reviews** for ORDER 007 StewardDashboard, ORDER 008 Marketplace and ORDER 009a — all three now *genuinely* testable, unlike the versions reviewed before ORDER 010 made those routes reachable. Note `b3b68c0`'s correction: ORDER 007's dashboard was broken until 2026-09-12.
3. **Scotty: the api-typecheck gap** — every agent reading these records believes that command can fail. It cannot.
4. New order for **MED-007** (two unroutable client routes).
5. `AGENTS.md`-adjacent: confirm whether `POSTGRES_URL_APP` belongs in the Restricted Files list once it exists.
6. ORDER 009 (Notifications) — needs the POPIA invite ruling + AT sender-ID; then Crisis Mode under a fresh order number.

---

*Last updated: 2026-09-19 (O'Brien — ground-truth refresh; this file was 9 days stale and contained a false "no open Criticals" claim. Spock retains custody; the items marked ⚠ above need Spock's confirmation, not O'Brien's.)*
*Next update: on ORDER 011 §4.2 step 4, or on the next Bones verdict*
