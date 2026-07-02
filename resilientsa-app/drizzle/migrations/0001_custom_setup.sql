-- Custom migration: Schema setup, pgcrypto, RLS policies, and indexes
-- Runs after drizzle-kit generated migration

-- Enable pgcrypto for column encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create coop_pii schema for PII-sensitive cooperative formation data
CREATE SCHEMA IF NOT EXISTS coop_pii;

-- Move coop_pii tables from public to coop_pii schema (Drizzle does not apply
-- the pgTable schema option to generated SQL — ORM-level only)
ALTER TABLE cooperative_status_events SET SCHEMA coop_pii;
ALTER TABLE cooperatives SET SCHEMA coop_pii;
ALTER TABLE founding_members SET SCHEMA coop_pii;

-- ============================================================
-- ROW-LEVEL SECURITY — Enable on every table
-- ============================================================

-- Public schema tables
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_exchange_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_charters ENABLE ROW LEVEL SECURITY;
ALTER TABLE grounders ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offering_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE offering_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_phase_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE anticipatory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_signal_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- coop_pii schema tables
ALTER TABLE coop_pii.cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE coop_pii.founding_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE coop_pii.cooperative_status_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES — Node isolation (tenant isolation at DB layer)
-- ============================================================

-- Tables with node_id column (scoped per-node)
CREATE POLICY node_isolation ON nodes
  USING (id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON cells
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON users
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON listings
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON community_exchange_reference
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON value_charters
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON offering_engagements
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON connection_events
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON network_phase_snapshots
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON crisis_mode
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON internal_forecasts
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON anticipatory_alerts
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON multi_signal_alerts
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON community_health_assessments
  USING (node_id = current_setting('app.current_node_id')::uuid);

CREATE POLICY node_isolation ON offering_endorsements
  USING (node_id = current_setting('app.current_node_id')::uuid);

-- Global tables (no node_id — accessible to all authenticated tenants)
-- These scoped via application logic: external_signals, programme_offerings,
-- grounders (scoped by the Grounder's own visibility), gifts_profiles, matches,
-- trade_completions, notification_log

CREATE POLICY authenticated_select ON notification_log
  FOR SELECT
  USING (current_setting('app.current_role') != '');

CREATE POLICY authenticated_select ON external_signals
  FOR SELECT
  USING (current_setting('app.current_role') != '');

-- coop_pii: node_admin only, scoped to their cooperative's node
CREATE POLICY coop_pii_node_admin_only ON coop_pii.founding_members
  USING (
    cooperative_id IN (
      SELECT id FROM coop_pii.cooperatives
      WHERE node_id = current_setting('app.current_node_id')::uuid
    )
    AND current_setting('app.current_role') = 'node_admin'
  );

CREATE POLICY coop_pii_cooperatives_node_isolation ON coop_pii.cooperatives
  USING (
    node_id = current_setting('app.current_node_id')::uuid
    AND current_setting('app.current_role') = 'node_admin'
  );

CREATE POLICY coop_pii_status_events_node_isolation ON coop_pii.cooperative_status_events
  USING (
    cooperative_id IN (
      SELECT id FROM coop_pii.cooperatives
      WHERE node_id = current_setting('app.current_node_id')::uuid
    )
    AND current_setting('app.current_role') = 'node_admin'
  );

-- ============================================================
-- KEY INDEXES
-- ============================================================

CREATE INDEX idx_listings_node_id ON listings(node_id);
CREATE INDEX idx_listings_pillar_tags ON listings USING GIN(pillar_tags);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_connection_events_node_id ON connection_events(node_id);
CREATE INDEX idx_network_phase_snapshots_node_id ON network_phase_snapshots(node_id);
CREATE INDEX idx_anticipatory_alerts_node_id ON anticipatory_alerts(node_id);
CREATE INDEX idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX idx_users_node_id ON users(node_id);
CREATE INDEX idx_cells_node_id ON cells(node_id);
CREATE INDEX idx_listings_cell_id ON listings(cell_id);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_matches_listing_ids ON matches USING GIN(listing_ids);
CREATE INDEX idx_connection_events_user_a_id ON connection_events(user_a_id);
CREATE INDEX idx_connection_events_user_b_id ON connection_events(user_b_id);
CREATE INDEX idx_internal_forecasts_node_id ON internal_forecasts(node_id);
CREATE INDEX idx_internal_forecasts_cell_id ON internal_forecasts(cell_id);
CREATE INDEX idx_multi_signal_alerts_node_id ON multi_signal_alerts(node_id);
CREATE INDEX idx_community_health_assessments_node_id ON community_health_assessments(node_id);
CREATE INDEX idx_notification_log_channel ON notification_log(channel);
