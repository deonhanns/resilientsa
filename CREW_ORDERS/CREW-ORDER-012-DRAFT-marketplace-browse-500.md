# CREW-ORDER-012 — DRAFT: Community Marketplace browse returns 500 in production

**Status: ⚠ DRAFT — NOT IN FORCE. Filed by O'Brien; Crew Orders are Spock's artefact.**
**Filed:** 2026-09-19, at Captain's direction, per §4 of [`CREW-ORDER-011-section-4.2-gate-fixes-ruling.md`](CREW_ORDERS/CREW-ORDER-011-section-4.2-gate-fixes-ruling.md:31)
**Discovered during:** CREW-ORDER-011 §4.2 step 5, because the gate finally probed the whole client route set instead of a hand-picked subset.
**Severity:** High — user-facing feature completely broken; **not blocking** ORDER 011, and provably unrelated to it.

---

## 1. The defect

`GET /api/marketplace/offerings` returns **500 on Production**, with or without query parameters. The Community Marketplace browse screen therefore cannot load data for any user.

Measured live 2026-09-19, same session token, same moment:

| Environment | `/offerings` | `?pillar=water` | `?search=a` |
|---|---|---|---|
| **PRODUCTION** — privileged owner connection, no Part B deployed | **500** | **500** | **500** |
| Preview — app role, Part B deployed | **500** | **500** | **500** |

## 2. Why it is provably not ORDER 011

Identical failure under the **owner** role and the **app** role. Postgres error `42601` — a **syntax** error, raised during *parsing*, before any row-security policy is evaluated. A role carrying `BYPASSRLS` never evaluates a policy, so RLS cannot be the cause; neither can the split-connection-identity work, which only ever changes *which* role connects. The bug predates this order.

## 3. Root cause — confirmed, one call site

[`resilientsa-app/api/marketplace/[...path].ts:100`](resilientsa-app/api/marketplace/[...path].ts:100):

```ts
const engagementEndorsements = await tx
  .select({ offeringId: sql<string>`oe.offering_id`, recommend: offeringEndorsements.recommend })
  .from(offeringEndorsements)
  .innerJoin(
    sql`offering_engagements oe ON ${offeringEndorsements.engagementId} = oe.id`,
    sql``                            // ← EMPTY join condition
  )
  .where(sql`oe.offering_id = ANY(${offeringIds})`)
```

The join predicate was written into the **table** argument, and an **empty `sql` template** was passed as the join condition. Drizzle emits `ON` followed by nothing, producing the malformed statement seen in the runtime log:

```
... inner join offering_engagements oe ON "offering_endorsements"."engagement_id" = oe.id on  where oe.offering_id = ANY(($1, $2, ...))
                                                                                    ^^^^^ stray "on", empty condition
```

**Why this hid for so long:** the query sits inside `if (offeringIds.length > 0)`. With no browsable offerings the branch is skipped and the endpoint returns an empty list **successfully** — so a build with no `programme_offerings` rows looks perfect. It fails from the first offering onward. That is exactly the shape of gap this project has repeatedly been bitten by: the code path is only correct in the state where it cannot be exercised.

## 4. Fix (for Spock to assign; two acceptable shapes)

1. **Proper Drizzle join** (preferred — keeps the query typed and reviewable):
   ```ts
   .innerJoin(offeringEngagements, eq(offeringEndorsements.engagementId, offeringEngagements.id))
   ```
2. **Raw SQL with a real condition**, if the aliasing is needed:
   ```ts
   .innerJoin(
     sql`offering_engagements oe`,
     sql`${offeringEndorsements.engagementId} = oe.id`,
   )
   ```

Either way, **a regression test must exercise the >0-offering case**, because the current tests cannot: see §5. Also verify whether `programme_offerings` should count only *active* offerings and only *verified* grounders (ORDER 008 §6.1 mandates the latter) — the endpoint's business rules may need the same look.

## 5. Verification requirements for whoever fixes it

- Reproduce first: a real `GET /api/marketplace/offerings` against a deployment **with at least one offering present**, authenticated. A green build proves nothing here.
- Confirm the fix on **Production**, not only Preview — the defect is environment-independent, and this is a live user-facing path.
- **Bones:** per §4 of the ruling, `BONES_VERDICT.md`'s ORDER 008 `CONDITIONAL PASS` needs an explicit note that this screen **could not have been judged against a working data path**, because the path has apparently never worked. A note to that effect has been added to `BONES_VERDICT.md` by O'Brien (annotated, attributed, not altering the original verdict).

## 6. Relationship to the ORDER 011 §4.2 gate

While this defect is open, `scripts/verify-rls-live.ts` lists it in `KNOWN_DEFECTS` so it cannot block the §4.2 gate — with an explicit issue reference (this file) and a stated reason. Two properties to preserve:

- **FAIL is for *unexpected* 5xx only.** A known, separately-tracked 5xx reports as `KNOWN` and is printed prominently, never silently swallowed.
- **The exemption is deliberately self-retiring.** If the route stops returning 5xx while probed authenticated, the gate reports a **STALE EXEMPTION** and instructs its removal — so closing this order *requires* removing the entry, and the entry can never outlive the bug and mask a future regression.

**Action when this order closes:** delete the `/api/marketplace/offerings` entry from `KNOWN_DEFECTS` in [`resilientsa-app/scripts/verify-rls-live.ts`](resilientsa-app/scripts/verify-rls-live.ts:80).

---

*DRAFT by O'Brien, 2026-09-19. Not in force pending Spock's issue.*
