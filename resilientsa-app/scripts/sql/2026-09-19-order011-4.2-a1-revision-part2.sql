-- =====================================================================
-- CREW-ORDER-011 §4.2 rollout — STEP 2b: A1 REVISION, PART 2
-- The 5 policies A2 introduced that carry an unguarded ::uuid cast.
--
-- Authority: CREW-ORDERS/CREW-ORDER-011-section-4.2-A1-revision-part2.md
-- (Spock, 2026-09-19, third ruling of the day). SQL below is the ruling's own text,
-- applied verbatim rather than re-derived.
--
-- WHY: part 1 fixed the 18 policies in the A1 file. A1's own arithmetic stopped there,
-- but the database held 23 unguarded uuid casts, because A2 added five policies months
-- of intent later that cast custom GUCs the same way. Three of the five cast
-- app.current_node_id; two cast app.current_user_id. The ruling confirms the reasoning
-- applies identically to both variables: the empty-string-not-NULL behaviour is a
-- property of this platform's handling of ANY unset custom GUC, not of one name.
--
-- These are DROP + CREATE rather than ALTER because the ruling specified dropping and
-- recreating; CREATE POLICY cannot be used twice under the same name, so the DROP is
-- what makes this file re-runnable. Everything runs in the applier's single transaction.
--
-- SAFETY: unchanged for neondb_owner (BYPASSRLS — no policy is ever evaluated).
-- =====================================================================

DROP POLICY IF EXISTS gifts_profiles_read ON public.gifts_profiles;
CREATE POLICY gifts_profiles_read ON public.gifts_profiles
  USING (
    user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    OR user_id IN (
         SELECT u.id FROM public.users u
         WHERE u.node_id = nullif(current_setting('app.current_node_id', true), '')::uuid)
  )
  WITH CHECK (
    user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
  );

DROP POLICY IF EXISTS grounders_owner_update ON public.grounders;
CREATE POLICY grounders_owner_update ON public.grounders
  FOR UPDATE
  USING (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid)
  WITH CHECK (user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

DROP POLICY IF EXISTS programme_offerings_owner_write ON public.programme_offerings;
CREATE POLICY programme_offerings_owner_write ON public.programme_offerings
  FOR ALL
  USING (grounder_id IN (
           SELECT g.id FROM public.grounders g
           WHERE g.user_id = nullif(current_setting('app.current_user_id', true), '')::uuid))
  WITH CHECK (grounder_id IN (
           SELECT g.id FROM public.grounders g
           WHERE g.user_id = nullif(current_setting('app.current_user_id', true), '')::uuid));

DROP POLICY IF EXISTS matches_node_isolation ON public.matches;
CREATE POLICY matches_node_isolation ON public.matches
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = ANY (matches.listing_ids)
        AND l.node_id = nullif(current_setting('app.current_node_id', true), '')::uuid)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = ANY (matches.listing_ids)
        AND l.node_id = nullif(current_setting('app.current_node_id', true), '')::uuid)
  );

DROP POLICY IF EXISTS trade_completions_node_isolation ON public.trade_completions;
CREATE POLICY trade_completions_node_isolation ON public.trade_completions
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = trade_completions.match_id
        AND EXISTS (
          SELECT 1 FROM public.listings l
          WHERE l.id = ANY (m.listing_ids)
            AND l.node_id = nullif(current_setting('app.current_node_id', true), '')::uuid))
  );
