# Alert: ORDER 009a role-escalation logic — second-eyes review, plus a Critical platform-wide RLS finding

**Date:** 2026-09-11
**Severity:** **Critical** (Finding CRIT-001, platform-wide) + Medium ×4 + Low ×2
**Build/Spec Reviewed:** `CREW-ORDER-009a` — [`resilientsa-app/api/admin/[...path].ts`](resilientsa-app/api/admin/[...path].ts:1) (7 routes), plus its session/RLS primitives
**Protocol Violated (if any):** `CREW_MANIFEST.md` Worf protocol — "PII fields must be encrypted at rest **(Cooperative Formation spec, Section 2)**"; AGENTS.md Critical Rule #8 (RLS on every table in both schemas); AGENTS.md POPIA checklist item "coop_pii access restricted to node_admin role only via RLS policy"
**Reviewer:** **O'Brien** — Captain-directed second-eyes review. **This is NOT a Worf sign-off.** Worf has not reviewed this document. Filed here because the Captain asked for a real record of its own rather than a standup note, given the severity.

---

## Purpose and scope

The Captain asked for a second pair of eyes on the platform's first role-*granting* surface — every prior gate only *checked* an existing role; this one grants roles and moves users between nodes. Four specific checks were requested. All four pass. Two unrelated defects in the same file, and one Critical platform-wide control failure that this file depends on, were found in the process.

---

## Checks requested by the Captain

| # | Check | Verdict |
|---|---|---|
| 1 | `setMemberRole` can never assign `node_admin`, `regional_steward` or `grounder` — only `cell_steward`/`member` | ✅ **PASS** |
| 2 | Every cross-node check actually rejects a target user in a different node than the caller's session | ✅ **PASS** |
| 3 | `createNode`'s "already an admin elsewhere" rejection can't be bypassed | ⚠️ **PARTIAL** — see MED-002 and MED-003 |
| 4 | `nodeId`/`cellId` always taken from session, never trusted from request body, on every route | ✅ **PASS** |

### Check 1 — `setMemberRole` allowlist — PASS

[`api/admin/[...path].ts:169`](resilientsa-app/api/admin/[...path].ts:169):

```ts
if (role !== 'cell_steward' && role !== 'member') {
  return res.status(400).json({ error: "role must be 'cell_steward' or 'member'" })
}
```

This is a **strict positive allowlist**, which is the correct construction. It is not a denylist, so it cannot be defeated by spelling variants, case differences, or a role added to the schema later. Non-string values (`null`, arrays, objects) fail both comparisons and 400. `node_admin`, `regional_steward` and `grounder` are all rejected. This matches `CREW-ORDER-009a` §6.2.5 exactly. No coercion or type-confusion hole found.

### Check 2 — cross-node rejection — PASS

Both mutation routes fetch the target and compare against the session node:

- `assignCell` — [`api/admin/[...path].ts:144`](resilientsa-app/api/admin/[...path].ts:144): `if (targetUser.nodeId !== session.nodeId) return { error: 'Forbidden', status: 403 }`
- `setMemberRole` — [`api/admin/[...path].ts:178`](resilientsa-app/api/admin/[...path].ts:178): same check, same status

Read routes are scoped rather than checked: `listCells` ([`:93`](resilientsa-app/api/admin/[...path].ts:93)) and `listMembers` ([`:125`](resilientsa-app/api/admin/[...path].ts:125)) both filter `eq(<table>.nodeId, session.nodeId)`.

Two things that make this stronger than it first appears:

1. **`session.nodeId` is read fresh from the database on every request**, not carried as a claim in the token — [`api/_lib/session.ts:20`](resilientsa-app/api/_lib/session.ts:20) joins `session_tokens` to `users` and selects `nodeId` live. A stale or forged token cannot carry a stale node.
2. `assignCell` also validates that the **target cell** belongs to the caller's node, and returns 404 rather than 403 for a cross-node cell ([`:146`](resilientsa-app/api/admin/[...path].ts:146)–[`:150`](resilientsa-app/api/admin/[...path].ts:150)) — correct, and it avoids leaking the existence of cells in other nodes.

**Caveat — important:** these checks are currently the *only* thing providing node isolation, because the database-level control is inert (CRIT-001). They are written correctly and consistently in the routes reviewed, so this is not an open door today. It is a missing backstop.

