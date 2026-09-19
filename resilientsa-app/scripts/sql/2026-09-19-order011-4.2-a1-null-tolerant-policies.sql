-- =====================================================================
-- CREW-ORDER-011 §4.2 rollout — STEP 1 of 8: Part A1
-- Make every GUC-referencing RLS policy tolerate an absent setting.
--
-- Authority: CREW-ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-draft.md §3 A1,
-- approved in full and promoted to ACTIVE by
-- CREW-ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-approval.md (Spock, 2026-09-18).
--
-- WHY: current_setting(name) raises 42704 "unrecognized configuration parameter"
-- when the setting is absent. With the second (missing_ok) argument it returns
-- NULL, and every comparison below then evaluates to NULL -> the row is filtered
-- out -> deny. Fail-closed without an error. This is what turned a missing RLS
-- context into a hard 500 on the login path on 2026-09-14.
--
-- SAFETY: this step changes NO behaviour on the current connection. The app
-- connects as neondb_owner, which carries BYPASSRLS and therefore never
-- evaluates a policy at all. Statements are idempotent; re-running is a no-op.
--
-- NOT INCLUDED, deliberately:
--   * WITH CHECK is not restated — these are FOR ALL policies with a USING
--     expression only, and PostgreSQL then applies USING as the insert/update
--     check. An insert must therefore carry the row's own node_id equal to the
--     context, which is the behaviour we want (and why createNode stays on the
--     privileged connection).
--   * public.nodes is scoped on id, not node_id — NOT a typo.
-- =====================================================================

-- ---- public: node-scoped on node_id (14) -----------------------------
ALTER POLICY node_isolation ON public.anticipatory_alerts
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.cells
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.community_exchange_reference
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.community_health_assessments
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.connection_events
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.crisis_mode
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.internal_forecasts
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.listings
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.multi_signal_alerts
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.network_phase_snapshots
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.offering_endorsements
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.offering_engagements
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.users
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

ALTER POLICY node_isolation ON public.value_charters
  USING (node_id = current_setting('app.current_node_id', true)::uuid);

-- ---- public: node-scoped on id (1) — the column really is id --------
ALTER POLICY node_isolation ON public.nodes
  USING (id = current_setting('app.current_node_id', true)::uuid);

-- ---- public: role-present only (2) ---------------------------------
-- These two were never node-scoped; their original text was
-- current_setting('app.current_role') <> ''. They still require the caller to
-- set a context, so a route touching them must run inside withRLSContext or on
-- the privileged pool. notification_log writes stay on the privileged pool per
-- the approval's answer 2; see the draft §3 A1 caveat.
ALTER POLICY authenticated_select ON public.external_signals
  USING (current_setting('app.current_role', true) IS NOT NULL
         AND current_setting('app.current_role', true) <> '');

ALTER POLICY authenticated_select ON public.notification_log
  USING (current_setting('app.current_role', true) IS NOT NULL
         AND current_setting('app.current_role', true) <> '');

-- ---- coop_pii: node + role (3) -------------------------------------
ALTER POLICY coop_pii_cooperatives_node_isolation ON coop_pii.cooperatives
  USING (node_id = current_setting('app.current_node_id', true)::uuid
         AND current_setting('app.current_role', true) = 'node_admin');

ALTER POLICY coop_pii_status_events_node_isolation ON coop_pii.cooperative_status_events
  USING (cooperative_id IN (
           SELECT c.id FROM coop_pii.cooperatives c
           WHERE c.node_id = current_setting('app.current_node_id', true)::uuid)
         AND current_setting('app.current_role', true) = 'node_admin');

ALTER POLICY coop_pii_node_admin_only ON coop_pii.founding_members
  USING (cooperative_id IN (
           SELECT c.id FROM coop_pii.cooperatives c
           WHERE c.node_id = current_setting('app.current_node_id', true)::uuid)
         AND current_setting('app.current_role', true) = 'node_admin');
