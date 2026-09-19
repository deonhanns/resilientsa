# CREW-ORDER-011 §4.2 — A1 Revision: `nullif` for the empty-string GUC case
**Date:** 2026-09-19 (second ruling of the day)
**Issued by:** Spock, in response to O'Brien's step-5 second attempt

---

## What this fixes

O'Brien's live test (proof: `count(users)=10` with the real node context, `count(users)=0` with a nonexistent one — **first positive proof RLS enforcement works since 2026-07-02**) also found that `current_setting('app.current_node_id', true)` returns an **empty string**, not `NULL`, when unset on this Neon pooler — contradicting the assumption A1's `::uuid` casts were written under. An empty string cast to `uuid` raises `22P02`, so an absent context still crashes instead of failing closed, on the app role specifically.

Confirmed directly in `scripts/sql/2026-09-19-order011-4.2-a1-null-tolerant-policies.sql`: every `node_id`/`id`-scoped policy casts straight to `::uuid` with no guard for `''`. The two role-string policies (`external_signals`, `notification_log`) already check `<> ''` explicitly and need no change.

## Ruling — approved

Wrap every `uuid`-cast `current_setting(...)` call in `nullif(..., '')` so an empty string becomes a real `NULL` before the cast, which then behaves exactly as A1 originally intended (comparison against `NULL` → the row is filtered → deny, no error).

```sql
-- A1-REVISION — apply in place of the corresponding statements in
-- 2026-09-19-order011-4.2-a1-null-tolerant-policies.sql. Idempotent;
-- changes no behaviour on neondb_owner (still BYPASSRLS).

ALTER POLICY node_isolation ON public.anticipatory_alerts
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.cells
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.community_exchange_reference
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.community_health_assessments
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.connection_events
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.crisis_mode
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.internal_forecasts
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.listings
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.multi_signal_alerts
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.network_phase_snapshots
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.offering_endorsements
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.offering_engagements
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.users
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);
ALTER POLICY node_isolation ON public.value_charters
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid);

ALTER POLICY node_isolation ON public.nodes
  USING (id = nullif(current_setting('app.current_node_id', true), '')::uuid);

ALTER POLICY coop_pii_cooperatives_node_isolation ON coop_pii.cooperatives
  USING (node_id = nullif(current_setting('app.current_node_id', true), '')::uuid
         AND current_setting('app.current_role', true) = 'node_admin');
ALTER POLICY coop_pii_status_events_node_isolation ON coop_pii.cooperative_status_events
  USING (cooperative_id IN (
           SELECT c.id FROM coop_pii.cooperatives c
           WHERE c.node_id = nullif(current_setting('app.current_node_id', true), '')::uuid)
         AND current_setting('app.current_role', true) = 'node_admin');
ALTER POLICY coop_pii_node_admin_only ON coop_pii.founding_members
  USING (cooperative_id IN (
           SELECT c.id FROM coop_pii.cooperatives c
           WHERE c.node_id = nullif(current_setting('app.current_node_id', true), '')::uuid)
         AND current_setting('app.current_role', true) = 'node_admin');
```

No change to `external_signals`/`notification_log` — their existing `<> ''` check already covers this case.

## Assertion 3's baseline — approved as O'Brien proposed

`verify-rls.ts`'s baseline assumed a bypassing connection (contextless read = "there is data to hide"). That assumption is now false by design — the whole point of the app role is that it *doesn't* bypass. Rewrite assertion 3 to:
1. Set a real, known-good context (an actual node/user pair known to have rows).
2. Assert that context sees the expected data (visibility proof).
3. Set a fabricated/nonexistent context.
4. Assert that context sees nothing (denial proof).

This is exactly the two-sided test O'Brien already ran manually and reported (10 vs 0) — formalize it into the script rather than leaving it as a one-off manual check.

## Authorization

Apply the A1-revision SQL (same idempotent, single-transaction, before/after-asserting `apply-rls-redesign.ts` pattern already used — no need to rebuild that harness), rewrite assertion 3 per above, then **re-run step 5 in full**. If it now reaches exit 0, proceed per the existing rollout: merge `order-011-4.2-part-b`, propose step 6. If anything else surfaces, same standing rule — stop and report rather than deciding it unilaterally.

---

*Spock, 2026-09-19.*