### Check 3 — `createNode` rejection — PARTIAL

The rejection itself is present and correct in the sequential case ([`:68`](resilientsa-app/api/admin/[...path].ts:68)):

```ts
if (['node_admin', 'regional_steward'].includes(targetUser.role ?? '')) {
  return res.status(409).json({ error: 'This user already holds an administrative role elsewhere' })
}
```

But it is **not atomic** and **not exhaustive**. See MED-002 and MED-003.

### Check 4 — session-sourced scope — PASS

No route accepts a `nodeId` from the request body. Verified route by route:

| Route | Scope source | Verdict |
|---|---|---|
| `GET /nodes` | `segment.session.nodeId` for the `node_admin` branch; `regional_steward` is deliberately unscoped | ✅ |
| `POST /nodes` | creates a new node; `createdBy` from `session.userId` ([`:73`](resilientsa-app/api/admin/[...path].ts:73)) — not from body | ✅ |
| `GET /cells` | `eq(cells.nodeId, session.nodeId)` ([`:93`](resilientsa-app/api/admin/[...path].ts:93)) | ✅ |
| `POST /cells` | `nodeId: session.nodeId` ([`:109`](resilientsa-app/api/admin/[...path].ts:109)) — body carries only `name` | ✅ |
| `GET /members` | `eq(users.nodeId, session.nodeId)` ([`:125`](resilientsa-app/api/admin/[...path].ts:125)) | ✅ |
| `PATCH /members/:id/cell` | `cellId` **is** accepted from body ([`:134`](resilientsa-app/api/admin/[...path].ts:134)) but is validated to belong to `session.nodeId` before use ([`:148`](resilientsa-app/api/admin/[...path].ts:148)) — correct | ✅ |
| `PATCH /members/:id/role` | target from URL path; node check before write | ✅ |

This is the strongest part of the implementation and it matches the pre-existing pattern in [`api/steward/[...path].ts`](resilientsa-app/api/steward/[...path].ts:56) and `api/marketplace/[...path].ts`.

---

## Findings

| ID | Severity | Finding |
|---|---|---|
| CRIT-001 | **Critical** | RLS is enabled but not enforced. `withRLSContext` sets context on a transaction handle its callers never use, **and** the app connects as the table owner with no `FORCE ROW LEVEL SECURITY`. Every RLS policy in the schema is currently inert. |
| MED-002 | Medium | `createNode` is a non-atomic check-then-act across three statements with no transaction and no row lock. Concurrent requests can create an adminless node. |
| MED-003 | Medium | `createNode` and `assignCell` leave stale `cells.steward_user_id` pointers, and `createNode` silently clobbers an existing `grounder`/`cell_steward` role. |
| MED-004 | Medium | Role grants and node/cell moves produce no audit record. |
| MED-005 | Medium | The sole `regional_steward` can irreversibly demote themselves via `createNode`. |
| LOW-006 | Low | `createNode` and `listNodes` omit `withRLSContext` while the other five routes use it — inconsistent, and would matter once CRIT-001 is fixed. |
| LOW-007 | Low | [`WORF_ALERTS/README.md`](WORF_ALERTS/README.md:35) states "No alerts filed yet" while four alerts exist. |

---

### CRIT-001 — RLS is decorative (Critical, platform-wide)

**This is not in ORDER 009a's diff. It is load-bearing for it**, which is why it is recorded here.

Two independent defects, either of which alone would disable RLS:

**(a) `withRLSContext` applies its context to a handle its callers never use.**
[`api/_lib/db-context.ts:12`](resilientsa-app/api/_lib/db-context.ts:12):

```ts
return db.transaction(async (tx) => {
  await tx.execute(sql`SELECT set_config('app.current_node_id', ${nodeId}, true)`)
  await tx.execute(sql`SELECT set_config('app.current_role', ${role}, true)`)
  return fn()      // fn() uses the module-level `db`, not `tx`
})
```

`set_config(..., true)` is **transaction-local** — the third argument scopes the setting to that transaction. But every one of the ~20 call sites passes a closure that queries through the module-level `db` import, not `tx`. Grepped and confirmed across `gifts-profile`, `listings`, `marketplace`, `steward` and `admin`: the pattern is identical everywhere. So the setting is written on one connection and the queries run on another. `db.transaction` appears **exactly once in the entire codebase** — this function.

