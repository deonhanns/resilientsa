# Worf Alert — live incident, 2026-09-14/15: ORDER 011 §4.2 app-role rollout breaks authentication, and one route leaks the OTP

**Date filed:** 2026-09-15 (incident window 2026-09-14 20:00–20:20 SAST)
**Severity:** **Critical ×3** (CRIT-002, CRIT-003, CRIT-004) + High ×2 + Medium ×1
**Scope of review:** Production + Preview environments, live; `CREW-ORDER-011` §4.2 and its execution doc `CREW_ORDERS/CREW-ORDER-011-section-4.2-execution.md`
**Reviewer:** **O'Brien** — Captain-directed live incident diagnosis. **This is NOT a Worf sign-off.** Worf has not reviewed this document. Filed here because the finding is security-relevant and the Captain asked for a real record rather than a chat summary.
**Triggered by:** Captain's report that switching Production's `DATABASE_URL` to `resilientsa_app` broke `/steward` and `/trade` (401 on `/api/me`, "no cell" on trade), and that the rollback "may not have fully taken".

---

## 0. Headline — the reported premise is wrong, and the real defect is worse

Production was **never** affected by the role switch, and it is **not** broken now. The switch was inert because **the application does not read `DATABASE_URL`.** The genuine breakage is in **Preview**, where the new role *is* active, and there it makes the application completely non-functional — including login.

Every claim below is from live evidence (HTTP probes, Vercel runtime logs, direct database queries), not source reading.

---

## 1. Checks

