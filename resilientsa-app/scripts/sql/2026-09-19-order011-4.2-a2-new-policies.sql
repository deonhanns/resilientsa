-- =====================================================================
-- CREW-ORDER-011 §4.2 rollout — STEP 2 of 8: Part A2
-- Real policies for the 5 tables that had RLS enabled and ZERO policies.
--
-- Authority: CREW-ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-draft.md §3 A2,
-- approved in full by CREW-ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-approval.md
-- (Spock, 2026-09-18), including the two judgements the Captain asked for:
--   * grounders and programme_offerings are GLOBAL, not node-scoped (ORDER 008).
--   * grounders gets NO insert policy, deliberately — see below.
--
-- WHY: "RLS enabled with no policy" is deny-all for any role that is not the
-- table owner. Every one of these five tables was therefore unusable the moment a
-- non-owner role connected, which is a second, independent reason the 2026-09-14
-- app-role rollout failed beyond the missing_ok defect.
--
-- DEVIATION FROM THE APPROVED TEXT, stated plainly: each CREATE is preceded by
-- DROP POLICY IF EXISTS with the same name. End state is identical; the only
-- effect is that this file is re-runnable. The approved draft used bare CREATE,
-- which errors on a second run. Policies have no dependents, so the drop is safe.
--
-- SAFETY: as with A1, behaviour for the current connection is unchanged —
-- neondb_owner carries BYPASSRLS and never evaluates a policy. Verified by the
-- applier's before/after assertion, not asserted by assumption.
-- =====================================================================

-- ---------------------------------------------------------------------
-- gifts_profiles — member-owned, node-visible. No node_id column.
-- A member reads/writes their own profile. A Cell Steward must be able to READ
-- same-node members' profiles to compute aggregates, but must NOT be able to
-- write another member's — hence read and write are deliberately asymmetric.
-- Index used by the subquery already exists: idx_users_node_id (migration 0001).
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS gifts_profiles_read ON public.gifts_profiles;
CREATE POLICY gifts_profiles_read ON public.gifts_profiles
  USING (
    user_id = current_setting('app.current_user_id', true)::uuid
    OR user_id IN (
         SELECT u.id FROM public.users u
         WHERE u.node_id = current_setting('app.current_node_id', true)::uuid)
  )
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)::uuid
  );

-- ---------------------------------------------------------------------
-- grounders — GLOBAL by design. A Grounder is an organisation offering
-- programmes to communities; it is not a resident of any node (ORDER 008).
-- Read: any contexted session. Write: the Grounder who owns the record.
--
-- ⚠ NO INSERT POLICY, deliberately. Per ORDER 008 §6 a user's grounder
-- capability is derived from the existence of a grounders row for their
-- user_id, so a self-INSERT policy would be a privilege-escalation path: any
-- member could make themselves a Grounder. Grounder records are created only by
-- the privileged path (today scripts/seed-grounder.ts). Do not "fix" the
-- apparent omission. Verification authority (verification_status/verified_by)
-- is likewise privileged-only for now, per the approval's answer 3.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS grounders_read ON public.grounders;
CREATE POLICY grounders_read ON public.grounders
  FOR SELECT
  USING (current_setting('app.current_role', true) IS NOT NULL
         AND current_setting('app.current_role', true) <> '');

DROP POLICY IF EXISTS grounders_owner_update ON public.grounders;
CREATE POLICY grounders_owner_update ON public.grounders
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---------------------------------------------------------------------
-- programme_offerings — GLOBAL: a Grounder's offering is browsable by every
-- community. Read for any contexted session; write only by the owning Grounder,
-- resolved grounder_id -> grounders.user_id.
--
-- NOTE ON POLICY COMPOSITION: the subquery reads public.grounders, so
-- grounders_read above is ALSO evaluated for it — RLS applies to every table
-- named inside a policy, not just the policy's own table. That is why
-- grounders_read must permit a contexted read. Load-bearing: relaxing one
-- policy can silently change another's behaviour.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS programme_offerings_read ON public.programme_offerings;
CREATE POLICY programme_offerings_read ON public.programme_offerings
  FOR SELECT
  USING (current_setting('app.current_role', true) IS NOT NULL
         AND current_setting('app.current_role', true) <> '');

DROP POLICY IF EXISTS programme_offerings_owner_write ON public.programme_offerings;
CREATE POLICY programme_offerings_owner_write ON public.programme_offerings
  FOR ALL
  USING (grounder_id IN (
           SELECT g.id FROM public.grounders g
           WHERE g.user_id = current_setting('app.current_user_id', true)::uuid))
  WITH CHECK (grounder_id IN (
           SELECT g.id FROM public.grounders g
           WHERE g.user_id = current_setting('app.current_user_id', true)::uuid));

-- ---------------------------------------------------------------------
-- matches — no node_id column. A match joins two listings, and listings ARE
-- node-scoped, so the boundary is inherited through listing_ids.
-- ASSUMPTION, confirmed by Spock (approval answer 4): a match is intra-node.
-- The Trade Exchange has no cross-node discovery mechanism, so a cross-node
-- match cannot be formed under the system as built. If that ever changes, this
-- policy makes such a match invisible and matches needs a deliberate node_id.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS matches_node_isolation ON public.matches;
CREATE POLICY matches_node_isolation ON public.matches
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = ANY (matches.listing_ids)
        AND l.node_id = current_setting('app.current_node_id', true)::uuid)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = ANY (matches.listing_ids)
        AND l.node_id = current_setting('app.current_node_id', true)::uuid)
  );

-- ---------------------------------------------------------------------
-- trade_completions — references a match. Written EXPLICITLY (two hops) rather
-- than as `match_id IN (SELECT id FROM matches)`, even though that is shorter.
-- Reason: relying on another table's policy to supply this one's isolation means
-- any future relaxation of matches' policy silently relaxes this one too.
-- Self-contained is worth the extra join.
-- No WITH CHECK: this is a FOR ALL policy with USING only, so PostgreSQL applies
-- USING as the insert/update check — a completion must reference a match visible
-- in the caller's node.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS trade_completions_node_isolation ON public.trade_completions;
CREATE POLICY trade_completions_node_isolation ON public.trade_completions
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = trade_completions.match_id
        AND EXISTS (
          SELECT 1 FROM public.listings l
          WHERE l.id = ANY (m.listing_ids)
            AND l.node_id = current_setting('app.current_node_id', true)::uuid))
  );

-- ---------------------------------------------------------------------
-- POST-CONDITION (the applier asserts this, and the audit query below is the
-- one named in the approved draft §3 A2). Must return ZERO rows after A2:
--
--   SELECT n.nspname||'.'||c.relname FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE c.relkind='r' AND c.relrowsecurity
--     AND n.nspname IN ('public','coop_pii')
--     AND NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid);
-- ---------------------------------------------------------------------
