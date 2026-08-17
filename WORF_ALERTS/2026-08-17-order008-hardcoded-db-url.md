# Worf Alert — ORDER 008 Schema Fix
Date: 2026-08-17
Severity: High

## Summary
During ORDER 008 schema-fix verification, a **hardcoded Neon DATABASE_URL connection string** was identified in a committed file. This violates AGENTS.md Critical Rule #2 (never hardcode secrets) and the POPIA-adjacent security posture (credential exposure in source control).

## Location
- [`resilientsa-app/scripts/test-listings-api.ts:5`](../resilientsa-app/scripts/test-listings-api.ts) — `const DB_URL = 'postgresql://neondb_owner:...@ep-weathered-rice-...neon.tech/neondb?sslmode=require'`

The connection string contains a live database user password. It was committed in a prior session (pre-existing finding, not introduced by ORDER 008).

## Checks
1. [Credentials committed to source control] — **FAIL** (High)
2. [Credential rotation performed] — **FAIL** (action required)
3. [Secret removed from repo] — **FAIL** (action required)
4. [New secret-free test file replacing it] — **PENDING**

## Findings
- The DB URL grants `neondb_owner` access to the Neon `resilientsa`/`neondb` database. Anyone with repo access can connect and read/write data.
- The value is identical to what would live in `.env.local`/Vercel env, which are correctly gitignored — the leak is the hardcoded copy in the committed script.
- Allowed by the Captain (2026-08-17) for this session's one-off migration/seed/route verification, on the condition that rotation + removal are flagged here.

## Actions Required (Captain + Worf + O'Brien)
1. **Rotate the Neon password / DATABASE_URL** (Captain holds Neon console access) — immediately.
2. **Remove the hardcoded `DB_URL`** from `scripts/test-listings-api.ts` and replace with `process.env.DATABASE_URL!` — O'Brien, pending Captain approval.
3. **Verify `.env.local` is restored with the rotated value** and confirm no other committed file contains the old credential (grep for the host fragment before rotation).

## Verdict
**BLOCKED (security remediation pending)** — this does not block ORDER 008's schema fix itself (the fix is complete and verified, no new PII, no RLS regression), but the hardcoded credential must be rotated and removed before the next deployment cycle that touches production data. Flagged to Captain for rotation.

**Worf**
