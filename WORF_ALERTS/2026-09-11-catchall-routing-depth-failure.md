# Alert: catch-all API routes only match ONE path segment — ORDER 007 dashboard API and two ORDER 009a routes are unreachable in production

**Date:** 2026-09-11
**Severity:** **Critical**
**Build/Spec Reviewed:** `CREW-ORDER-007` (§6.1 steward API) · `CREW-ORDER-009a` (§6.2 milestones 4–5). Discovered while running the Captain-directed **live adversarial probe** against [`api/admin/[...path].ts`](resilientsa-app/api/admin/[...path].ts:1).
**Protocol Violated (if any):** `CREW-ORDER-009a` §8 milestones 4 and 5 are recorded as built; `CREW-ORDER-007` §6.1.4 was recorded ✅ in the 2026-07-09 standup milestone table. Neither is reachable at runtime. Reference `AGENTS.md` — milestone tables must reflect what was **verified running**, not what is planned to exist (a lesson already written into `BONES_VERDICT.md` on 2026-09-10 and now demonstrated a second time).
**Reviewer:** O'Brien — live verification against production. **Not a Worf sign-off.**

---

## Finding

**Every Vercel catch-all function in this project (`api/*/[...path].ts`) matches exactly one path segment. Any request one segment deeper returns Vercel's platform 404 — the function is never invoked.**

This is not specific to administration. It was found on the admin routes and then confirmed platform-wide.

### Evidence — live request matrix against `https://resilientsa.vercel.app`

