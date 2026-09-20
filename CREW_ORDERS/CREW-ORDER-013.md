# CREW ORDER — 013
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-013
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY
**Date issued:** 2026-09-20
**Severity:** High — the Trade Exchange's core browse/post functionality is unreachable in Production, plus a discoverability gap on the Node Admin console
**Sources:** Combines `MISSION_STATUS.md`'s MED-007 (O'Brien) and `BONES_VERDICT.md`'s `BN-LIVE-01`/`BN-LIVE-02` (O'Brien, live Bones pass 2026-09-11) at Captain's direction, since both are the same category of problem — a real feature that exists in code but cannot be reached by the people meant to use it.

---

## 1. Part A — the routing gap, confirmed more severe than previously recorded

**Confirmed live, directly observed on Production, not theoretical:**

| Route | Segments | Result |
|---|---|---|
| `GET /api/listings` (bare — the Trade Exchange browse feed) | 0 | platform 404 |
| `POST /api/listings` (posting a new listing) | 0 | platform 404 |
| `GET /api/marketplace/offerings/mine` (grounder's own offerings) | 2 | platform 404 |

This means **the Trade Exchange feed has never been able to load real listings in production, and no member has ever been able to post one via this route.** Every "Be the first to offer something" empty state observed throughout this project's testing is consistent with this defect, not just with an empty database — the two are indistinguishable from the UI, which is exactly why this went unnoticed for so long.

Per `smoke-routes.ts`'s own documented rules (learned from CREW-ORDER-010 and this finding): **`[...path]` catch-alls match exactly one path segment, and never match depth 0 at all.** `api/listings/[...path].ts`'s design requires a depth-0 match for its root browse/post handler — a request shape this platform's catch-all mechanism cannot serve, ever, regardless of code correctness.

## 2. Part A — do not stop at these two: full audit required

This is the **third** time a route has hidden behind exactly this mechanism (CREW-ORDER-010's six routes, these two, and — per O'Brien's own generalization in the 2026-09-19 standup — the pattern is now understood well enough to sweep for comprehensively rather than rediscover piecemeal).

**Before fixing the two known instances, audit every `[...path].ts` catch-all in `api/` against both confirmed platform rules:**
1. Does any internal route inside it require a depth-0 match (a bare path with no segments after the catch-all's directory)?
2. Does any internal route inside it require 2+ segments?

Enumerate every catch-all (`auth`, `marketplace`, `matches`, `admin`, and any others) and every route each one dispatches internally, and report the full list of violations found — not just the two already known — before starting fixes.

## 3. Part A — fix pattern: reuse O'Brien's own steward consolidation, don't default to Path B's original per-route file count

CREW-ORDER-010's Path B specified one file per route, which You (O'Brien) improved on for the steward routes by using `api/steward/[op]/[cellId].ts` — one file, two named dynamic segments, internal dispatch on `op` — rather than four separate files. That was a better fix than what the order specified, and it should be the template here, not the literal four-separate-files instruction from 010.

For each violation found in §2, design the equivalent: real nested dynamic-segment files (never a `[...path]` catch-all) shaped to that domain's actual route tree, minimizing new function count the same way the steward fix did. **Work out the function-count math before writing any file**, same discipline as CREW-ORDER-010 §5 required — if it doesn't fit under the Hobby plan's 12, propose a consolidation (or flag the plan-upgrade question to Captain) before proceeding, don't discover the overage after building.

## 4. Part A — close the door on a fourth instance

Once the audit and fixes are complete, extend `smoke-routes.ts`'s `ROUTES` list to cover **every genuinely reachable client route**, including the ones currently worked around rather than tested (e.g. the `/api/listings/open` substitute currently standing in for the broken bare path). The list existing at all was the right instinct; it must now be exhaustive enough that a fourth hidden instance of this exact bug class cannot exist undetected. Since `verify-rls-live.ts` already imports this same list, fixing it here automatically strengthens that gate too.

---

## 5. Part B — `BN-LIVE-01`: `/admin` is unreachable by navigation (High)

Confirmed live by Bones' pass: the rendered app navigation contains only `/trade`, `/support`, `/steward`. There is no link to `/admin` anywhere. A `regional_steward` or `node_admin` has no in-app path to the console built specifically for them — they would need to already know the URL.

**Fix:** a conditional navigation entry, shown only to sessions whose role is `node_admin` or `regional_steward`, linking to `/admin`. Does not need to appear for `member`/`cell_steward` sessions, who have no use for it and for whom its presence would be confusing per Bones' "clear on first encounter" test.

## 6. Part B — `BN-LIVE-02`: `/admin`'s role gate can't distinguish failure types (Medium)

[`NodeAdmin.tsx`](resilientsa-app/src/components/admin/NodeAdmin.tsx)'s `/me` fetch treats any error — network failure, 401, 500 — identically, rendering the same `RoleGateMessage` ("This area is for Node and Regional coordination") regardless of cause. A legitimate `node_admin` hitting a transient failure sees the same message as someone who genuinely isn't authorized.

**Fix:** mirror the pattern already built for `/steward` (a specific branch for a 403/role-denial response, distinct from the generic error state). A non-403 failure should show the ordinary error state, not the role-gate message.

---

## 7. MILESTONES

| # | Milestone |
|---|---|
| 1 | Full catch-all audit complete and reported — every violation found, not just the two known ones |
| 2 | Function-count math worked out and confirmed ≤ 12 before any new files are added |
| 3 | Every violation from the audit fixed, using real nested dynamic-segment files, not `[...path]` catch-alls |
| 4 | `GET /api/listings` and `POST /api/listings` live-verified on Production returning real JSON, with at least one real listing present to confirm the browse path actually returns data, not just a non-404 |
| 5 | `GET /api/marketplace/offerings/mine` live-verified the same way, with a real grounder session |
| 6 | `smoke-routes.ts`'s `ROUTES` list extended to cover every genuinely reachable client route, including anything currently worked around |
| 7 | `/admin` navigation entry shipped, visible only to `node_admin`/`regional_steward` sessions, live-verified |
| 8 | `/admin`'s role gate distinguishes a real 403 from other failures, mirroring `/steward`'s existing pattern |
| 9 | `npm run build` clean |
| 10 | Standup committed, and `BONES_VERDICT.md` updated to reflect `BN-LIVE-01`/`BN-LIVE-02` closed |

---

## 8. REPORTING BACK

If the audit in §2 finds more than a small, containable number of additional violations, stop after reporting the full list rather than fixing everything in one pass — a large finding changes the shape and risk of this order and deserves a sequencing decision, not silent absorption into an order that assumed two known instances.

---

*CREW ORDER 013 — Routing Depth Gaps (Trade Exchange + Marketplace) and Node Admin Discoverability*
*Issued by Spock, 2026-09-20. Findings by O'Brien (routing) and O'Brien-as-Bones (navigation/role-gate), both 2026-09-11 and 2026-09-19.*
