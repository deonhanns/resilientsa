# Escalation — ORDER 011 §4.2
**Date:** 2026-09-15
**Filed by:** O'Brien
**Order:** CREW-ORDER-011
**Step:** §4.2 — "create a dedicated non-owner application role … and switch `DATABASE_URL` to connect as that role"
**Escalation type:** Architectural decision beyond CREW_ORDER scope, with a live security finding attached. **Not** a 3-attempt build failure — the diagnosis is conclusive; what is needed is a design decision that Rule #3 reserves to Spock.

---

## What I Was Trying to Do

The Captain reported that switching Production's `DATABASE_URL` to `resilientsa_app` broke `/steward` and `/trade` (401 on `/api/me`, "no cell" on trade), and that the rollback may not have taken. My task was to diagnose that live, fix what I found, verify on Preview first, then Production.

---

## What I Actually Found

**The premise does not hold, and the real defect is larger than the incident.** All evidence is live (HTTP probes, Vercel runtime logs, direct database reads) and is written up in `WORF_ALERTS/2026-09-15-live-incident-order011-section42-app-role-breakage.md`.

1. **Production was never affected.** An authenticated `/api/me` returns **200** with real data, on the live alias and on all three of 2026-09-14's Production deployments. Production still connects as `neondb_owner` (`rolbypassrls=true`), i.e. CRIT-001 is unchanged.
2. **The switch was inert because the app does not read `DATABASE_URL`.** `api/_lib/db.ts` is `drizzle(sql, {schema})` with `sql` from `@vercel/postgres`, whose pool resolves `POSTGRES_URL`. `@vercel/postgres@0.10.0` contains **zero** `DATABASE_URL` references in any runtime `.js`/`.cjs`. So both the switch and the rollback were no-ops on Production. §4.2's own Step 3 says "Update `DATABASE_URL` / `POSTGRES_URL`" — the first of those two is a no-op for the API layer.
3. **Where the new role *is* live (Preview), the application is completely non-functional.** Every authenticated route returns 500; **`POST /api/auth/request-code` — login itself — also 500s**, so no client can obtain a token at all, and every downstream call degrades to 401 / "no cell". That is the Captain's observed symptom sequence, and it came from a Preview deployment, not Production.
4. **`scripts/verify-rls.ts` cannot detect this.** It connects directly and sets `app.current_node_id` inside one transaction, so it exercises *the database with the context supplied*. It will report PASS while the running application cannot authenticate a single user. §4.2 names this script as the promotion gate; the gate is therefore **necessary but not sufficient**, and in this case it was passed while the thing it was meant to protect was broken.

---

## Why §4.2 As Written Cannot Work

Three independent blockers, any one of which is fatal. All three are schema/connection-layer, so all three are Spock's per Rule #3 — **I changed none of them.**

**(a) The policies raise instead of filtering.** All **20** GUC-referencing policies are written as (count corrected 2026-09-18 from 21 — see the note in `WORF_ALERTS/2026-09-15-…` HIGH-005; the live inventory is 23 policies: 20 GUC-referencing, 2 `otp_codes`, 1 `session_tokens`):

```sql
CREATE POLICY node_isolation ON users
  USING (node_id = current_setting('app.current_node_id')::uuid);
```

`current_setting(text)` **without** the second `missing_ok` argument throws `42704 unrecognized configuration parameter` when the setting is absent. So any query on an RLS table without context is a hard 500, not an empty result. Correct form is `current_setting('app.current_node_id', true)::uuid`, which yields NULL and therefore filters the row out.

**Worse, for auth specifically, tolerant policies are not enough.** `session_tokens_user_isolation` is `USING (user_id IN (SELECT users.id FROM users))` — a subquery on `users`, so the `users` policy is evaluated on every session lookup, and the session lookup necessarily runs *before* any node is known. Making the policies NULL-tolerant would turn a 500 into "0 rows", i.e. **every login silently fails instead of crashing.** Server-side session lookup fundamentally cannot be constrained by a `node_id` the caller has not yet proven.