**(b) There is no `FORCE ROW LEVEL SECURITY` anywhere.** `grep -rn "FORCE ROW LEVEL SECURITY" drizzle/migrations/` returns nothing. [`0001_custom_setup.sql:21`](resilientsa-app/drizzle/migrations/0001_custom_setup.sql:21)–`48` enables RLS on all 24 tables; `:54`–`:98` creates the `node_isolation` policies against `current_setting('app.current_node_id')`. In PostgreSQL, a table's **owner bypasses RLS unless `FORCE ROW LEVEL SECURITY` is set.** The application connects via `DATABASE_URL` as `neondb_owner` — the role that owns these tables (documented in the 2026-09-10 standup, which records rotating the `neondb_owner` password).

**Why matters:** the schema's isolation guarantees are being provided entirely by application-level `nodeId` filters. Those filters are present and correct in the handlers reviewed — but they are a convention, not a control, and nothing catches the next handler that forgets one. More seriously, the **`coop_pii` policy restricting founding-member data to `node_admin` is inert.** Any code path reaching `coop_pii` without an explicit role check would read founding-member PII. The AGENTS.md POPIA checklist item "coop_pii access restricted to node_admin role only via RLS policy" would be marked PASS on review while being **functionally false** — a false compliance record, which is worse than a known gap.

**Confidence and limits — stated deliberately.** Defect (a) is **proven from source**: the closure does not close over `tx`. The owner-bypass in (b) is **inferred**, with strong supporting evidence: if RLS were enforced, every unbounded query in the app — and `createNode`'s and `listNodes`' RLS-less queries, which demonstrably work — would fail on an unset `current_setting` or return zero rows. I could not confirm it directly: this sandbox cannot reach Postgres on port 5432 (documented, 2026-09-10 pt.5). **Live confirmation is required before this is treated as settled.**

**Recommended verification** (one-off, by Captain or locally with a real `DATABASE_URL`):

```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class WHERE relname IN ('users','cells','nodes','founding_members');
```

Expect `relrowsecurity = true` (confirming `ENABLE` landed) and `relforcerowsecurity = false`. Then confirm the connecting role: `SELECT current_user, session_user;` — if it is the table owner, RLS does not apply to it.

**Recommended fix, in order:**
1. Pass `tx` into the closure — change the signature to `fn: (tx) => Promise<T>` and update all ~20 call sites. Mechanical, but touches five route files.
2. Set `FORCE ROW LEVEL SECURITY` on every table, **or** connect the app as a dedicated non-owner role with `GRANT`s and let the owner role be used only for migrations. The second is the conventional arrangement and the one I would recommend.
3. Add the verification query above as a check in `scripts/verify-db.ts`, which already exists — so this is testable rather than trusted.

**Not in scope of this review, and deliberately not fixed:** this is an architectural change to the data layer, it touches every route, and `AGENTS.md` Critical Rule #3 reserves schema changes to Spock. It needs a Crew Order.

**Escalation:** Critical. Per `CREW_MANIFEST.md`, Critical findings go to the Captain immediately. **Captain is being notified in this session's report.**

---

### MED-002 — `createNode` is a non-atomic check-then-act (Medium)

[`api/admin/[...path].ts:62`](resilientsa-app/api/admin/[...path].ts:62)–[`:78`](resilientsa-app/api/admin/[...path].ts:78) performs three statements with no transaction, no row lock and no unique constraint:

1. `SELECT` the target user's role
2. `INSERT` the node
3. `UPDATE` the user to `node_admin` + new `nodeId`

The Captain asked specifically whether a user already `node_admin` at one node can be re-targeted before that state is checked. Answer: **the check reads a snapshot, and nothing re-validates it before the write.** Two concurrent `POST /api/admin/nodes` requests naming the same `initialAdminUserId` can both observe `role = 'member'`, both pass the 409, and both insert a node. The user's `nodeId` ends up pointing at whichever `UPDATE` committed last, leaving **the other node with no `node_admin` at all** — which breaks the invariant `CREW-ORDER-009a` §1 establishes ("`regional_steward` creates Nodes and designates each Node's first `node_admin`"). There is no unique constraint on `nodes.created_by` and none on `users.node_id`, so the database will not object.

