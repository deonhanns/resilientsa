# Worf Alert — Hardcoded Credential, Full Repo Sweep
Date: 2026-09-10
Severity: Medium → RESOLVED (credential was already rotated/inert throughout; this was source hygiene, not a live exposure)

## Context
Follow-up to `WORF_ALERTS/2026-08-17-order008-hardcoded-db-url.md` (flagged `test-listings-api.ts` only) and this session's own first addendum (flagged a 2nd instance in `assign-cell.ts`). A full-repo GitHub code search for the credential string turned up **six total instances**, not two.

## Checks
1. `scripts/test-listings-api.ts` — FIXED (commit `3164423`)
2. `scripts/assign-cell.ts` — FIXED, also hardened targeting logic (commit `d5b9d27`)
3. `scripts/verify-db.ts` — FIXED (commit `3001c6a`)
4. `scripts/add-rls-new-tables.ts` — FIXED (commit `daca361`)
5. `scripts/create-default-node.ts` — FIXED (commit `6bbf763`)
6. `scripts/apply-custom-migration.ts` — FIXED (commit `dbe2e91`) — notable: this one applies a raw SQL migration file directly, so it was sitting armed with a credential and no env-var guard, not just a read-only diagnostic script
7. Fresh clone + full-repo grep for the credential string, post-fix — CLEAN, zero remaining instances in source (commit history still contains it — see below)
8. `npm run build` after all six fixes — zero errors, verified directly in this session's sandbox (not just asserted)

## Findings
All six files followed the identical pattern: a hardcoded `postgresql://neondb_owner:npg_nWYCKt34Zueg@...` connection string, introduced during ORDER 003 (schema) and ORDER 008 (schema fix / verification) sessions. The credential itself was rotated 2026-09-10 (see `OBRIEN_STANDUP.md`), so none of these represented a live-secret exposure at the time of this sweep — but five of the six had never been flagged before this session, meaning the original 2026-08-17 alert's scope was significantly incomplete.

**Root cause pattern:** ad-hoc one-off diagnostic/migration scripts written directly against a live connection string during active debugging sessions, without following the `process.env.DATABASE_URL` convention already established in `seed-grounder.ts` from the start.

**Still open:** the credential string remains in git history (multiple prior commits). Not rewritten this session — inert credential, Captain/Worf call on whether history rewrite is ever warranted for a rotated secret.

## Verdict
ALL CLEAR for current source — all six known instances fixed, full-repo grep confirms no stragglers, build verified clean. Git-history residue remains and should be treated as the actual outstanding item, not silently closed.

**Recommendation:** any future one-off script under `scripts/` should be written against `process.env.DATABASE_URL` from the start — this is now the established convention across all scripts in the directory, not just some of them.

**Spock (standing in for Worf review per interim note)**