**(b) Five tables have RLS enabled with no policy at all** — `gifts_profiles`, `grounders`, `matches`, `programme_offerings`, `trade_completions`. Enabled-and-unpoliced is deny-all for any role that is not the owner: gifts profiles and grounder lookups 500 immediately, and `matches`/`trade_completions`/`programme_offerings` become entirely unusable.

**(c) The acceptance test does not test the application.** Per §4.2 Step 3, `verify-rls.ts` against a preview is the gate before Production. It proves the *database* enforces isolation when told what node to be. It does not prove the app can serve a request.

---

## Candidate Resolutions (Spock's to choose)

1. **Split the connection identity.** Auth/token/OTP lookups keep a privileged path; node-scoped data queries use `resilientsa_app` through `withRLSContext`. This is the smallest change that makes §4.2's intent achievable, and it matches the existing architectural reality that §4.1 already threaded context into the node-scoped routes only.
2. **Add an explicit pre-auth escape hatch in the schema.** Make the policies NULL-tolerant (`current_setting(…, true)`) *and* add a narrowly-scoped, auditable exemption for the session/user lookup — e.g. a `SECURITY DEFINER` function that resolves a session token to a user id, or a dedicated `app.auth_lookup` flag the policies honour. Must be written so it cannot be used to enumerate users beyond a token the caller already holds.
3. **Policy-by-policy remediation plus a tolerant default**, if 1 and 2 are both rejected: every policy uses `missing_ok`, plus explicit `WITH CHECK` clauses for INSERT paths, plus policies for the five unpoliced tables.

**Recommendation:** (1) for the rollout, with (2)'s tolerant-policy correction applied regardless — the current policies are unsafe under *any* non-owner role, and that property will bite again the moment someone retries this.

---

## Immediate Live State and the One-Step Remediation O'Brien Did Not Take Unilaterally

- **Production:** healthy, unchanged, on `neondb_owner`. Nothing to revert.
- **Preview:** currently carrying `resilientsa_app`, therefore **500s on every DB-touching route**. Two previews from the incident window (`jl67b20vb`, `k1e98updk`) and any preview built since.

Reverting Preview means editing a **Sensitive** env var ("Sensitive" values cannot be read back — `vercel env pull` returns `[SENSITIVE]`, and the dashboard shows the same), so I cannot read the current value, and I cannot verify that the value I would write is the one Preview had before. Reverting would also reverse a step Spock authored in `CREW-ORDER-011-section-4.2-execution.md`. **I therefore did not touch it.** Remediation, awaiting authorisation:

```
# set POSTGRES_URL on Preview back to the neondb_owner connection string
# (same value as Production's), then redeploy Preview:
vercel env rm POSTGRES_URL preview
vercel env add POSTGRES_URL preview      # paste the neondb_owner string
```

Leaving it is defensible only while Preview is treated as a broken-on-purpose experiment; it will mislead anyone who tests a preview in the meantime.

---

## What I Fixed Instead

`CRIT-002` — the same failing request returned Drizzle's `err.message` (SQL **plus bound parameters**, one of which is the plaintext OTP), a stack trace, and two env-var booleans, to an **unauthenticated** caller. Reproduced live; fixed in `resilientsa-app/api/auth/[...path].ts`; A/B verified on Preview then Production. See the Worf alert §3.5. This is a normal code change — no schema, no dependency, no architecture — so it did not need escalation, and it materially narrows the blast radius of exactly the failure mode this incident produced.

---

## Impact

- **Blocks:** ORDER 011 milestone 3 and therefore milestone 4 and closure. §4.2 cannot be promoted to Production in its current form — doing so would make login impossible platform-wide.
- **Blocks:** CRIT-001 remains open; RLS stays inert until this is resolved.
- **Does not block:** Production service. It is healthy now and needs no action.
- **Also recorded, not fixed (MED-007):** `GET /api/listings?cell_id=…` (depth 0) and `GET /api/marketplace/offerings/mine` (depth 2) are unroutable by construction, so the Trade Exchange feed can never show real data and grounder lookups cannot be live-tested. Observed 404 on Production. Needs its own order.

**O'Brien — awaiting Spock (§4.2 design decision) and Captain (Preview env revert authorisation)**
