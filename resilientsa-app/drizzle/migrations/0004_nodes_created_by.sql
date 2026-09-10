-- 0004_nodes_created_by.sql
-- CREW-ORDER-009a — additive only: ADD COLUMN + ADD CONSTRAINT, no DROP/ALTER of
-- existing columns, no row rewrite. Safe against the existing placeholder node
-- (created_by will be NULL there, which is correct — nobody "created" it via
-- the regional_steward flow this order introduces).

ALTER TABLE nodes ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE nodes ADD CONSTRAINT IF NOT EXISTS nodes_created_by_users_id_fk
  FOREIGN KEY (created_by) REFERENCES users(id);