**Honest likelihood:** low in the pilot. It requires a `regional_steward` — a trusted role, of which there is exactly one — issuing concurrent requests, and the current UI is a manual form. This is a correctness hole, not an exploit. Recorded because it was explicitly asked about, and because it becomes reachable the moment a script or retry loop calls this endpoint.

**Recommended fix:** wrap the whole handler in a transaction, and use `SELECT ... FOR UPDATE` on the target user so the second request blocks rather than racing.

---

### MED-003 — stale steward pointers and silent role clobbering (Medium)

`createNode`'s `UPDATE` ([`:76`](resilientsa-app/api/admin/[...path].ts:76)) sets `nodeId`, `role = 'node_admin'` and `cellId = null` — but nothing else. Three consequences:

1. **Stale `cells.steward_user_id`.** If the promoted user is currently a `cell_steward` of a cell in their old node, that cell keeps `steward_user_id` pointing at them. Compare `setMemberRole`, which **does** clean up on demotion ([`:185`](resilientsa-app/api/admin/[...path].ts:185)–`189`). The two routes disagree about the same invariant. `cells.steward_user_id` is a plain `uuid` with no foreign key (per the documented ORDER 004 precedent), so nothing at the database level rejects the dangling pointer. Effect: ORDER 007's steward dashboard logic reads `stewardUserId`, so a cell can report a phantom steward who is now `node_admin` of a different node.
2. **Same defect in `assignCell`** ([`:152`](resilientsa-app/api/admin/[...path].ts:152)): re-assigning a member who currently stewards cell A into cell B leaves cell A still pointing at them.
3. **Silent role clobbering, including `grounder`.** The 409 check at [`:68`](resilientsa-app/api/admin/[...path].ts:68) covers `node_admin` and `regional_steward` only. `grounder` is not excluded, and `cell_steward` is not either. Promoting a `grounder` overwrites their `users.role` to `node_admin` — and `grounder` identity **also** lives in a separate `grounders` row keyed by `user_id` ([`api/_lib/grounder.ts:11`](resilientsa-app/api/_lib/grounder.ts:11)), which is not touched. That leaves a split-brain identity: a `grounders` record for a user whose `users.role` is `node_admin`. Note `CREW-ORDER-009a` §4 only required the `node_admin` check, so excluding `grounder` may be intentional — **flagging it as a decision, not a defect**, but the split-brain consequence is not documented anywhere.

**Recommended fix:** clear `cells.steward_user_id` wherever the user was previously stewarding, in all three of `createNode`, `assignCell` and `setMemberRole` — ideally via one shared helper so the invariant lives in one place. Decide explicitly whether `grounder` is promotable, and if so, what happens to the `grounders` row.

---

### MED-004 — no audit trail on role changes (Medium)

`setMemberRole`, `createNode` and `assignCell` are the platform's highest-privilege mutations and they leave no record beyond the current row state. Who granted `cell_steward`, to whom, and when, is unrecoverable after the fact. The schema already contains a precedent for exactly this — `coop_pii.cooperative_status_events` records status transitions rather than overwriting — so the pattern exists in the codebase and simply was not applied here. For a platform whose stated purpose includes accountability to communities that have been through "development theatre", an unlogged power grant is a design gap rather than a nitpick.

**Recommended fix:** an append-only `role_change_events` table (actor, target, from-role, to-role, timestamp), written in the same transaction as the mutation.

---

### MED-005 — the only `regional_steward` can demote themselves (Medium)

`createNode` sets `role = 'node_admin'` unconditionally on `initialAdminUserId` ([`:77`](resilientsa-app/api/admin/[...path].ts:77)) and never checks that the target is not the caller. There is currently **exactly one** `regional_steward` in the system — the Captain's own test user, bootstrapped on 2026-09-10 pt.6. If that user is selected in the "create node" member picker, they become `node_admin` of the new node and **lose `regional_steward` permanently.** No route can restore it: `setMemberRole` is allowlisted to `cell_steward`/`member`, and by design nobody holds the authorising role to grant `regional_steward`. Recovery would need another one-off token-gated temp endpoint, i.e. the recurring pattern the standup already flags as undesirable.

**Recommended fix:** `if (initialAdminUserId === session.userId) return res.status(400).json({ error: '...' })` — a server-side guard, independent of whether the UI picker happens to exclude the caller.

---

### LOW-006 — inconsistent RLS usage in the same file (Low)

