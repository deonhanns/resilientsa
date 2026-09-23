# MISSION STATUS
**Mission:** ResilientSA
**Custodian:** Spock
**Status:** ACTIVE — build phase. Core loop live end-to-end. **As of 2026-09-20: ORDER 011 §4.2 COMPLETE and CRIT-001 CLOSED — RLS is enforced on the application's connection identity in Production, proven by the live application gate (`verify-rls-live.ts`, exit 0 on two runs). ORDER 012 COMPLETE — the Marketplace browse route that had never worked against real data now returns 200 with the correct payload. `POSTGRES_URL_APP` is set on both Preview and Production. ORDER 010 closed. Production healthy.**

---

## CURRENT PHASE

**Build phase — core loop live end-to-end**, and since 2026-09-12 the routing layer underneath it actually works: ORDER 010's catch-all depth fix shipped, which is what made the steward dashboard and the admin member routes reachable at all. A real Playwright login through the UI is re-verified regularly as the live test (most recently 2026-09-19, against both Production and Preview).

**Crew configuration note — CORRECTED 2026-09-19.** This section previously read "O'Brien has been offline (out of credits) since 2026-08-31, indefinite", which stopped being true on **2026-09-11** and was 9 days stale. `AGENTS.md` carries the authoritative note: the interim arrangement is **historical**, O'Brien resumed 2026-09-11, and Spock has since re-entered execution only for schema/connection-layer decisions reserved by Rule #3 (e.g. ORDER 011 §4.2).

**Verification-integrity findings from this period, recorded because they change how much confidence earlier "verified" claims deserve:**

1. **CRIT-001 — a false compliance record, now CLOSED.** RLS was enabled on every table but enforced on none — the app connected as a role carrying `BYPASSRLS` — from 2026-07-02 onward. The POPIA checklist item for `coop_pii` read PASS while being functionally false. **CLOSED 2026-09-20:** the enforcement mechanism is now verified live twice against Production; the one part that is *not* yet provable — `coop_pii` rows, because those tables are still empty pre-pilot — is stated explicitly in `AGENTS.md` rather than ticked away.
2. **`tsc -p api/tsconfig.json --noEmit` checks nothing at all** (confirmed 2026-09-19 with a deliberate canary error; the config-level `TS5107` short-circuits file checking). Every past "api typecheck clean" claim was vacuous, and neither the build nor Vercel typechecks `api/`. **Evidence added 2026-09-20:** with `--ignoreDeprecations 6.0` it *does* check `api/` and reports 28 errors, **all** `TS6059` rootDir config noise and **zero** real type errors — so this is a tsconfig fix, not a code cleanup. With Scotty.

