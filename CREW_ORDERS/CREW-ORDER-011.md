# CREW ORDER — 011
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-011
**Issued by:** Spock
**Status:** READY
**Date issued:** 2026-09-11
**Severity:** CRITICAL — every Row Level Security policy in the schema has been inert since ORDER 003 (2026-07-02)
**Source finding:** O'Brien, `WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md` (CRIT-001)

---

## 1. THE DEFECT, PRECISELY

[`api/_lib/db-context.ts`](resilientsa-app/api/_lib/db-context.ts):

```ts
export async function withRLSContext<T>(nodeId: string, role: string, fn: () => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_node_id', ${nodeId}, true)`)
    await tx.execute(sql`SELECT set_config('app.current_role', ${role}, true)`)
    return fn()
  })
}
```

`set_config(..., true)` sets the variable **only for the current transaction** — that's the whole point of the `true` (is_local) argument, established as deliberate in ORDER 005's standup. But `fn()` is called with **no arguments**, and every one of the ~20 call sites across `api/steward/`, `api/marketplace/`, `api/listings/`, `api/admin/` passes a closure that queries the **module-level `db`** import, not the `tx` handle that actually has the session variables set on it. Confirmed directly from source, not inferred.

The RLS variables are set on a transaction, then a completely different, un-configured connection runs the actual query. Every `app.current_node_id`/`app.current_role`-scoped RLS policy in the schema receives no value for those settings and — depending on how the policies are written — either denies everything or (more likely, given the app functions at all today) falls through to unrestricted access.

**Compounding factor, inferred but not yet live-confirmed** (this sandbox still cannot reach Postgres on port 5432 — see `OBRIEN_STANDUP.md` 2026-09-10 pt.5): the application likely connects as `neondb_owner`, the schema's table owner. PostgreSQL's default behavior exempts table owners from RLS entirely, regardless of whether policies exist or are correctly parameterized. If confirmed, this is a **second, independent** reason RLS has never been enforced — fixing the `tx` bug alone would not be sufficient.

**Why this matters specifically:** the `coop_pii` schema (`founding_members.id_number` and other POPIA-sensitive fields, per ORDER 003) was designed from the start to be RLS-restricted to `node_admin` only. The AGENTS.md POPIA compliance checklist item covering this would currently read PASS while being **functionally false**. That is worse than an acknowledged gap — it's a false compliance record, and it must be corrected in that checklist the moment this order lands, not left to imply protection that was never active.

---

## 2. WHY THIS HASN'T CAUSED VISIBLE HARM YET

No real Delft resident data exists in the system yet — this is pre-pilot. With exactly one Node active until CREW-ORDER-009a's bootstrap this week, there was no second tenant for a broken isolation boundary to leak data *to*. This is a real reason the defect is not yet urgent in the "stop everything" sense CREW-ORDER-010 is, but it is an absolute precondition that must be closed **before any real community member's data enters the system**, not after.

---

## 3. INVESTIGATION — CONFIRM THE OWNER-BYPASS CLAIM LIVE

Do not treat the owner-bypass as settled until confirmed. Once live database access exists (either this sandbox regains it, or O'Brien runs locally with `DATABASE_URL`):

```sql
SELECT current_user, session_user;
SELECT relowner::regrole FROM pg_class WHERE relname = 'founding_members';
-- If current_user matches the table owner, RLS is bypassed regardless of policy content or the tx bug.
SELECT relforcerowsecurity FROM pg_class WHERE relname = 'founding_members';
-- FALSE (or unset) confirms no FORCE RLS exists anywhere in the migrations, per O'Brien's grep.
```

---

## 4. FIX

### 4.1 The `tx` threading bug — fix regardless of what §3 finds
`withRLSContext`'s signature must pass `tx` into `fn`, and every call site must query `tx`, not the module-level `db`, inside that closure. This touches every route file listed in §1 — a mechanical but wide change. Do it as one coordinated pass, not file-by-file over multiple sessions, so there's no window where some routes are fixed and others silently aren't.

```ts
export async function withRLSContext<T>(
  nodeId: string, role: string, fn: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_node_id', ${nodeId}, true)`)
    await tx.execute(sql`SELECT set_config('app.current_role', ${role}, true)`)
    return fn(tx)
  })
}
```
Every call site's closure signature changes from `async () => { ... db.select() ... }` to `async (tx) => { ... tx.select() ... }`.

### 4.2 The owner-bypass, if §3 confirms it
Two options, in order of preference:
1. **Preferred: create a dedicated non-owner application role** with only the grants the app needs (SELECT/INSERT/UPDATE/DELETE on the relevant tables, no ownership), and switch `DATABASE_URL` to connect as that role. This is the durable fix and matches standard Postgres RLS practice — owners should never be the application's runtime identity.
2. **Faster interim: `ALTER TABLE ... FORCE ROW LEVEL SECURITY`** on every RLS-bearing table. This closes the owner-bypass without a connection-string change, but it's a narrower fix — still worth doing even if (1) also happens, since defense in depth here costs little.

Either way, this is a schema/connection change and stays with Spock per Rule #3 — O'Brien's review correctly did not attempt it.

### 4.3 Make it testable, not just trusted
Add an assertion to `scripts/verify-db.ts` (or a new dedicated script) that actually exercises RLS: as one node's context, attempt to read another node's `coop_pii` row, and assert it returns nothing. A schema-level guarantee that has never been exercised by a test is exactly how this stayed silently broken since July.

---

## 5. MILESTONES

| # | Milestone |
|---|---|
| 1 | §3's live query confirms or rules out the owner-bypass, before choosing between 4.2's two options |
| 2 | `withRLSContext` threads `tx` into every call site (§4.1) — grep confirms zero remaining closures referencing module-level `db` inside a `withRLSContext` call |
| 3 | Owner-bypass closed per whichever of 4.2's options §3 warranted |
| 4 | A real RLS-exercising test exists and passes (§4.3) — not just "the query ran without error," but "the cross-node read was actually denied" |
| 5 | AGENTS.md's POPIA checklist item for `coop_pii` RLS is corrected to reflect true state at each stage of this fix, not left reading PASS while any part of §4 remains open |
| 6 | `npm run build` clean after the `tx`-threading change across ~20 call sites |
| 7 | Standup committed, explicitly noting the date range during which RLS was inert (2026-07-02 → this order's completion) for the record |

---

## 6. REPORTING BACK

This order must be **closed before any real Delft resident's data is entered into the system**, independent of its position in any other work queue. If ORDER 009 (SMS invites) or real onboarding is about to proceed and this order isn't yet closed, that is a stop-the-line condition — escalate to Captain rather than proceeding.

---

*CREW ORDER 011 — RLS Context Never Reaches Queries*
*Issued by Spock, 2026-09-11, in direct response to O'Brien's CRIT-001 finding the same day.*