`listNodes` and `createNode` do not use `withRLSContext`; the other five routes do. Currently cosmetic, because CRIT-001 means it makes no difference either way. It becomes a real inconsistency the moment CRIT-001 is fixed, and it will be easy to miss then. Worth aligning as part of the CRIT-001 work.

### LOW-007 — stale README claim in the security record (Low)

[`WORF_ALERTS/README.md:35`](WORF_ALERTS/README.md:35) ends with "*No alerts filed yet.*" while four alerts existed before this one. Corrected in the same commit as this file.

---

## Verified clean

Recorded so the review is not read as a list of failures:

- `setMemberRole` allowlist is a strict positive check — cannot be widened by future schema changes (Check 1)
- Every mutation route node-checks its target before writing (Check 2)
- No route trusts a `nodeId` from the request body; `cellId` from the body is validated against the session node (Check 4)
- `session.nodeId` is read live from the database per request, so it cannot go stale
- Cross-node cell lookups return 404, not 403 — no existence leak
- `[`/admin`](resilientsa-app/src/App.tsx:1)`'s route guard: per 2026-09-10 pt.6 the route was previously an unguarded static `<div>`; ORDER 009a milestone 7 is reported complete. **Not independently re-verified in this review** — see limits below.
- No PII is written, returned or logged by any of the seven admin routes. The fields returned are `id`, `displayName`, `role`, `cellId`, `name`, `raCpfName`, `createdBy` — no `phone_number`, `phone_hash`, `whatsapp_number`, `id_number`, `address` or `email`. `raCpfName` is an organisation name (Resident Association / Community Policing Forum), not personal PII, and it is node-scoped metadata.
- Error paths log via `console.error` with ids and error objects only — no PII values.

---

## Limits of this review

Stated so nobody over-reads the confidence level:

1. **No live database access.** This sandbox cannot reach Postgres on port 5432 (documented 2026-09-10 pt.5). CRIT-001's owner-bypass is inferred from source plus documented credentials, not executed. The verification query above is provided precisely because I could not run it.
2. **No browser or screenshot capability in this session.** This is a source-level review. It does not cover runtime behaviour, actual HTTP responses, or what the UI permits.
3. **Scope was this file and its primitives.** `api/_lib/db.ts`, `db-context.ts`, `session.ts` and the public schema for `users`/`nodes`/`cells` were read. Other route files were grepped for the `withRLSContext` pattern but not read line by line.
4. **`CREW-ORDER-009a` milestone 7** (`/admin` wrapped in `ProtectedRoute` + `AppShell`) was **not** independently re-verified.

---

## Captain Notified

☒ Yes — 2026-09-11, in the session report accompanying this file. CRIT-001 exceeds the automatic-escalation threshold and was surfaced directly rather than left for the next Bridge session.

## Resolution

☐ Resolved
☒ **Open** — items outstanding:

| ID | Severity | Owner | Status |
|---|---|---|---|
| CRIT-001 | Critical | Spock (needs a Crew Order — schema/data-layer change, Rule #3) | Open — needs live confirmation first |
| MED-002 | Medium | O'Brien (once ordered) | Open |
| MED-003 | Medium | O'Brien (once ordered) | Open |
| MED-004 | Medium | Spock (new table) | Open |
| MED-005 | Medium | O'Brien — one-line server-side guard | Open |
| LOW-006 | Low | rides along with CRIT-001 | Open |
| LOW-007 | Low | done in this commit | ✅ Resolved 2026-09-11 |

### Verdict on ORDER 009a's role-escalation logic

**The four checks the Captain asked for pass.** The allowlist is correctly constructed, cross-node rejection is present on every mutation and correct, session-sourced scoping is consistent across all seven routes, and `session.nodeId` cannot go stale. **ORDER 009a's route logic may stand as written.**

That verdict is **conditional on CRIT-001 being accepted as a known, tracked gap in the meantime.** Real community-member onboarding should not begin until CRIT-001 is either fixed or the Captain formally accepts the compensating control (application-level `nodeId` filtering only, with no database backstop) in writing — because the moment real PII exists, the inert `coop_pii` policy stops being a theoretical gap.

**O'Brien**
*Second-eyes review, Captain-directed 2026-09-11. Not a Worf sign-off — Worf has not reviewed this document.*
