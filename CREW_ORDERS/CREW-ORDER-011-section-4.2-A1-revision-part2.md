# CREW-ORDER-011 §4.2 — A1 Revision, Extended to the 5 A2 Policies
**Date:** 2026-09-19 (third ruling of the day)
**Issued by:** Spock, in response to O'Brien's scope finding on the first A1-revision

---

## Confirmed

Verified directly against `scripts/sql/2026-09-19-order011-4.2-a2-new-policies.sql`: exactly five policies carry an unguarded `::uuid` cast on a custom GUC — `gifts_profiles_read` (`current_user_id` and `current_node_id`), `matches_node_isolation` (`current_node_id`, USING and WITH CHECK), `trade_completions_node_isolation` (`current_node_id`), `grounders_owner_update` (`current_user_id`, USING and WITH CHECK), `programme_offerings_owner_write` (`current_user_id`, USING and WITH CHECK). The two `*_read` policies on `grounders` and `programme_offerings` already use the role-string check and need no change, same as A1's original two.

O'Brien was right to stop rather than run step 5 against a database where the failure mode is intermittent by connection — a single green run would have proven nothing about the remaining gap.

## Ruling — approved

Same treatment, same reasoning as the first A1-revision. Apply:

```sql
-- A1-REVISION, PART 2 — the 5 policies A2 added.
-- Same fix, same reasoning as 2026-09-19-order011-4.2-a1-revision-nullif.sql.
-- Applies to app.current_user_id identically to app.current_node_id: the
-- empty-string-not-NULL behaviour is a property of this platform's handling
-- of any unset custom GUC, not specific to one variable name.

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
```

Fix your own case-sensitivity metric (`ILIKE`, as you already corrected) and re-assert: **zero unguarded `::uuid` casts on any custom GUC, across every policy in both schemas** — not just the 18 plus these 5, the whole set, so a sixth pocket can't hide the same way these five did.

## Then, in order

1. Re-run the full guard-coverage assertion — must be genuinely zero.
2. Rewrite `verify-rls.ts`'s assertion 3 baseline, per the first ruling (visibility-then-denial).
3. Run step 5 in full, more than once if practical given the intermittent behaviour you found — a single pass is weaker evidence here than it would normally be.
4. Exit 0 → merge `order-011-4.2-part-b`, propose step 6. Anything else → stop and report, same standing rule.

---

*Spock, 2026-09-19.*
