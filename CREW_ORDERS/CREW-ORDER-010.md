# CREW ORDER — 010
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-010
**Issued by:** Spock
**Status:** READY
**Date issued:** 2026-09-11
**Severity:** CRITICAL — blocks ORDER 007's entire dashboard API and 2 of ORDER 009a's 11 milestones
**Source finding:** O'Brien, live route matrix against production, `OBRIEN_STANDUP.md` 2026-09-11 (cont. 3); full record in [`WORF_ALERTS/2026-09-11-catchall-routing-depth-failure.md`](WORF_ALERTS/2026-09-11-catchall-routing-depth-failure.md)

---

## 1. THE DEFECT, PRECISELY

Live against production, one-segment catch-all paths route correctly; two-segment paths do not:

| Route | Segments | Result |
|---|---|---|
| `GET /api/admin/nodes` | 1 | ✅ reaches handler |
| `GET /api/steward/dashboard/<cellId>` | 2 | ❌ platform 404 |
| `GET /api/steward/network-summary/<cellId>` | 2 | ❌ platform 404 |
| `GET /api/admin/members/<id>/cell` | 3 | ❌ platform 404 |
| `POST /api/trade-completions/<id>/confirm-fairness` | 2 (real nested file, not catch-all) | ✅ routes fine |

The last row is the diagnostic. A genuinely nested file at the same depth works. Only the `[...path].ts` catch-all mechanism fails past depth 1.

**Working hypothesis, not yet confirmed live — confirm first, per §3:** the root [`vercel.json`](vercel.json)'s explicit `functions` glob (`"resilientsa-app/api/**/*.ts": { "runtime": "@vercel/node@5.8.26" }`, added in Pattern 001 to pin the runtime version) interferes with Vercel's native catch-all segment capture. Pattern 006 already found this glob causes the captured param to arrive under the literal key `'...path'` instead of `'path'` — patched by checking both keys. That patch is necessarily incomplete if the *value* itself is also truncated to only the first path segment, which is exactly consistent with every symptom above: `nodes` (one segment) is captured correctly because there's only one segment to capture; `dashboard/<cellId>` is captured as `['dashboard']` with the cellId silently dropped, so every downstream check requiring a second segment (`p1`) fails and falls through to each handler's own 404.

**This also revises the causal record.** Commit `b3b68c0` (the demo-sentinel cellId fix) was real and correctly fixed, but its claim that this explained why every real user's `/steward` 404'd was incomplete — the dashboard is unroutable regardless of which `cellId` is sent. Both defects produced the same visible symptom. Log this correction in the next standup entry alongside the fix.

---

## 2. AFFECTED ROUTES

All currently unreachable in production:
- `GET /api/steward/dashboard/:cellId`
- `GET /api/steward/isolates/:cellId`
- `GET /api/steward/hubs/:cellId`
- `GET /api/steward/network-summary/:cellId`
- `GET /api/admin/members/:userId/cell` — wait, this is a PATCH, not GET (correcting): `PATCH /api/admin/members/:userId/cell`
- `PATCH /api/admin/members/:userId/role`

Confirmed still working (single segment, or genuinely nested non-catch-all files): `nodes`, `cells`, `members` (GET, list), `trade-completions/:matchId/confirm-fairness`, and by extension every other single-segment route across `auth`, `marketplace`, `matches`, `listings` catch-alls that this matrix didn't individually re-test but share the identical mechanism and depth.

**Do not assume any currently-untested 2+-segment route works.** Re-run the live matrix (§4) against the *whole* API surface, not just the routes already caught, before considering this order complete.

---

## 3. INVESTIGATION — CONFIRM BEFORE FIXING

Same discipline Pattern 006 established: confirm the mechanism live before choosing a fix, don't reason from the pattern library alone.

1. Add a temporary diagnostic (same technique as Pattern 006's original discovery) to one affected catch-all — return the raw `req.query` object in a 200 response instead of falling through to 404, for one deliberately-triggered request.
2. Hit `GET /api/steward/dashboard/some-fake-id` live and inspect the actual captured value. Confirm whether it's `['dashboard']` (segment truncated — confirms the hypothesis in §1) or something else entirely (wrong hypothesis — stop and re-diagnose, don't proceed to §5 on an unconfirmed cause).
3. Remove the diagnostic before any further commit.

---

## 4. LIVE VERIFICATION REQUIREMENT