`401`/`403`/`200`/`405` = **reached the handler**. `404` with body `The page could not be found / NOT_FOUND` = **Vercel never routed it** (distinct from the handler's own `{"error":"Not found"}` JSON).

| Route | Segments under `/api` | Result | Reached handler? |
|---|---|---|---|
| `GET /api/auth/request-code` | 1 | 405 | ✅ |
| `GET /api/admin/nodes` | 1 | 401 / 200 (authed) | ✅ |
| `GET /api/admin/members` | 1 | 401 / 403 (authed) | ✅ |
| `GET /api/marketplace/offerings` | 1 | 401 | ✅ |
| `GET /api/me` | 0 (own file) | 200 | ✅ |
| `GET /api/gifts-profile/me` | 0 (own file) | 200 | ✅ |
| **`POST /api/trade-completions/<id>/confirm-fairness`** | **2 (nested non-catch-all file)** | **401** | ✅ **reaches handler** |
| `GET /api/admin/nodes/x` | 2 | **404 platform** | ❌ |
| `GET /api/admin/members/x` | 2 | **404 platform** | ❌ |
| **`GET /api/steward/dashboard/<cellId>`** | 2 | **404 platform** | ❌ |
| **`GET /api/steward/network-summary/<cellId>`** | 2 | **404 platform** | ❌ |
| **`GET /api/steward/isolates/<cellId>`** | 2 | **404 platform** | ❌ |
| **`GET /api/admin/members/<userId>/cell`** | 3 | **404 platform** | ❌ |
| **`PATCH /api/admin/members/<userId>/role`** | 3 | **404 platform** | ❌ |

The decisive row is `trade-completions`. It is **two** segments under the catch-all's own directory, i.e. three under `/api`, and it routes correctly — because it is a **static nested file**, not a catch-all. That isolates the defect to the catch-all mechanism rather than to path depth.

Confirmed authenticated as a valid `regional_steward` session (via a real OTP from `OTP_DEBUG_LOG`): the steward endpoints 404 identically. This is not an auth artefact.

### Root cause — consistent with SCOTTY_PATTERNS Pattern 006

`SCOTTY_PATTERNS.md` Pattern 006 already established that this project's explicit `functions` glob in the root `vercel.json` —

```json
"functions": { "resilientsa-app/api/**/*.ts": { "runtime": "@vercel/node@5.8.26" } }
```

— **bypasses Vercel's normal bracket-syntax parsing**, which is why the catch-all parameter arrives as the literal key `'...path'` instead of `'path'`. **This finding is the same root cause producing a second symptom:** under glob-based registration the `[...path]` file appears to be treated as a single-segment dynamic route, losing its catch-all semantics. Pattern 006's fix (reading both `req.query.path` and `req.query['...path']`) correctly addressed the parameter name and could not have addressed routing depth.

**Hypothesis, not yet proven:** the glob registration is the cause. It is testable — see recommended fix. I have not changed `vercel.json`.

---

## Impact — this is the serious part

**1. The entire ORDER 007 Cell Steward Dashboard API is dead in production.**
`dashboard`, `isolates`, `hubs`, `network-summary` and `log-offline-trade` are all `/<x>/<cellId>` paths and all return platform 404. **No steward has ever seen live dashboards.** The component falls back to its error state or to demo data, which is why this looked like a UI bug rather than a routing failure.

**2. It corrects the causal claim in commit `b3b68c0` (2026-09-11).** That commit fixed a real bug — `StewardDashboard.tsx` calling a demo-only sentinel `cellId` even in the real path — and its message states that because of it *"every real user hitting /steward got a 404."* That reasoning is incomplete: **`/api/steward/dashboard/<anyCellId>` 404s regardless of which id is sent.** Fixing the sentinel could not have made the dashboard load. Both bugs independently produce the same symptom, so the sentinel fix was necessary but was never sufficient, and the dashboard **is still broken today**. Anyone re-testing it will see a 404 and may conclude the earlier fix failed.

**3. Two of ORDER 009a's eleven milestones are unachievable.**
§6.2.4 member-to-cell assignment and §6.2.5 Cell Steward promotion — the two operations that are the *point* of the order — cannot be exercised by anyone, in any role, from any client. Milestones 4 and 5 are built as code, unreachable as product. The `NodeAdmin.tsx` member-assignment and "Make Cell Steward" UI will silently fail for every user, including both consoles that have never been rendered.

**4. Latent risk.** Any future route nested two levels under a catch-all will fail silently the same way, with no build or type error to catch it. That is the defect's real cost.

---

## Adversarial probe results — what PASSED

Recorded so the record is balanced. All four tests the Captain requested were attempted live; run against production with a real authenticated `regional_steward` session.

| # | Test | Result |
|---|---|---|
| 3 | `createNode` with an `initialAdminUserId` who already holds an admin role elsewhere | ✅ **PASS — live.** `HTTP 409` `{"error":"This user already holds an administrative role elsewhere"}`. **The node list was byte-identical before and after** (`diff` clean), proving a genuine no-op with no partial write. |
| — | Unauthenticated access to all 7 admin routes | ✅ **PASS** — every *reachable* route returns 401 `{"error":"Unauthorized"}` |
| — | Forged bearer token (`bogus-token-xyz`) on all 7 | ✅ **PASS** — 401 on every reachable route |
| — | **`demo-token` on all 7 routes** | ✅ **PASS — no backdoor.** 401 on every reachable route. This matters: [`src/lib/session.ts:33`](resilientsa-app/src/lib/session.ts:33) stores the literal string `'demo-token'` client-side, so an API that accepted it would have been an open door. It does not. |
| — | Role gates, live | ✅ **PASS.** As `regional_steward`: `GET /api/admin/nodes` → 200 (all nodes); `GET /api/admin/cells` → 403; `GET /api/admin/members` → 403; `POST /api/admin/cells` → 403. Confirms `node_admin`-only routes are correctly gated. |
| 1 | Cross-node cell assignment | ⛔ **NOT VERIFIABLE** — route unroutable (platform 404), and it is `node_admin`-gated which no account holds. |
| 2 | `setMemberRole` assigning `node_admin`/`regional_steward`/`grounder` | ⛔ **NOT VERIFIABLE** — as above. The strict allowlist is correct **in source** and is confirmed by the source review, but **cannot be exercised live**, so it remains source-verified only. |

**Honest statement of the security conclusion.** The role gates that *are* reachable are correctly enforced, and the duplicate-admin rejection is confirmed live. The two most dangerous operations — cross-node reassignment and role promotion — **fail closed** (unroutable, and gated behind a role nobody holds). So this defect is **not an exposure**; it is a *functionality* failure that also removes my ability to verify those two protections end-to-end. Cross-node rejection and the role allowlist therefore remain **unproven at runtime**, and must not be recorded as live-verified.

---

## Severity rationale — why Critical

Per the severity guide, Critical is *"PII exposed unencrypted, RLS disabled, API key hardcoded."* This is none of those, so it is Critical by the **spirit** of the guide rather than the letter, and I want that distinction explicit rather than hidden behind a label:

- Multiple features are **silently non-functional in production** while being recorded as built and, in one place, "live-verified".
- It is **platform-wide and recurring** — it will silently break every future nested catch-all route.
- It **invalidated a recent bug-fix claim**, so the mission's record is currently wrong about the dashboard being repaired.

If the Captain prefers to classify it High on the letter of the guide, the *action* is unchanged. Flagging the judgement rather than asserting the label.

---

## Recommended fix — needs a Crew Order (Spock, Rule #3 territory)

1. **Confirm the cause** by testing whether removing or narrowing the `functions` glob lets `[...path]` regain catch-all semantics. Do this on a preview deployment, not production.
2. **Best fix — stop relying on the catch-all for nested paths.** Convert the affected routes to explicit files, which are **proven to route**: `api/steward/dashboard/[cellId].ts`, `api/steward/network-summary/[cellId].ts`, and so on. `trade-completions/[match_id]/confirm-fairness.ts` is the working precedent already in this repo. This also reduces the blast radius of the function-count budget and makes each route independently addressable.
3. Alternative: fix the registration so catch-alls behave as catch-alls, then verify live before relying on it.
4. **Add a live route smoke test** to `scripts/` — hit each production route and assert it does not return the platform 404 page. Nothing in the current verification process (build, typecheck, source review) can detect this class of failure. That gap is why it survived two Bones reviews and six standup entries.
5. **Retract the claim in `b3b68c0`'s message** in the next standup entry, and correct any record implying the steward dashboard is repaired.

---

## Captain Notified

☒ Yes — 2026-09-11, in the session report accompanying this file. Critical severity exceeds the immediate-escalation threshold.

## Resolution

☒ **Open.** No code or configuration changed. This alert is a record only.

| Item | Owner | Status |
|---|---|---|
| Catch-all routing defect (platform-wide) | Spock → Crew Order | Open |
| ORDER 007 steward API unreachable | Spock → Crew Order | Open |
| ORDER 009a milestones 4–5 unreachable | Spock → Crew Order | Open |
| `b3b68c0` causal claim correction | O'Brien (next standup entry) | Open |
| Live route smoke test as a standing check | O'Brien (once ordered) | Open |
| Cross-node rejection + role allowlist runtime verification | nobody — blocked by this defect | Open |

## §3 UPDATE — 2026-09-12: mechanism CONFIRMED live; the original hypothesis is refuted in its mechanism

Verified on a Vercel **Preview** deployment — branch `probe/order-010-routing-diagnostic`, deployment `resilientsa-i9yvumhji-…`, status Ready. A temporary `?__diag=1` branch was added to the steward catch-all; it returns before any auth or segment logic, so if the function ran at all it would have answered.

**Depth 1 — `/api/steward/xyz?__diag=1` → HTTP 200, diagnostic fired:**
```json
{"url":"/api/steward/xyz?__diag=1&...path=xyz","rawQuery":{"__diag":"1","...path":"xyz"},
 "rawQueryKeys":["__diag","...path"],"pathValue":null,"dottedPathValue":"xyz",
 "pathIsArray":false,"dottedPathIsArray":false,"segments":["xyz"],"segmentCount":1}
```

**Depth 2 — `/api/steward/dashboard/fake-id?__diag=1` → HTTP 404, Vercel's HTML NOT_FOUND page. The diagnostic did NOT fire.** Depth 3 → 404.
**Control, same preview — `POST /api/trade-completions/x/confirm-fairness` → HTTP 401 (reached handler).**

### What this establishes

1. **It is NOT truncation.** §1 hypothesised the captured value was truncated to `['dashboard']` with the cellId dropped. Had that been true the function would still have been *invoked*, and my diagnostic — which responds before any auth or segment parsing — would have answered. It did not. A 2+ segment path matches **no route at all**; the function is never called, and the platform's own 404 page proves it.
2. **The catch-all is behaving as a single-segment dynamic route.** Depth 1 is delivered by Vercel *rewriting* the segment into a query parameter — visible in the captured `url` as `...path=xyz`. That parameter name is mangled (literal `'...path'`), which is exactly why Pattern 006's two-key fallback was needed to make even depth-1 work.
3. **The captured value is a plain string, never an array** (`Array.isArray` false at depth 1). Vercel is not performing multi-segment collection at all.
4. **The `functions` glob remains the prime suspect as the *cause*** — a mangled, single-segment rewrite is what you would expect if that glob's registration bypasses normal bracket-syntax parsing. But this experiment does **not** by itself prove causation; that needs the Path A test.

### New risk identified for Path A — must be verified both ways on preview

**The glob may be load-bearing for API *detection*, not merely for the runtime pin.** The API lives at `resilientsa-app/api`, not at a project-root `/api`, and there is **no root `api` symlink** (Pattern 001's symlink is gone from the repo). Vercel's filesystem auto-detection looks for `/api` *at the deployment root*. So removing the `functions` glob may de-register **every** API route rather than fix routing. Path A must therefore be tested on preview for both outcomes: (a) does the runtime still resolve, and (b) do the API routes still exist at all.

**Status:** §3 complete — cause confirmed and logged before any fix was written, per CREW-ORDER-010 §3 and milestone 1.

---

## §4 UPDATE — 2026-09-12: Path A TESTED on Preview and **REFUTED**. Converting to Path B.

Two variants, both deployed as real Vercel Preview builds, both probed live.

| Variant | Config change | Deploy | depth-1 route | **depth-2 route** | `/api/auth/request-code` |
|---|---|---|---|---|---|
| **A1** | glob kept, runtime pin replaced with `memory: 1024` | Ready | 401 ✅ | **404 platform ❌** | 405 ✅ |
| **A2** | `functions` glob **removed entirely** | Ready | 401 ✅ | **404 platform ❌** | 405 ✅ |

Nested non-catch-all control (`POST /api/trade-completions/x/confirm-fairness`) returned **401** on both, so both deployments were healthy.

### Findings

1. **The runtime pin is NOT required.** Both variants built and deployed Ready without `@vercel/node@5.8.26`. Pattern 001's runtime-version constraint is obsolete under Vercel CLI 59.1.3 for this project. `SCOTTY_PATTERNS.md` Pattern 001 should be corrected when this order closes.
2. **The `functions` glob is NOT the cause.** Removing it entirely leaves behaviour identical — depth-1 routes, depth-2 platform-404s. §1's hypothesis, and Path A's entire premise, is **refuted**.
3. **The detection risk I raised did not materialise.** With the glob gone the API is still auto-detected and every sampled route still works, so the glob is not load-bearing for detection either. Risk retired.

So the mechnanism is still not identified at root, but the **symptom is fully characterised**: only `[...path]`-style catch-alls are affected, they match exactly one segment, and genuinely nested files route correctly at any depth. That is enough to choose Path B on evidence rather than theory — which is what §3's discipline was for.

### Path B — the order's math is wrong, and it matters

§5 assumed a current count of **8** functions (→ `8 − 1 + 6 = 13`, one over the Hobby limit). The actual count is **9** — admin, auth, gifts-profile/me, listings, marketplace, matches, me, steward, trade-completions — confirmed two ways (files on disk, and Vercel's own build output listing `5 shown + 4 hidden`).

**So the order's six-file conversion yields `9 − 1 + 6 = 14` — two over the limit, not one.** §5 says that before Path B can ship, either an existing route must be consolidated to free a slot, or the Captain decides whether a plan upgrade is on the table (explicitly a business decision, not an engineering one).

**This is being flagged rather than decided unilaterally**, because §5's specified file list would now need *two* consolidations rather than the one it anticipated. There is a lower-risk design available that avoids both consolidations and needs no plan upgrade — raising it for confirmation rather than restructuring the order's specified file layout on my own initiative.

---

**O'Brien**
*Live verification, 2026-09-11, Captain-directed. Not a Worf sign-off — Worf has not reviewed this document.*
