# CREW ORDER — 012
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-012
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY
**Date issued:** 2026-09-20
**Severity:** High — user-facing feature completely broken; confirmed unrelated to and non-blocking for CREW-ORDER-011 (now closed)
**Source:** Discovered by O'Brien during CREW-ORDER-011 §4.2 step 5, once the live gate began probing the full client route set instead of a hand-picked subset. Diagnosis, evidence, and fix options below are O'Brien's own work from `CREW_ORDERS/CREW-ORDER-012-DRAFT-marketplace-browse-500.md` (2026-09-19), formally issued here with the fix approach specified.

---

## 1. The defect

`GET /api/marketplace/offerings` returns **500 on Production**, with or without query parameters. The Community Marketplace browse screen cannot load data for any user.

Measured live, same session token, same moment, both environments:

| Environment | `/offerings` | `?pillar=water` | `?search=a` |
|---|---|---|---|
| Production (privileged owner connection) | 500 | 500 | 500 |
| Preview (app role, Part B) | 500 | 500 | 500 |

**Confirmed unrelated to ORDER 011:** identical failure under both connection identities. The error is Postgres `42601` — a syntax error raised at parse time, before any row-security policy is ever evaluated. A `BYPASSRLS` role cannot be affected by RLS by definition, so this predates and is independent of everything in that order.

## 2. Root cause

[`resilientsa-app/api/marketplace/[...path].ts:100`](resilientsa-app/api/marketplace/[...path].ts:100) — the join predicate is written into the **table** argument, and an **empty** `sql` template is passed as the join condition:

```ts
.innerJoin(
  sql`offering_engagements oe ON ${offeringEndorsements.engagementId} = oe.id`,
  sql``                            // <- empty join condition
)
```

Drizzle emits a stray `on` with nothing after it, then `where` — Postgres raises `42601` on the malformed statement.

**Why this went undetected:** the query only runs inside `if (offeringIds.length > 0)`. With zero rows in `programme_offerings`, the branch is skipped and the endpoint returns an empty list successfully — so every test and every demo against an empty database has looked correct. It fails from the first real offering onward.

## 3. Fix — specified, not left to choice

Use the proper typed Drizzle join, not a second raw-SQL variant:

```ts
.innerJoin(offeringEngagements, eq(offeringEndorsements.engagementId, offeringEngagements.id))
```

This matches the join style used elsewhere in this codebase's typed queries and keeps the relationship reviewable and refactor-safe, rather than trading one raw-SQL join shape for another.

**While in this function, also verify** (per ORDER 008 §6.1's original intent, which this bug may have silently defeated the same way it defeated the empty-database case): does the browse query correctly filter to *active* offerings from *verified* grounders only? If the existing `WHERE`/join logic already does this correctly once the join itself is fixed, no further change is needed — just confirm it, don't assume it.

## 4. Verification requirements

- **A green build proves nothing here — this bug shipped past every prior build check.** Reproduce first against a deployment with **at least one real offering present**, authenticated, live.
- Confirm the fix on **Production**, not Preview only — this is a live, user-facing path independent of any environment split.
- **Bones:** `BONES_VERDICT.md`'s ORDER 008 `CONDITIONAL PASS` already carries O'Brien's addendum noting this screen could not have been judged against a working data path. No further Bones action required by this order, but the live Bones re-review already queued for ORDER 008 should specifically re-check this screen once real offerings exist.

## 5. Closing this order — the self-retiring exemption

`scripts/verify-rls-live.ts`'s `KNOWN_DEFECTS` registry currently lists this route so it doesn't block the RLS gate. That registry is deliberately self-retiring: once this route stops 5xx-ing under an authenticated probe, the gate will report a **STALE EXEMPTION** and require its removal.

**This order is not complete until that entry is removed from `KNOWN_DEFECTS` in [`resilientsa-app/scripts/verify-rls-live.ts`](resilientsa-app/scripts/verify-rls-live.ts:80) and the gate is re-run to confirm it no longer needs the exemption at all.** Do not just fix the query and leave the exemption in place — that would let a future regression on this same route hide again exactly the way this one did.

---

## 6. MILESTONES

| # | Milestone |
|---|---|
| 1 | Join rewritten as a proper typed Drizzle join (§3) |
| 2 | Verified live against Production with at least one real `programme_offerings` row present — not just a clean build |
| 3 | Active/verified-grounder filtering confirmed correct (or fixed if it wasn't) per §3's secondary check |
| 4 | `KNOWN_DEFECTS` entry removed from `verify-rls-live.ts`; gate re-run and passes without needing the exemption |
| 5 | `npm run build` clean |
| 6 | Standup committed |

**Definition of order complete:** all 6 milestones verified, and the gate's own STALE EXEMPTION check confirms the registry no longer references this route.

---

## 7. REPORTING BACK

No escalation expected — this is a self-contained, precisely diagnosed bug with a specified fix. If the active/verified-grounder filtering in §3 turns out to be wrong in a way that changes what the Marketplace is supposed to show (not just how the join is written), stop and report before changing browse semantics — that would be a product question, not a bug fix.

---

*CREW ORDER 012 — Community Marketplace Browse 500*
*Issued by Spock, 2026-09-20. Diagnosis and evidence by O'Brien, 2026-09-19, adopted verbatim.*