**Third finding, added 2026-09-20 — a bug that hid behind an empty table.** `GET /api/marketplace/offerings` emitted malformed SQL (a stray `on` before `where`) and 500'd on every request. It was structurally invisible for as long as `programme_offerings` was empty, because the query sat behind an `if (offeringIds.length > 0)` guard: with no offerings the branch never ran and the endpoint returned an empty list *successfully*. Build, typecheck, route smoke tests and two Bones reviews all passed over it. It only surfaced when the ORDER 011 §4.2 gate began probing the full route set against a database that by then had rows. **Fixed 2026-09-20 (ORDER 012).** The general lesson is recorded here because it will apply again: **a green check against an empty table is not a green check.**

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
| 007 | Cell Steward Dashboard + Batch Jobs | O'Brien | ✅ BUILT + SHIPPED (incl. ORDER 007b). Bones: `NEEDS REVISION` → **upgraded to CONDITIONAL PASS** on live re-review |
| 008 | Community Marketplace | O'Brien | ✅ BUILT + SHIPPED. Bones: `CONDITIONAL PASS` (2026-09-10) — **still needs a live look with real data, which only became possible 2026-09-20.** Browse 500 fixed by ORDER 012 |
| 009 | Notifications (SMS + WhatsApp) | O'Brien | ⬜ QUEUED — draft written and marked NOT IN FORCE. Blocked on the POPIA ruling on unsolicited invites + AT sender-ID registration (long lead time). **The former 009a blocker is gone** |
| 009a | Node & Cell Formation | O'Brien (executed by Spock, interim) | ✅ **BUILT + SHIPPED 2026-09-10/11.** See the corrected section below — this file claimed for ten days that it was unspecified |
| 010 | ⚠ **number reused** — Crisis Mode + Resource Map was the plan; the ORDER 010 actually issued was the **catch-all routing depth** fix | O'Brien | ✅ COMPLETE (routing fix) — live-verified 2026-09-12, smoke test 15/15, `760fb60`. **Crisis Mode remains unbuilt and now needs a fresh number — Spock to confirm** |
| 011 | RLS context never reached queries | Spock (§4.2) / O'Brien | ✅ **COMPLETE 2026-09-20** — §3 cause confirmed live (`BYPASSRLS`, which FORCE RLS cannot override); §4.1 fixed (31 call sites); §4.3 test rewritten two-sided; §4.2 redesign approved 2026-09-18, all six rollout steps executed and verified, live application gate **exit 0 twice against Production**. Step 7 (A3 drops) is deferred hardening. **CRIT-001 CLOSED** |
| 012 | Marketplace browse 500 | O'Brien | ✅ **COMPLETE 2026-09-20** — malformed raw-SQL join replaced with a typed Drizzle join; verified live on Production against 5 real offerings (200, correct payload, filters' positive *and* negative paths working); the gate's `KNOWN_DEFECTS` exemption removed after the self-retiring mechanism reported it STALE |
| 013 | Routing depth gaps (Trade Exchange + Marketplace) and Node Admin discoverability | O'Brien | 🟡 **IN PROGRESS — stopped for a sequencing decision.** §2 audit found **12 unreachable routes, not 2** (10 additional, incl. the whole `/api/matches` set and a new shape: a 1-segment route cannot live in a 2-segment `[op]/[cellId]` file). A correct per-depth fix costs **16 functions vs the Hobby limit of 12**. Option (a) `[[...path]]` tested and **refuted**. The plain-file design — one non-dynamic file per domain, dispatching on method + query — tested and **works**, landing at **11 functions**. Awaiting the Captain/Spock decision on that design vs a Pro upgrade. Part B (BN-LIVE-01/02) shippable independently. See `OBRIEN_STANDUP.md` |

---

## ORDER 009a — CORRECTED 2026-09-20: IT IS BUILT AND SHIPPED

**This section previously read "NEW FINDING — ORDER 009a NOT YET SPEC'D… Not yet spec'd — needs a dedicated bridge session. Captain sign-off pending." That was false.** ORDER 009a was specified, built and shipped on **2026-09-10/11** (Spock executed it during the interim period); `CREW_ORDERS/CREW-ORDER-009a.md` exists, the NodeAdmin surface exists, and `createNode` / cell assignment / role escalation were all built and reviewed. The spec session this file was waiting for had already happened. Left uncorrected, it was actively misleading: anyone reading it would have queued work that was already done.

**What 009a actually resolved:** the finding it was written against — that *"there is no product path anywhere in the code to create a node, create a cell, assign a Cell Steward, or grant `node_admin`"* — no longer holds. Those paths now exist.

