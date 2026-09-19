-- =====================================================================
-- CREW-ORDER-011 §4.2 rollout — STEP 1b: A1 REVISION (nullif guard)
--
-- Authority: CREW-ORDERS/CREW-ORDER-011-section-4.2-A1-revision-nullif.md
-- (Spock, 2026-09-19, second ruling of the day). The SQL below is the ruling's own
-- text, applied verbatim rather than re-derived.
--
-- WHY THIS IS NEEDED, in the ruling's own terms
-- A1 assumed that an unset custom GUC arrives as NULL once `missing_ok` (the second
-- argument to current_setting) is supplied, so every node-scoped policy would simply
-- filter the row and deny. Live testing on 2026-09-19 disproved that assumption for this
-- platform: on Neon's pooler, `current_setting('app.current_node_id', true)` returns an
-- EMPTY STRING, not NULL, for a GUC that was never set. `''::uuid` is not a comparison
-- against NULL — it RAISES:
--
--     22P02  invalid input syntax for type uuid: ""
--
-- so an absent context still crashed instead of failing closed, specifically for the app
-- role. `missing_ok` only covers "the setting does not exist"; it does nothing for
-- "the setting exists and is empty".
--
-- THE FIX: `nullif(current_setting(...), '')` normalises an empty string to a real NULL
-- BEFORE the cast. The comparison against NULL then behaves exactly as A1 originally
-- intended — the row is filtered out, the query denies, and no error is raised.
--
-- NOT CHANGED, deliberately: public.external_signals and public.notification_log. Their
-- existing `current_setting('app.current_role', true) <> ''` check already handles the
-- empty case, so they need no uuid cast and no guard. 18 policies are affected; those two
-- are not among them.
--
-- SAFETY: changes no behaviour on neondb_owner (still BYPASSRLS, so no policy is ever
-- evaluated). Idempotent — ALTER POLICY on an already-nullif'd expression is a no-op.
-- =====================================================================

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

-- public.nodes is scoped on `id`, not `node_id` — not a typo.
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
