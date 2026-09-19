# CREW-ORDER-011 §4.2 — Gate Defects, Ruled
**Date:** 2026-09-19
**Issued by:** Spock, in response to O'Brien's step-5 gate-failure report
**Status:** Step 5 not yet re-attemptable until the gate itself is fixed per below

---

## Ownership

`verify-rls-live.ts`'s two defects (route coverage, verdict mapping) are flaws in the design I approved, not something O'Brien introduced. Ruling on both, plus the credential question and the marketplace bug's disposition.

---

## 1. Coverage — fixed by reuse, not a second route list

The authenticated matrix must probe the client's actual route set. **Do not hand-author a second list of routes** — that creates exactly the two-lists-that-must-stay-in-sync problem this project keeps re-learning to avoid. `scripts/smoke-routes.ts` (CREW-ORDER-010) already is the client's real route inventory. `verify-rls-live.ts`'s authenticated matrix should import and drive off that same list, so the two can never silently diverge again.

## 2. Verdict mapping — three-state, not two

Approved as O'Brien proposed. Exit codes:
- **0 — PASS.** Every probed route behaved correctly: privileged-pool routes unaffected, node-scoped routes correctly enforced or correctly denied, no unexpected 5xx anywhere in the full client route set.
- **1 — FAIL.** A definite enforcement failure or an unexpected 5xx was observed. This is the only exit code that should read as "do not proceed."
- **2 — INCONCLUSIVE.** Something could not be checked (e.g. assertion 3 without a credential). This must never be reported or treated as equivalent to a PASS, but it must also never be reported as a FAIL — it's "nothing proven," and the gate's own text should say so plainly rather than letting an operator round it up or down.

Reuse `verify-rls.ts`'s existing REFUSED/exit-4 convention for the specific "connected as a role that bypasses RLS" case, folded into this scheme as one instance of INCONCLUSIVE, not a fourth state.

## 3. Assertion 3's credential — approved via `.env.local`

Captain supplies the `resilientsa_app` connection string directly into `resilientsa-app/.env.local` (gitignored, already on the Restricted Files list in `AGENTS.md`) for O'Brien's local verification run. This is ordinary local-dev credential provisioning, identical in kind to how `POSTGRES_URL` has always reached local environments — not a new pattern, not a schema/connection decision, approved without further ceremony.

## 4. Marketplace browse 500 — real, unrelated, needs its own order

Confirmed by O'Brien's own evidence: identical failure under both the owner role and the app role means this cannot be RLS, cannot be Part B, and predates this order entirely. Not investigated further tonight — it gets its own Crew Order, and `BONES_VERDICT.md`'s ORDER 008 CONDITIONAL PASS needs an explicit note that it could not have been judged against a working data path for this specific screen, since the path has apparently never worked.

## 5. Preview's current state — leave as is

`resilientsa-r3m8bbmjm` (app role, Part B, working end-to-end except the pre-existing marketplace bug) stays as the running Preview. No rollback. Production remains untouched and healthy.

---

*Spock, 2026-09-19.*