**What remains genuinely open from 009a** (from Worf's 2026-09-11 second-eyes review — recorded here as still-open, not re-verified since):

- **MED-002** — `createNode` is a non-atomic check-then-act (Medium)
- **MED-003** — stale steward pointers and silent role clobbering (Medium)
- **MED-004** — no audit trail on role changes (Medium)
- **MED-005** — the only `regional_steward` can demote themselves (Medium)
- **LOW-006 / LOW-007** — inconsistent RLS usage in the same file; stale README claim in the security record (Low)

**And one Bones item:** ORDER 009a's NodeAdmin review returned **NEEDS REVISION**. Its CRITICAL finding (BN-LIVE-06, *"the steward and admin APIs are unreachable in production"*) was a symptom of ORDER 010's routing bug and is **resolved** — those routes reach their handlers now (smoke 15/15). The remaining item is navigation: at the time of that review the rendered nav contained **only** `/trade`, `/support`, `/steward`, so a `node_admin` or `regional_steward` had **no in-app path** to `/admin` and would have to type the URL. Whether that has since changed is **not** confirmed here — it needs the re-review, not an assumption.

The original sequencing rationale still stands for ORDER 009: invites are meaningless without a real node/cell to invite someone into — and that precondition is now met.

---

## WHAT IS LIVE

`https://resilientsa.vercel.app` (resolves, 200). Production and Preview now run the same code after the 2026-09-20 ORDER 011/012 merges.

- ✅ Auth (SMS OTP → session token) — live-verified end-to-end 2026-09-10
- ✅ Gifts Profile (three-question sequential) — live-verified
- ✅ Trade Exchange (listings, matches, fairness, offline outbox) — live-verified, `/api/me` cellId fix applied
- 🟡 Cell Steward Dashboard (backend + UI both built, incl. IsolateList/HubList/LogOfflineTrade) — Bones `CONDITIONAL PASS` after live re-review; conditions outstanding
- 🟡 Community Marketplace (backend + UI both built; grounder identity resolved) — Bones `CONDITIONAL PASS` with a live look **still outstanding**; browse now returns real data (5 offerings) as of 2026-09-20
- ✅ Node / Cell / Steward formation — **built (ORDER 009a)**, routes reachable since ORDER 010. Open: no in-app nav path to `/admin`
- ❌ Notifications (ORDER 009 not started — blockers are the POPIA invite ruling + AT sender-ID, **not** 009a)
- ❌ Crisis Mode (never built; the ORDER 010 number was consumed by the routing fix)
- 🟡 Bottom navigation — `BottomNav` shipped 2026-09-10 for `/trade`, `/support`, `/steward`. (An earlier version of this file claimed those routes had *no* UI to move between them; the live Bones pass confirms the reverse — the nav is present and renders those three. The gap is `/admin`, which the nav does not include)

Prototype (McCoy): `design/prototype-v1/ui_kits/resilientsa-app/index.html`

---

## OPEN ITEMS

| Item | Priority | Status |
|---|---|---|
| **Dead "Match a member" control (`BN-LIVE-07`)** — a steward-only button that silently does nothing: its `onClick` is a prop and the only caller passes `() => {}`. Whether it needs wiring or removal is undecided (draft §3). **Recorded, not fixed.** | 🔴 Immediate (Bones-relevant) | Draft filed: [`CREW_ORDERS/CREW-ORDER-DRAFT-inert-match-member-button.md`](CREW_ORDERS/CREW-ORDER-DRAFT-inert-match-member-button.md:1); logged as `BN-LIVE-07` in [`BONES_VERDICT.md`](BONES_VERDICT.md:1). Needs Spock to issue + a product decision |
| **ORDER 008 Marketplace — live Bones look, with data** | 🔴 Immediate | `CONDITIONAL PASS` was given without a working data path, and Bones' own live pass said the browse *"cannot have been judged against one by any reviewer at any point."* A path now exists (5 real offerings, correct payload, verified 2026-09-20). This is finally doable |
| **ORDER 009a NodeAdmin — Bones re-review** | 🔴 Immediate | `NEEDS REVISION`; the CRITICAL BN-LIVE-06 was ORDER 010's routing bug (fixed) — re-check the nav/`/admin` gap and re-issue |
| **ORDER 007 StewardDashboard — Bones** | 🟡 Conditions | Verdict on file: `CONDITIONAL PASS` (upgraded from `NEEDS REVISION` on live re-review). Outstanding conditions to close, not a fresh review |
| **api-typecheck gap** — `tsc -p api/tsconfig.json` checks no files at all without `--ignoreDeprecations` | 🔴 Immediate | With Scotty. Evidence 2026-09-20: under `--ignoreDeprecations 6.0` it *does* check `api/` — 28 errors, all `TS6059` rootDir noise, **zero real errors**. Fix is a tsconfig change, not code cleanup |
| **ORDER 012 follow-ups** | 🟡 Documented | The join is fixed and the exemption is gone. Two things noted, **deliberately not changed** (they are product decisions, not this bug): the endpoint applies `limit(50)`, which ORDER 008 §6.1.1 does not specify; and the active/verified **exclusion** path could not be tested at all — there are zero non-active offerings and zero from unverified grounders, so no data exists to exclude |
| **MED-007** — two client routes unroutable by construction | 🟡 Needs order | Trade Exchange feed can never show real listings; grounder lookups cannot be live-tested |
| **ORDER 009a Mediums** — MED-002/003/004/005, LOW-006/007 | 🟡 Open | From Worf's 2026-09-11 review; not re-verified since (detail in the 009a section above) |
| Assign Captain's test user a real `cellId` | 🟡 Quick | Not done — needed to see a populated Trade Exchange feed |
| AT sender-ID registration (real SMS, not `OTP_DEBUG_LOG`) | 🟡 Should start now, long lead time | Not started — Captain action, SA mobile network lead time is days–weeks |
| Afrikaans professional translation review | 🟡 Pre-production | Deferred |
| Facebook page live | 🟡 Captain action | Copy ready in `docs/facebook-page-copy-v1.0.md` |
| First Cape Town RA/CPF relationship | 🟡 Captain action | After Bones-approved prototype shown |
| SEDA outreach | 🟡 Captain action | Held pending pilot evidence |
| Cooperative Formation backend build | Phase 2 | Deferred |
| Network Health full graph visualisation | Phase 2 | Data substrate built in ORDER 007 |
| Voice/USSD interface | Phase 2 | Not started |
| Node Admin dashboard | Phase 2 | Deferred post-pilot — entangled with the ORDER 009a findings above |
| ~~ORDER 011 §4.2 rollout step 4~~ | ✅ Resolved 2026-09-20 | Preview var set 2026-09-19, Production 2026-09-20; both redeployed and gate-verified (exit 0). §4.2 closed |
| ~~Wire in BottomNav~~ | ✅ Resolved 2026-09-10 | Shipped for `/trade`, `/support`, `/steward` |
| ~~Hardcoded Neon credential in `test-listings-api.ts`~~ | ✅ Resolved 2026-09-10 | Removed from source; old password rotated/inert; string remains in git history only |
| ~~`POSTGRES_URL_APP` in the Restricted Files list?~~ | ✅ Resolved | Now listed in `AGENTS.md` Rule #2's restricted-files set |

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

**CORRECTED 2026-09-19. This section previously read "None Critical/High currently open." It was wrong, and wrong in the most misleading direction.** Updated 2026-09-20: CRIT-001 has moved to CLOSED on live evidence.

| ID | Severity | Finding | Where |
|---|---|---|---|
| **CRIT-001** | ~~Critical~~ **CLOSED 2026-09-20** | RLS was enabled but **not enforced** from 2026-07-02 — the app connected as `neondb_owner`, which carries `BYPASSRLS`. **CLOSED:** the app now connects as `resilientsa_app` (superuser=false, **bypassrls=false**) and the live gate passed against Production twice — real context = 10 users visible, fabricated context = 0, no context = 0 without raising. **Residual, deliberately not ticked away:** `coop_pii` is still empty pre-pilot, so enforcement *on its rows* is not yet demonstrable with data. | [`WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md`](WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md:1) §3; [`scripts/verify-rls-live.ts`](resilientsa-app/scripts/verify-rls-live.ts:1) |
| **CRIT-002** | Critical | `POST /api/auth/request-code` returned Drizzle's `err.message` — SQL **plus bound parameters**, one being the plaintext OTP — to an **unauthenticated** caller. **FIXED, deployed, live-verified A/B** on 2026-09-15. | [`WORF_ALERTS/2026-09-15-live-incident-order011-section42-app-role-breakage.md`](WORF_ALERTS/2026-09-15-live-incident-order011-section42-app-role-breakage.md:1) §3.5 |
| **CRIT-003** | Critical | §4.2's original rollout made the application completely non-functional, **login included**. Superseded by the approved split-identity redesign, which rolled out 2026-09-19/20 and passed its gate. | same alert, and [`ENGINEERING_ESCALATIONS/2026-09-15-order011-section42-app-role-unviable.md`](ENGINEERING_ESCALATIONS/2026-09-15-order011-section42-app-role-unviable.md:1) |
| **CRIT-004** | Critical | The app resolves `POSTGRES_URL`, not `DATABASE_URL` — misdocumented from the project's start, and the direct cause of the 2026-09-14 confusion. **Doctrine corrected by Spock**, commit `58c1884`. | `AGENTS.md` Rule #2 |
| **HIGH-005/006** | High | Policies raised `42704` instead of filtering when context was absent; 5 further tables had RLS with **no policy** (deny-all). **Both remediated**: A1 made 20 policies NULL-tolerant, A2 gave the 5 tables real policies (zero-policy tables 5 → 0), and A1-revisions removed the last 23 unguarded `::uuid` casts. | ORDER 011 §4.2 steps 1–2 + A1-revisions |
| **MED-002 / 003 / 004 / 005** | Medium | `createNode` non-atomic check-then-act; stale steward pointers + silent role clobbering; no audit trail on role changes; sole `regional_steward` can self-demote. Recorded 2026-09-11, not re-verified since. | [`WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md`](WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md:1) |
| **MED-007** | Medium | Two client routes are unroutable by construction, so the Trade Exchange feed can never show real listings and the grounder lookups cannot be live-tested. Needs its own order. | ORDER 010 §5 rule 2 |

***Not*** accepted risk: **CRIT-001**. It was never a tolerated finding, and as of 2026-09-20 it is **closed** — evidence in the row above, with the one caveat that remains open (`coop_pii` rows) stated rather than absorbed.

---

## NEXT

1. **Bones, live, with data** — the two that could never properly be done: the ORDER 008 Marketplace screen (a working data path now exists for the first time: 5 real offerings, verified 2026-09-20) and the ORDER 009a NodeAdmin re-review (BN-LIVE-06 is fixed; the `/admin` nav gap is the open question).
2. **Scotty: the api-typecheck gap** — every agent reading these records believes that command can fail. It cannot. Evidence attached above: the fix is `--ignoreDeprecations 6.0` plus a `rootDir`, not a code cleanup.
3. New order for **MED-007** (two unroutable client routes).
4. Work the **ORDER 009a Mediums** (MED-002/003/004/005) or explicitly accept them — currently open and unowned.
5. **ORDER 009 (Notifications)** — now blocked only on the POPIA invite ruling + AT sender-ID registration. Then Crisis Mode under a fresh order number.
6. Optional but noted: the `limit(50)` on the Marketplace browse, and whether the cooperative-PII `coop_pii` enforcement needs a data-backed test before pilot PII lands.

---

*Last updated: 2026-09-20 (O'Brien — full ground-truth refresh, Captain-directed. This file still described ORDER 009a as an unspecified open finding ten days after it shipped, claimed the Bones reviews were "not yet done" when verdicts were on file, described the app's navigation as absent when Bones' live pass had confirmed it, and carried a build-sequence table missing both 009a and 012. Corrected in full rather than patched. Spock retains custody; anything marked ⚠ or needing a decision is Spock's, not O'Brien's.)*
*Next update: on the next Bones verdict, or when a new order is issued*