| # | Check | Verdict |
|---|---|---|
| 1 | Does the app connect with `DATABASE_URL`? | ❌ **FAIL** — it uses `POSTGRES_URL` (CRIT-004) |
| 2 | Is Production healthy for a valid session? | ✅ **PASS** — real login, `/api/me` 200 (all 3 of today's deploys) |
| 3 | Is `/api/me` 401ing on Production? | ✅ **PASS** — no; 200 with the test account's real data |
| 4 | Do RLS policies behave safely when context is absent? | ❌ **FAIL** — they raise `42704` instead of returning no rows (HIGH-005) |
| 5 | Is every RLS-bearing table actually policed? | ❌ **FAIL** — 5 tables have RLS on and **zero** policies (HIGH-006) |
| 6 | Does the §4.2 acceptance gate exercise the application? | ❌ **FAIL** — it tests the database only (CRIT-003) |
| 7 | Does any endpoint leak credentials or query internals? | ❌ **FAIL** — the OTP was returned to an unauthenticated caller (CRIT-002) |
| 8 | Is PII logged or returned in the clear? | ✅ **PASS** — PII fields remain `bytea`; phone numbers were never printed during this session |

---

## 2. Findings

| ID | Severity | Finding |
|---|---|---|
| CRIT-002 | **Critical** | `POST /api/auth/request-code` returned Drizzle's `err.message` — which embeds the SQL **and its bound parameters** — plus a stack trace, to an unauthenticated caller. One bound parameter is the **plaintext OTP**. **Fixed and live-verified this session.** |
| CRIT-003 | **Critical** | §4.2's rollout (switch the app to a non-owner, non-`BYPASSRLS` role) makes the application **completely non-functional**: every authenticated route 500s, and login itself is impossible. §4.2's own gate, `scripts/verify-rls.ts`, cannot detect this because it exercises the database directly with the GUC set, never the application. |
| CRIT-004 | **Critical** | The API layer resolves its connection string from **`POSTGRES_URL`**, not `DATABASE_URL`. `@vercel/postgres@0.10.0` contains **zero** references to `DATABASE_URL` in any runtime `.js`/`.cjs`. Every doc, order and rule naming `DATABASE_URL` as the app's connection variable is wrong for the API layer — including `AGENTS.md` Critical Rule #2, ORDER 011 §4.2 option 1, and §4.2's own Step 3. |
| HIGH-005 | High | All 21 GUC-referencing RLS policies call `current_setting('app.current_node_id')` **without** the `missing_ok` argument, so an unset context raises `42704 unrecognized configuration parameter` — a hard error, never an empty result. |
| HIGH-006 | High | 5 tables have RLS **enabled with no policy at all** (deny-all for any non-owner role): `gifts_profiles`, `grounders`, `matches`, `programme_offerings`, `trade_completions`. A sixth pattern is worse: `session_tokens_user_isolation`'s USING clause is `user_id IN (SELECT users.id FROM users)` — a subquery on `users`, so evaluating it triggers the `users` policy and can only ever raise HIGH-005's error. |
| MED-007 | Medium | Two client routes are unroutable by construction, so their screens can never show real data: `GET /api/listings?cell_id=…` (depth 0 — catch-alls do not match depth 0, per ORDER 010's own rule 2) and `GET /api/marketplace/offerings/mine` (depth 2 under a catch-all). Observed live on Production: `404` for both. |
| — | **still open** | **CRIT-001 (2026-09-11) remains open and unchanged**: Production still connects as `neondb_owner` (`rolbypassrls=true`), so every RLS policy is still inert. `force_rls=0` on all 27 tables. |

---

## 3. Evidence

### 3.1 Production is healthy — real login, not a probe

Playwright drove the real UI at 390×844 against `https://resilientsa.vercel.app`:

```
1. open https://resilientsa.vercel.app            → /join
2. phone submitted                                → OTP retrieved from Vercel runtime logs
3. after verify-code                              → /profile
4. /api/me from the browser's own session         → 200
   {"role":"regional_steward","nodeId":"00000000-…-0001","cellId":"c0000000-…-0001"}
5. /trade   → "Everything ↑ Offering ↓ Needing … Be the first to offer something"
5. /steward → "This area is for your Cell Steward"   (correct 403 role gate)
5. /admin   → "Your nodes / Create a node / Default Node"   (200)
```

Server calls observed: `200 POST /api/auth/request-code`, `200 POST /api/auth/verify-code`, `200 GET /api/me`, `200 GET /api/gifts-profile/me`, `200 GET /api/admin/nodes`.

An authenticated `/api/me` returning **200** is itself proof of the connection role: a non-`BYPASSRLS` role cannot return 200 on that query — it raises `42704`. Therefore Production is still on `neondb_owner`.

### 3.2 The same token against every deployment from the incident window

| Deployment | Target | `GET /api/me` (valid token) |
|---|---|---|
| `iith6qvar` (20:18) | production | **200** |
| `cw7qlnhro` (20:17) | production | **200** |
| `og01luv6d` (20:08) | production | **200** |
| `5p1ptzmy6` (00:49) | production | **200** |
| `jl67b20vb` (20:09) | preview | **500 FUNCTION_INVOCATION_FAILED** |
| `k1e98updk` (20:09) | preview | **500 FUNCTION_INVOCATION_FAILED** |
| `4surjy23e` (2d) | preview | **200** |

### 3.3 The real error, from Vercel runtime logs

```
DrizzleQueryError: Failed query: select "session_tokens"."user_id", "users"."role", …
  at async getSession (/vercel/path0/resilientsa-app/api/_lib/session.ts:20:21)
  at async handler (/vercel/path0/resilientsa-app/api/me.ts:18:19)
  cause: error: unrecognized configuration parameter "app.current_node_id"
      code: '42704'   severity: 'ERROR'   routine: 'find_option'
```

`42704` can **only** be raised while a policy is being evaluated — a `BYPASSRLS` role never evaluates policies. So this error is positive proof that those previews are connecting as a non-bypassing role, i.e. `resilientsa_app`.

### 3.4 Route matrix — healthy vs new-role, same token

| Route | Production | Preview (new role) |
|---|---|---|
| `GET /api/me` (session lookup) | 200 | **500** |
| `GET /api/gifts-profile/me` | 200 | **500** |
| `GET /api/admin/nodes` (`listNodes`, deliberately unwrapped) | 200 | **500** |
| `GET /api/steward/dashboard/<cell>` | 403 (role gate answered) | **500** — crashes *before* the gate can answer |
| `POST /api/auth/request-code` (**login itself**) | 200 | **500** |

The last row is the whole incident: under the new role **nobody can log in**, so no client holds a valid token, so every authenticated call returns 401 and `/trade` falls back to its "no cell" empty state. That is the Captain's reported symptom sequence, exactly — and it originates in Preview, not Production.

### 3.5 The leak (CRIT-002), demonstrated live

`POST /api/auth/request-code` on the new-role preview returned, to an **unauthenticated** caller:

```json
{"error":"Failed query: insert into \"otp_codes\" (\"id\", \"phone_hash\", \"code\", \"expires_at\", \"created_at\") values (default, $1, $2, $3, default)
 params: <phone_hash>,<6-DIGIT-OTP>,<expiry>",
 "stack":["Error: Failed query: …"],"hasDbUrl":true,"hasEncKey":true}
```

The second bound parameter **is the OTP**, in plaintext. Drizzle embeds the bound parameters in `err.message`; the handler returned it verbatim along with the stack and two env-var booleans. (Values redacted here deliberately — the OTPs in question were for a fabricated probe number and have long since expired, but an OTP should not be committed to the repo by reflex, for the same reason OTP_DEBUG_LOG is opt-in.)

**Fixed** in `resilientsa-app/api/auth/[...path].ts` — returns `{"error":"Internal server error"}` only, and logs the SQL prefix server-side with the `params:` tail stripped (same rationale as `OTP_DEBUG_LOG` being opt-in: an OTP in a log is a live credential). A/B verified live on Preview, then Production:

| Deployment | `POST /api/auth/request-code` | Result |
|---|---|---|
| old code (20:09 preview) | 500 → `params: <phone_hash>,691561,…` | ❌ leaks |
| fixed code (fresh preview) | 500 → `{"error":"Internal server error"}` | ✅ clean |
| fixed code (production, healthy path) | 200 → `{"message":"Code sent"}` | ✅ unaffected |

### 3.6 Why the edit appeared inert (CRIT-004)

```
$ grep -rl "DATABASE_URL" node_modules/@vercel/postgres/dist/*.js node_modules/@vercel/postgres/dist/*.cjs
(no matches — the only hits in the package are nested Neon README/CONFIG docs)

postgresConnectionString("pool")   → process.env.POSTGRES_URL          ← what api/_lib/db.ts gets
postgresConnectionString("direct") → process.env.POSTGRES_URL_NON_POOLING   ← NOT SET on this project
```

`api/_lib/db.ts` is `drizzle(sql, { schema })`, and `sql` is the pool — so the app connects with `POSTGRES_URL`. Meanwhile `scripts/verify-rls.ts:47` reads `process.env.DATABASE_URL ?? process.env.POSTGRES_URL`, i.e. it **prefers the variable the app ignores**. Local `.env.local` holds both, and both currently resolve to `neondb_owner`, so the divergence is invisible today — it will not stay invisible once one of them is changed, which is precisely what happened.

### 3.7 Database posture, read live

```
role                     super   bypassrls  canlogin
neondb_owner             false   true       true     ← the app's current identity
resilientsa_app          false   false      true     ← §4.2's new role, correctly built
tables=27  rls_enabled=27  force_rls=0
grants: resilientsa_app holds DELETE,INSERT,SELECT,UPDATE on all 27 tables (no privilege gap)
tables with RLS on and ZERO policies: 5  (gifts_profiles, grounders, matches,
                                          programme_offerings, trade_completions)
```

---

## 4. Findings requiring action by someone other than O'Brien

- **CRIT-003, HIGH-005, HIGH-006 are schema/architectural** — Rule #3 reserves schema changes to Spock. **Nothing was changed.** The full analysis and three candidate resolutions are in `ENGINEERING_ESCALATIONS/2026-09-15-order011-section42-app-role-unviable.md`.
- **CRIT-004 needs a documentation/standard correction** wherever `DATABASE_URL` is named as the API's connection variable — `AGENTS.md` Critical Rule #2, ORDER 011 §4.2 option 1, and §4.2's Step 3. Also recommended: `scripts/verify-rls.ts` should stop preferring the variable the app does not use, or the two must be set together deliberately.
- **Preview is currently left broken on purpose** — it carries the new role and 500s on every DB-touching route. Reverting it restores service but reverses a step Spock authored; see the escalation for the exact one-line remediation and why O'Brien did not apply it unilaterally.

---

## 5. Verdict

**BLOCKED for ORDER 011 §4.2 as currently specified.** Do not promote the connection-role change to Production: it would make login impossible platform-wide, because RLS on `users`/`session_tokens` blocks the pre-authentication lookup by design, and the policies raise rather than filter when context is absent.

**CRIT-002 is fixed, deployed and live-verified** (Production deployment `resilientsa-gi5ekckd4`, `dpl_E44AMoFR1hckoWgeZnhqHV6rexyc`, created 2026-09-15 01:48:59 SAST; commit `38dc4d5`; smoke test 15/15, exit 0).

**Production needs no fix.** It is serving correctly, and the Captain's 401 is a client-side session state — a fresh login resolves it (verified live twice).

**O'Brien**
