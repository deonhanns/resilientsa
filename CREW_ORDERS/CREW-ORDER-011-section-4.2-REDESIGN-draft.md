# CREW-ORDER-011 §4.2 — REDESIGN: split connection identity
**Status: ⚠ DRAFT — NOT IN FORCE. NOTHING IN THIS DOCUMENT HAS BEEN RUN ANYWHERE.**
**Prepared by:** O'Brien, 2026-09-18, at Captain's direction
**Approver:** **Spock** — this is schema + connection-identity territory (Rule #3). No statement below may be executed against Preview or Production until Spock approves, and the code changes in Part B are not to be written until then either.
**Precedent:** same shape as Spock's [`CREW-ORDER-011-section-4.2-execution.md`](CREW_ORDERS/CREW-ORDER-011-section-4.2-execution.md:1) — O'Brien writes the SQL, Spock approves before it runs.
**Supersedes:** §4.2 option 1 of [`CREW-ORDER-011.md`](CREW_ORDERS/CREW-ORDER-011.md:74) and Steps 3–4 of the execution doc, both of which are unworkable as written (see §1).
**Evidence base:** [`WORF_ALERTS/2026-09-15-live-incident-order011-section42-app-role-breakage.md`](WORF_ALERTS/2026-09-15-live-incident-order011-section42-app-role-breakage.md:1) and [`ENGINEERING_ESCALATIONS/2026-09-15-order011-section42-app-role-unviable.md`](ENGINEERING_ESCALATIONS/2026-09-15-order011-section42-app-role-unviable.md:1). Every policy definition, grant and role attribute quoted here was read live from the database on 2026-09-18, not inferred from source.

---

## 1. Why the original §4.2 cannot work

Measured live on 2026-09-14/15 (`resilientsa_app`: `rolsuper=false`, `rolbypassrls=false`, full `SELECT/INSERT/UPDATE/DELETE` on all 27 tables — so the role itself was built correctly):

1. **The policies raise instead of filtering.** All **20** GUC-referencing policies call `current_setting('app.current_node_id')` with no `missing_ok` argument. With no context set, PostgreSQL raises `42704 unrecognized configuration parameter` — a hard error. *(Correction to both my alert and the Captain's brief: the count is **20**, not 21. I had inferred 21 from "21 tables carry one policy each"; the live count of policies whose expressions reference `current_setting` is 20 — 17 in `public` + 3 in `coop_pii`.)*
2. **Auth cannot be node-scoped, by definition.** A session lookup must read `session_tokens` → `users` *before* any node is known, and `session_tokens_user_isolation` is `USING (user_id IN (SELECT users.id FROM users))` — so it evaluates the `users` policy on every login. Making policies NULL-tolerant alone converts the 500 into "0 rows", i.e. **login fails silently instead of loudly.**
3. **5 tables are deny-all:** `gifts_profiles`, `grounders`, `matches`, `programme_offerings`, `trade_completions` have RLS enabled and **zero** policies.
4. **The gate could not see any of it.** `scripts/verify-rls.ts` connects directly and sets the GUC inside one transaction, so it proves what the *database* does when told which node to be. It never exercises the application. It would report PASS while every authenticated request 500s — which is exactly what happened.

**Therefore §4.2's "switch `DATABASE_URL` to the app role" is not fixable by config.** The application needs *two* connection identities.

*(Also still true and unaffected by this draft: the app resolves `POSTGRES_URL`, not `DATABASE_URL` — `@vercel/postgres` has zero runtime references to `DATABASE_URL`. Step 3 of the execution doc names the wrong variable.)*

---

## 2. The design

**Two pools, chosen by the nature of the query, not by the file it lives in.**

| Pool | Connection | RLS | Who uses it |
|---|---|---|---|
| **Privileged** (existing `db`) | `POSTGRES_URL` — table owner | bypassed (owner) | pre-authentication and cross-cutting operations only |
| **App** (new `dbApp`) | `POSTGRES_URL_APP` — `resilientsa_app` | **enforced** | every node-scoped data route, through `withRLSContext` |

### 2.1 Route classification (from the live call-site map, 2026-09-18)

**Privileged — pre-auth or structurally cross-node:**

| Route / helper | Why it cannot be node-scoped |
|---|---|
| [`api/_lib/session.ts`](resilientsa-app/api/_lib/session.ts:20) `getSession` | Runs before any node is known. This is the query that produced the incident. |
| [`api/_lib/otp.ts`](resilientsa-app/api/_lib/otp.ts:1) | OTP issue/verify is pre-auth. |
| [`api/auth/[...path].ts`](resilientsa-app/api/auth/[...path].ts:96) | OTP + `users` upsert + `session_tokens` insert — all pre-auth. |
| [`api/me.ts`](resilientsa-app/api/me.ts:21) | Self-profile; cannot know the node until `getSession` has answered. Safe on the privileged pool **because the query is pinned to `eq(users.id, session.userId)`** — add a comment saying so. |
| [`api/_lib/gifts-nudge.ts`](resilientsa-app/api/_lib/gifts-nudge.ts:1) | `notification_log` insert of a system notification; not node-scoped by design. |
| `api/admin/[...path].ts` `listNodes` + `createNode` | `nodes.node_isolation` is `USING (id = current_setting('app.current_node_id'))`. `createNode` inserts a node whose `id` *cannot* equal the current context, and `listNodes` for a `regional_steward` deliberately spans nodes. **These two are correct as-is, not the LOW-006 defect they were filed as** — they are administrative operations, not node-scoped data access. This resolves LOW-006 by reclassification. |

**App role — node-scoped, already wrapped in `withRLSContext` by §4.1:**

`gifts-profile/me.ts` · `listings/[...path].ts` · `marketplace/[...path].ts` · `matches/[...path].ts` · `steward/[op]/[cellId].ts` · `trade-completions/[match_id]/confirm-fairness.ts` · `admin/[...path].ts` (the 3 wrapped ops) · `admin/members/[userId]/cell.ts` · `admin/members/[userId]/role.ts`

### 2.2 Three GUCs, all transaction-local

`app.current_node_id` and `app.current_role` already exist. Add a third:

```ts
// api/_lib/db-context.ts  (Part B — not written until Spock approves)
export async function withRLSContext<T>(
  nodeId: string, role: string, userId: string,
  fn: (tx: RlsTx) => Promise<T>,
): Promise<T> {
  return dbApp.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_node_id', ${nodeId}, true)`)
    await tx.execute(sql`SELECT set_config('app.current_role',    ${role},   true)`)
    await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`)
    return fn(tx)
  })
}
```

`app.current_user_id` is **required**, not optional: `gifts_profiles`, `grounders` and `programme_offerings` have **no `node_id` column at all**, so ownership is the only boundary that can be expressed for them. `SessionContext.userId` already exists.

⚠ `withRLSContext`'s signature change touches all 31 call sites again. Unlike §4.1, the compiler **will** catch these (arity change), but grep anyway — see §5.

### 2.3 Fail closed

If `POSTGRES_URL_APP` is unset, `dbApp` must **throw at first use** (503 from node-scoped routes), never silently fall back to the privileged pool. A silent fallback would look "fixed" while enforcing nothing — the exact false-PASS failure mode of `verify-rls.ts` against the empty table, and of this whole order.

### 2.4 New environment variable

`POSTGRES_URL_APP` — set by the **Captain**, Sensitive, Preview first. Named to match `POSTGRES_URL`. Not committed anywhere, never logged. `AGENTS.md` Critical Rule #2 should be amended to list it (flagged separately; I have not edited AGENTS.md).

---

## 3. Part A — SQL (all of it idempotent; Spock to approve before execution)

### A1. NULL-tolerant rewrite of the 20 GUC policies

Mechanical and **zero-risk to run first**: nothing changes for the current owner connection (owner bypasses RLS), and it is what makes any future non-owner role fail *safe* rather than fatally.

```sql
-- =====================================================================
-- A1 — make every GUC-referencing policy tolerate an absent setting.
-- current_setting(name) raises 42704 when unset; current_setting(name, true)
-- returns NULL, and every comparison below then yields NULL => row filtered
-- out => deny. Fail-closed without an error.
-- =====================================================================

-- public: node-scoped on node_id (14)
ALTER POLICY node_isolation ON public.anticipatory_alerts
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.cells
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.community_exchange_reference
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.community_health_assessments
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.connection_events
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.crisis_mode
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.internal_forecasts
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.listings
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.multi_signal_alerts
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.network_phase_snapshots
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.offering_endorsements
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.offering_engagements
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.users
  USING (node_id = current_setting('app.current_node_id', true)::uuid);
ALTER POLICY node_isolation ON public.value_charters
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

-- public: node-scoped on id (1) — note the column is id, not node_id
ALTER POLICY node_isolation ON public.nodes
  USING (id = current_setting('app.current_node_id', true)::uuid);

-- public: role-present only (2) — see the caveat below
ALTER POLICY authenticated_select ON public.external_signals
  USING (current_setting('app.current_role', true) IS NOT NULL
         AND current_setting('app.current_role', true) <> '');
ALTER POLICY authenticated_select ON public.notification_log
  USING (current_setting('app.current_role', true) IS NOT NULL
         AND current_setting('app.current_role', true) <> '');

-- coop_pii: node + role (3)
ALTER POLICY coop_pii_cooperatives_node_isolation ON coop_pii.cooperatives
  USING (node_id = current_setting('app.current_node_id', true)::uuid
         AND current_setting('app.current_role', true) = 'node_admin');
ALTER POLICY coop_pii_status_events_node_isolation ON coop_pii.cooperative_status_events
  USING (cooperative_id IN (
           SELECT c.id FROM coop_pii.cooperatives c
           WHERE c.node_id = current_setting('app.current_node_id', true)::uuid)
         AND current_setting('app.current_role', true) = 'node_admin');
ALTER POLICY coop_pii_node_admin_only ON coop_pii.founding_members
  USING (cooperative_id IN (
           SELECT c.id FROM coop_pii.cooperatives c
           WHERE c.node_id = current_setting('app.current_node_id', true)::uuid)
         AND current_setting('app.current_role', true) = 'node_admin');
```

**Two things Spock should know about A1:**

- **`WITH CHECK` is not restated, deliberately.** These are `FOR ALL` policies with a `USING` expression and no `WITH CHECK`; PostgreSQL then applies the `USING` expression as the insert/update check. So an insert must carry the row's own `node_id` equal to the context — which the route code already does (`nodeId: session.nodeId`). This is the behaviour we want; it is also the reason `createNode` must stay privileged (§2.1).
- **The two `authenticated_select` policies on `external_signals` and `notification_log` are the odd ones out.** Their original text was `current_setting('app.current_role') <> ''` — which is *not* node scoping at all, just "some role is set". Under A1 alone, with the app role and no context, they deny (correct), but they also mean any route that touches these two tables **must** set context or get nothing. `notification_log` is currently written by `gifts-nudge.ts` **outside** any closure, so either that write moves onto the privileged pool (my recommendation — it is a system notification) or it must be wrapped. **Spock to choose; flagging rather than assuming.**

### A2. Real policies for the 5 deny-all tables

Per-table judgement, as requested. The rule I applied: *scope by the boundary the data actually has* — a table with `node_id` gets node scoping; a table that is global by design gets authenticated-read plus ownership-restricted writes; a table with no `node_id` that is nonetheless node-bound gets node scoping through the table that carries the boundary.

```sql
-- ---------------------------------------------------------------------
-- gifts_profiles — member-owned, node-visible. No node_id column.
-- A member reads/writes their own profile; a Cell Steward needs to read
-- same-node members' profiles to compute aggregates. A steward must NOT be
-- able to write another member's profile, so the write path is own-row only.
-- index already present: idx_users_node_id (migration 0001)
-- ---------------------------------------------------------------------
CREATE POLICY gifts_profiles_read ON public.gifts_profiles
  USING (
    user_id = current_setting('app.current_user_id', true)::uuid
    OR user_id IN (
         SELECT u.id FROM public.users u
         WHERE u.node_id = current_setting('app.current_node_id', true)::uuid)
  )
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)::uuid
  );

-- ---------------------------------------------------------------------
-- grounders — GLOBAL by design (ORDER 008: the marketplace is the bridge
-- between organisations and communities, and a Grounder is not a resident of
-- any node). No node scoping. Read for any contexted session; writes only by
-- the grounder who owns the record.
-- ⚠ NO INSERT POLICY, deliberately: per ORDER 008 §6 a user's grounder
-- capability is derived from the existence of a grounders row for their
-- user_id, so a self-INSERT policy would be a privilege-escalation path
-- (any member could make themselves a Grounder). Grounder records are created
-- by the privileged path only (today: scripts/seed-grounder.ts).
-- ---------------------------------------------------------------------
CREATE POLICY grounders_read ON public.grounders
  FOR SELECT
  USING (current_setting('app.current_role', true) IS NOT NULL
         AND current_setting('app.current_role', true) <> '');

CREATE POLICY grounders_owner_update ON public.grounders
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---------------------------------------------------------------------
-- programme_offerings — GLOBAL (a Grounder's offering is browsable by every
-- community). No node scoping; read for contexted sessions, write only by the
-- owning Grounder, resolved grounder_id -> grounders.user_id.
--
-- NOTE ON POLICY COMPOSITION: the subquery reads public.grounders, so
-- grounders_read above is ALSO evaluated for it. RLS applies to every table
-- named in a policy, not just the policy's own table. That is why
-- grounders_read must permit a contexted session read — otherwise this policy
-- would deny everything. This composition is a feature here and a trap
-- elsewhere; see A2 trade_completions for the version I recommend instead.
-- ---------------------------------------------------------------------
CREATE POLICY programme_offerings_read ON public.programme_offerings
  FOR SELECT
  USING (current_setting('app.current_role', true) IS NOT NULL
         AND current_setting('app.current_role', true) <> '');

CREATE POLICY programme_offerings_owner_write ON public.programme_offerings
  FOR ALL
  USING (grounder_id IN (
           SELECT g.id FROM public.grounders g
           WHERE g.user_id = current_setting('app.current_user_id', true)::uuid))
  WITH CHECK (grounder_id IN (
           SELECT g.id FROM public.grounders g
           WHERE g.user_id = current_setting('app.current_user_id', true)::uuid));

-- ---------------------------------------------------------------------
-- matches — no node_id. A match joins two listings, and listings ARE
-- node-scoped, so the boundary is inherited through listing_ids.
-- ASSUMPTION, flagged for Spock: a match is intra-node. If a match may ever
-- join listings from two different nodes, this policy makes it invisible to
-- both and the column set needs a deliberate node_id instead.
-- ---------------------------------------------------------------------
CREATE POLICY matches_node_isolation ON public.matches
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = ANY (matches.listing_ids)
        AND l.node_id = current_setting('app.current_node_id', true)::uuid)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = ANY (matches.listing_ids)
        AND l.node_id = current_setting('app.current_node_id', true)::uuid)
  );

-- ---------------------------------------------------------------------
-- trade_completions — references a match. Written EXPLICITLY (two hops) rather
-- than as `match_id IN (SELECT id FROM matches)`, even though that would be
-- shorter. Reason: relying on another table's policy to supply my isolation
-- means any future relaxation of matches' policy silently relaxes this one
-- too. Self-contained is worth the extra join.
-- ---------------------------------------------------------------------
CREATE POLICY trade_completions_node_isolation ON public.trade_completions
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = trade_completions.match_id
        AND EXISTS (
          SELECT 1 FROM public.listings l
          WHERE l.id = ANY (m.listing_ids)
            AND l.node_id = current_setting('app.current_node_id', true)::uuid))
  );

-- ---------------------------------------------------------------------
-- AUDIT — after A2, RLS-enabled-with-zero-policies must return 0 rows:
--   SELECT n.nspname||'.'||c.relname FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE c.relkind='r' AND c.relrowsecurity AND n.nspname IN ('public','coop_pii')
--     AND NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid);
-- ---------------------------------------------------------------------
```

### A3. Retire the three pre-auth policies — DEFERRED HARDENING, run last

Not required for correctness, so it must not hold up the rollout. But it should land eventually:

```sql
-- otp_codes carries a world-readable SELECT policy (  USING (true)  ). With any
-- non-owner role in play that is a live-credential store readable in full.
-- Under the split design only the privileged path touches otp_codes/session_tokens,
-- so RLS-on-with-no-policy (deny-all for non-owners) is the correct posture.
DROP POLICY otp_codes_anon_insert  ON public.otp_codes;
DROP POLICY otp_codes_anon_select  ON public.otp_codes;

-- session_tokens_user_isolation's USING clause is
--   user_id IN (SELECT users.id FROM users)
-- i.e. it evaluates the users policy on every login, which is what turned a
-- missing context into a 500 on the login path. The privileged pool bypasses it
-- anyway, so it protects nothing and endangers the auth path.
DROP POLICY session_tokens_user_isolation ON public.session_tokens;
```

### A4. `FORCE ROW LEVEL SECURITY` — recommend **no**, and say why

`FORCE RLS` would make the *owner* subject to policies too — including the migration path and the privileged pool, which cannot work (§2.1 routes depend on bypassing). Since `resilientsa_app` is neither owner nor `BYPASSRLS`, A1+A2 already deliver enforcement for the app role. Recommend leaving `relforcerowsecurity=false` and noting in the schema comments that the privileged pool is intentionally exempt.

---

## 4. Part B — code changes (O'Brien, only after Spock approves; not written yet)

1. `api/_lib/db-app.ts` — new pool from `POSTGRES_URL_APP`, throwing if unset (§2.3).
2. `api/_lib/db-context.ts` — `withRLSContext` gains `userId` and uses `dbApp`.
3. 31 call sites — pass `session.userId`, forward the third argument.
4. Route classification per §2.1 — swap the 6 privileged paths back to `db` where they are not already, and add the explanatory comment on `api/me.ts`.
5. `scripts/verify-rls.ts` — stop preferring `DATABASE_URL`; take the connection string explicitly, and assert `rolbypassrls = false` for whatever role it tests (otherwise it can "pass" against the privileged identity).
6. **New** `scripts/verify-rls-live.ts` — the gate that would have caught this incident (§6).

---

## 5. Rollout order — the sequence is load-bearing

Each step is reversible on its own, and the risky step is deliberately last.

| # | Step | Blast radius if wrong |
|---|---|---|
| 1 | **A1** (NULL-tolerant rewrite) on Preview DB, then Production DB | none — owner still bypasses RLS |
| 2 | **A2** (5 new policies) same order | none for the same reason |
| 3 | Ship **Part B** with `POSTGRES_URL_APP` still unset | node-scoped routes 503 (fail-closed), privileged routes unaffected — visible immediately on Preview |
| 4 | Set `POSTGRES_URL_APP` on **Preview**; redeploy | Preview only |
| 5 | Run the **new live gate** (§6) against the Preview deployment | — must pass before step 6 |
| 6 | Set `POSTGRES_URL_APP` on **Production**; redeploy; re-run the gate there | Production |
| 7 | **A3** (drops) as deferred hardening | Preview first, then Production |
| 8 | Update `AGENTS.md` POPIA checklist to PASS with dates and the gate's output; close 011 milestones 3–4 and the order | — |

**Rollback for any step: unset `POSTGRES_URL_APP` and redeploy.** That returns the app to the privileged identity in one action without touching schema. Every SQL step is additive and leaves the owner path unchanged, so no SQL rollback is needed to restore service.

**Do not skip step 3.** Setting `POSTGRES_URL_APP` before Part B ships reproduces the 2026-09-14 outage exactly.

**Verification discipline, learned the hard way:** grep the call sites after step 3 (`grep -rn "withRLSContext(" api`), because §4.1's lesson was that `tsc` stayed silent on an unconverted site when the closure arity did not change. Here the arity *does* change, so the compiler helps — but confirm, don't assume.

---

## 6. The gate — must exercise the application, not just the database

This is the change that matters most in this document. `verify-rls.ts` as written is **necessary but not sufficient**: during the 2026-09-14 outage it would have passed while login was impossible platform-wide.

`scripts/verify-rls-live.ts` must assert, against a **live deployment URL**, all of:

1. **Routing + health:** every route in `smoke-routes.ts` still returns JSON (reuse it — don't fork it).
2. **Authenticated health — the incident's signature:** with a real session token, `GET /api/me`, `/api/gifts-profile/me`, `/api/admin/nodes`, `/api/steward/dashboard/<cell>` and `POST /api/auth/request-code` must return **no 5xx**. A 500 here is the exact failure this order must never ship again. A 401/403 is fine and expected — the assertion is "the handler ran", not "access granted".
3. **The database assertion:** as `resilientsa_app`, with context pointed at a non-existent node, `users` must return **0 rows** while a contextless count shows data exists; `INCONCLUSIVE` (not PASS) if the probe table is empty — carry over §4.3's corrected behaviour.
4. **The identity assertion:** whatever connection the test uses must report `rolbypassrls = false`. Testing the privileged identity and calling it a pass is the other way this could lie.
5. **Idempotent and re-runnable**, exit non-zero on any failure, and safe to run against Production outside a deploy window.

**Step 5 of §5 means running this against Preview before Production is touched** — not running it locally, which is what made the original gate blind.

---

## 7. Open questions for Spock

1. **`app.current_user_id`** — approve adding it as a third GUC (§2.2)? It is unavoidable for `gifts_profiles`/`grounders`/`programme_offerings`, which have no `node_id` column.
2. **`notification_log` writes** — move `gifts-nudge.ts` onto the privileged pool (my recommendation) or wrap it in a closure so its `authenticated_select` policy can be satisfied?
3. **`grounders.verification_status` / `verified_by`** — verification is an administrative act, but a Grounder is global while `node_admin` is node-scoped. Who is allowed to verify: a `regional_steward`, a future `grounder_admin`, or nobody until a later order? Not expressible in the policies as drafted; currently unwritable by the app role.
4. **Are matches intra-node?** A2's `matches` policy assumes yes. If not, `matches` needs a deliberate `node_id`.
5. **Env var name and owner** — `POSTGRES_URL_APP`, set by the Captain, Sensitive, never logged. Confirm, and confirm the `AGENTS.md` Rule #2 amendment.
6. **Fail-closed** (§2.3) — confirm 503-on-missing-`POSTGRES_URL_APP` is preferred to a silent privileged fallback.
7. **`FORCE RLS`** — confirm "no" (§A4).
8. **Preview's current state** — the Captain reverted Preview's `POSTGRES_URL` to `neondb_owner` on 2026-09-18 and Preview is healthy again (verified live, §9). Step 4 re-points Preview at the app role through the *new* variable, so the two no longer collide. Confirm that is the intended reading.

---

## 8. What this does NOT change

- **Migrations keep running as `neondb_owner`.** Schema changes are a separate concern from runtime row access, and Rule #3 already reserves them.
- **§4.1's `tx`-threading stays as built.** This draft makes that correctness *matter* — until now RLS was inert regardless of whether the context was threaded properly.
- **No dependency is added.** No npm package, no new service.
- **CRIT-001 is not closed by A1+A2 alone.** They make the app role *safe to use*; CRIT-001 closes when Production actually connects as `resilientsa_app` (step 6) and the gate passes there.

---

## 9. Live state at time of writing (2026-09-18)

Preview, after the Captain's `POSTGRES_URL` revert and redeploy (`resilientsa-d9cddega8`, Ready): a real Playwright login succeeds end to end — `200 request-code`, `200 verify-code`, **`200 /api/me`**, `/trade` renders, `/admin` 200 — with **zero** `FUNCTION_INVOCATION_FAILED` / `42704` entries in its runtime logs. Both environments are therefore healthy on the privileged identity while this draft awaits review. Production is unchanged at commit `ac10e8e`.

---

*DRAFT — prepared by O'Brien 2026-09-18. Not in force. Requires Spock's approval before any statement runs, and before Part B is written.*
