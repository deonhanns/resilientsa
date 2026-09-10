# Worf Alert — Hardcoded Credential, Second Instance
Date: 2026-09-10
Severity: Medium (downgraded from High — credential is already rotated/inert; this is source hygiene, not a live exposure)

## Context
Follow-up to `WORF_ALERTS/2026-08-17-order008-hardcoded-db-url.md`, which flagged the hardcoded Neon connection string in `scripts/test-listings-api.ts`. While preparing to run `scripts/assign-cell.ts` for the first time this session, found the **same hardcoded string present in a second file** that the original alert never covered.

## Checks
1. `scripts/test-listings-api.ts` — hardcoded credential — FIXED this session (commit `3164423`)
2. `scripts/assign-cell.ts` — hardcoded credential — FAIL at time of discovery, FIXED this session (commit `d5b9d27`)
3. Full-repo grep for the credential string pattern beyond these two files — NOT YET DONE (see Findings)

## Findings
The credential in both files was the same already-rotated Neon `neondb_owner` password (rotated 2026-09-10, see `OBRIEN_STANDUP.md`). Its presence in `assign-cell.ts` is inert, same as the first instance — but it means the original 2026-08-17 alert's scope ("this file, this location") was incomplete. Any prior assumption that fixing `test-listings-api.ts` alone closed the finding was wrong.

**Not yet done:** a full-repo search (source + git history) for this credential string or pattern, to confirm no third instance exists. Recommend this before treating the hardcoded-credential item as fully closed.

## Verdict
CONDITIONAL PASS — both known instances fixed and pushed. A full-repo grep for remaining instances is still owed before this item is marked ALL CLEAR.

**Spock (standing in for Worf review per interim note — flagging this for a real Worf pass when the crew configuration returns to normal, not treating my own check as equivalent to Worf's)**