`npm run build` passing is **not evidence this defect is fixed** — it wasn't evidence it existed, either. Every fix under this order must be confirmed with a live request against the deployed preview or production URL, not just a clean build. This is the standing gap O'Brien flagged: nothing in the current process (build, typecheck, source review, milestone tables) can catch a route that 404s only in production. Before closing this order:

- Live-test every route in §2, confirming a real (non-404) response
- Live-test at least the depth-1 routes in the same catch-alls, confirming no regression
- If time allows, write the smoke test O'Brien recommended: a small script under `scripts/` that hits every declared route live (with a valid or intentionally-invalid session as appropriate) and asserts it isn't a platform 404. This becomes a standing pre-deploy check, not a one-off for this order.

---

## 5. FIX PATHS — CHOOSE BASED ON §3's CONFIRMED CAUSE

### Path A (preferred if §3 confirms the `vercel.json` glob is the cause): fix the config, not the code
Investigate removing or narrowing the explicit `functions` glob in root `vercel.json`. Modern Vercel may no longer require the explicit runtime pin Pattern 001 needed in 2026-07 — API routes may auto-detect correctly without it now. This is the single-point fix: it repairs every catch-all at once, with no function-count cost.

**Required safety process, given this touches deployment config globally:**
1. Test on a **Vercel Preview deployment** (a branch push, not `main`) — never modify production `vercel.json` and push directly to `main` first.
2. Confirm the runtime still resolves correctly (Pattern 001's original failure: "Function Runtimes must have a valid version") before confirming the routing-depth fix.
3. Only merge to `main` once both are confirmed live on the preview URL.
4. If the runtime pin turns out to still be necessary, this path is blocked — fall back to Path B and say so plainly in the standup, don't force it.

### Path B (fallback): convert the affected routes to real nested files
O'Brien's proven-to-route precedent (`api/trade-completions/[match_id]/confirm-fairness.ts`) is a genuine nested dynamic-segment file, not a catch-all — and it works. Converting the six affected routes the same way:
- `api/steward/dashboard/[cellId].ts`
- `api/steward/isolates/[cellId].ts`
- `api/steward/hubs/[cellId].ts`
- `api/steward/network-summary/[cellId].ts`
- `api/admin/members/[userId]/cell.ts`
- `api/admin/members/[userId]/role.ts`

**Function-count math — work this out before starting, it doesn't fit as-is.** `api/steward/[...path].ts` has no remaining routes once all four are extracted — delete it (-1). Adding 4 new steward files (+4) and 2 new admin sub-route files (+2) against a current count of 8 gives **8 − 1 + 4 + 2 = 13** — one over the Hobby plan's 12-function limit. Before this path can ship, either:
- Consolidate one more existing single-file route into an existing catch-all to free a slot (candidate: `api/gifts-profile/me.ts` could fold into a new small catch-all, or `api/trade-completions/[match_id]/confirm-fairness.ts` could fold into the `matches` catch-all if its path shape allows), or
- Confirm with Captain whether upgrading off the Hobby plan is on the table (business decision, not an engineering one — don't decide this unilaterally)

---

## 6. MILESTONES

| # | Milestone |
|---|---|
| 1 | §3's diagnostic confirms (or corrects) the root-cause hypothesis, logged before any fix is written |
| 2 | Fix path chosen and justified in the standup based on §3's finding, not assumed in advance |
| 3 | If Path A: preview-deployment verified for both the original runtime-pin problem and the routing-depth fix, before merge to main |
| 4 | If Path B: function count confirmed ≤ 12 before the six new files are added, with the consolidation (or Captain's plan-upgrade decision) recorded |
| 5 | All six routes in §2 live-tested against the deployed environment, non-404 |
| 6 | No regression on any previously-working depth-1 route in the same catch-alls, live-tested |
| 7 | `b3b68c0`'s standup record corrected to note this defect was the actual (or additional) cause, per §1 |
| 8 | Bones re-review: ORDER 007's dashboard and ORDER 009a's member-assignment/steward-promotion UI can only be given a live verdict once this order lands — flag to Bones that their prior "conditional pass"/"needs revision" verdicts had a non-functional API underneath them |
| 9 | Standup committed |

---

## 7. REPORTING BACK

Triggers immediate Captain/Spock escalation if: Path A's preview test shows the runtime pin is still required (meaning the two problems can't both be solved by touching `vercel.json` alone) — don't spend extra time forcing it, report and move to Path B.

---

*CREW ORDER 010 — Catch-All Routing Depth Failure*
*Issued by Spock, 2026-09-11, in direct response to O'Brien's live-verification finding the same day.*
