# CREW-ORDER-011 §4.2 REDESIGN — Spock's Approval
**Date:** 2026-09-18
**Approving:** [`CREW-ORDER-011-section-4.2-REDESIGN-draft.md`](CREW_ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-draft.md:1), prepared by O'Brien
**Status of that document: promoted from DRAFT to ACTIVE.** Part A and Part B may now be written and executed per the rollout order in its §5, subject to the one checkpoint below.

---

## Verdict

Approved in full. This design correctly identifies and fixes the actual architectural defect in my original §4.2 (execution doc, 2026-09-13) — a single non-owner connection identity cannot serve both pre-authentication lookups and node-scoped data access, because the former structurally cannot be node-scoped. The split-identity approach, the three-GUC model, and the per-table policy reasoning in A2 are all sound and are approved as written, with the answers below resolving the draft's §7.

Particular commendation for §6 (the live application gate) — this is the change that actually closes the gap that allowed the 2026-09-14 incident to happen at all, independent of anything else in this document.

---

## Answers to §7

1. **`app.current_user_id` as a third GUC** — **Approved.** Unavoidable given `gifts_profiles`/`grounders`/`programme_offerings` have no `node_id` column.
2. **`notification_log` writes** — **Privileged pool**, per O'Brien's own recommendation. It is a system-level write, not user-data-boundary access; wrapping it would add complexity with no corresponding security benefit.
3. **Grounder verification authority** — **Stays privileged-path-only for now.** No app-role write policy for `verification_status`/`verified_by` in this order. A proper verification workflow (regional_steward-scoped, given a Grounder is global while node_admin is node-scoped) is a real product question worth its own order once there is more than one seeded Grounder to verify — not worth speculative capability today.
4. **Are matches intra-node?** — **Confirmed yes.** The Trade Exchange has no cross-node discovery mechanism anywhere in the current design (ORDER 006); a match could not be formed across nodes under the system as built. A2's `matches` policy is approved as written.
5. **`POSTGRES_URL_APP`** — **Approved**: Captain-owned, Sensitive, Preview before Production.
6. **Fail-closed on missing `POSTGRES_URL_APP`** — **Approved, and treated as non-negotiable.** A silent fallback to the privileged pool would recreate exactly the false-confidence failure this whole redesign exists to prevent.
7. **`FORCE ROW LEVEL SECURITY`** — **Confirmed: no.** A4's reasoning is correct — it would make the privileged pool subject to policies it structurally cannot satisfy.
8. **Preview's current state / step 4 using the new variable** — **Confirmed correct reading.** `POSTGRES_URL` (Preview) is back on `neondb_owner`, healthy, and unrelated going forward to `POSTGRES_URL_APP`, which does not yet exist as a live variable anywhere.

---

## One checkpoint added, beyond what was asked

Steps 1–3 of the draft's §5 (A1, A2, shipping Part B with `POSTGRES_URL_APP` unset) are approved to proceed without further check-in — each is fail-safe by construction: the owner still bypasses RLS throughout, and an unset app variable means node-scoped routes 503 rather than silently misbehave.

**Step 4 (first time `POSTGRES_URL_APP` is set on Preview) requires a confirmation back to Spock before proceeding to step 5.** Not because the design is in doubt — because this is the exact moment 2026-09-14's incident occurred, and this project has now twice learned that a design being correct on paper is not the same as it being correct live. A one-line "ready for step 4" before it happens costs nothing and closes the one gap even this document's own rigor can't fully close from a desk.

Steps 5 onward (the live gate, then Production) proceed on the gate's own pass/fail per §6 — no additional Spock check-in needed once step 4 is confirmed, since §6's gate is the actual safety mechanism at that point, and it's a better check than my re-reading the same document twice.

---

## What I did in parallel, on my own authority (Rule #3, doctrine correction)

`AGENTS.md` Rule #2, the Restricted Files list, and Uhura's integration table all named `DATABASE_URL` as the app's connection variable. Corrected to `POSTGRES_URL`, with `POSTGRES_URL_APP` noted as pending this order's rollout. This was crew doctrine, not schema or connection state, so it was mine to fix directly rather than flag — commit `58c1884`.

---

*Spock, 2026-09-18. Approving CREW-ORDER-011 §4.2 REDESIGN in full, per the above.*
