# CREW-ORDER-011 §4.2 — Non-Owner, Non-BYPASSRLS Connection Role
**Issued by:** Spock, 2026-09-13
**Executed by:** Captain or O'Brien, via Neon's SQL Editor (dashboard — no port-5432 access needed for this step)
**Reason this is Spock's to author, not O'Brien's to write ad hoc:** Rule #3 — this changes the application's database connection identity, a schema/connection-layer change.

---

## Why `FORCE ROW LEVEL SECURITY` alone cannot work here

O'Brien's §3 finding: the current connection role (`neondb_owner`) carries the `BYPASSRLS` attribute. In PostgreSQL, `BYPASSRLS` overrides every RLS policy unconditionally — it is **not** the same exemption `FORCE ROW LEVEL SECURITY` closes (that only removes the *table-owner* exemption, which is a separate mechanism). A role with `BYPASSRLS` ignores `FORCE ROW LEVEL SECURITY` too. The only fix is a connection role that does not have `BYPASSRLS` set at all.

---

## Step 1 — Run this in Neon's SQL Editor

Replace `<STRONG_RANDOM_PASSWORD>` with a freshly generated password (32+ random characters — a password manager or `openssl rand -base64 32` is fine). Do not reuse any existing credential.

```sql
-- Create the new application role. Explicitly NOBYPASSRLS, NOSUPERUSER —
-- these are the two attributes that matter. LOGIN so it can be used as a
-- connection identity. NOCREATEDB/NOCREATEROLE — no reason this role
-- should ever create databases or other roles.
CREATE ROLE resilientsa_app WITH
  LOGIN
  PASSWORD '<STRONG_RANDOM_PASSWORD>'
  NOSUPERUSER
  NOBYPASSRLS
  NOCREATEDB
  NOCREATEROLE;

-- Schema access
GRANT USAGE ON SCHEMA public TO resilientsa_app;
GRANT USAGE ON SCHEMA coop_pii TO resilientsa_app;

-- Table access — all existing tables in both schemas
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO resilientsa_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA coop_pii TO resilientsa_app;

-- Sequence access — needed for any serial/identity columns (most tables use
-- uuid defaultRandom(), but this covers any that don't, now or later)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO resilientsa_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA coop_pii TO resilientsa_app;

-- Default privileges — so tables created by future migrations (still run
-- as neondb_owner) automatically grant this role access, without needing
-- to remember to re-run these GRANTs every time
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO resilientsa_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA coop_pii
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO resilientsa_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO resilientsa_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA coop_pii
  GRANT USAGE, SELECT ON SEQUENCES TO resilientsa_app;
```

## Step 2 — Confirm the role's attributes before using it anywhere

Run this and confirm the output before proceeding:

```sql
SELECT rolname, rolsuper, rolbypassrls, rolcreatedb, rolcreaterole
FROM pg_roles WHERE rolname = 'resilientsa_app';
-- Expected: rolsuper=false, rolbypassrls=false, rolcreatedb=false, rolcreaterole=false
```

If `rolbypassrls` is anything but `false`, **stop** — do not proceed to Step 3. That would mean the role was created wrong or Neon's project has some default that overrides this; escalate back rather than continuing.

## Step 3 — Update `DATABASE_URL` / `POSTGRES_URL` on Vercel (Preview first)

Build the new connection string with the same host/pooler/database as the current one, swapping only the credential:

```
postgresql://resilientsa_app:<STRONG_RANDOM_PASSWORD>@<same-host-as-now>/<same-database>?sslmode=require&channel_binding=require
```

**Set this on Preview first, not Production.** Deploy a preview branch, then run:

```
npx tsx scripts/verify-rls.ts
```

against that preview. This is the test O'Brien built and then corrected (originally gave a false PASS against an empty table — now correctly reports INCONCLUSIVE if the probe table is empty, and must show real cross-node denial on `users`, which has rows). **Do not proceed to Production until this genuinely passes** — not INCONCLUSIVE, not an error, a real demonstrated denial.

## Step 4 — Promote to Production

Once Preview's `verify-rls.ts` run shows real, positive denial (not an empty-table non-result), update the same env vars on Production and redeploy. Immediately re-run `verify-rls.ts` against production to confirm the same result live — the standing discipline this whole project has re-learned repeatedly: a passing test on one environment is not evidence for another until it's actually run there.

## Step 5 — Only after Production is confirmed

- Consider whether `neondb_owner`'s password should be rotated once nothing depends on it for runtime traffic (it remains needed for Spock-run migrations, which still run as the owner — that's correct and expected, migrations are schema changes, Rule #3's territory, not runtime queries).
- Update `AGENTS.md`'s POPIA checklist item (which O'Brien already corrected to "CANNOT BE TICKED") to PASS, with today's date and a pointer to the `verify-rls.ts` production run that confirmed it.
- Close CREW-ORDER-011 milestone 4, and the order overall.

---

## What this does NOT change

- Migrations continue running as `neondb_owner` — that's correct, schema changes are a different concern from runtime row access, and Rule #3 already reserves migrations to Spock regardless of which role serves live traffic.
- Nothing about §4.1's `tx`-threading work changes — it's already correct and complete; this step is what finally makes that correctness matter, since RLS was inert until now regardless of whether the context was threaded properly.

---

*Issued by Spock, 2026-09-13, closing the one remaining Rule #3 item CREW-ORDER-011 was blocked on.*
