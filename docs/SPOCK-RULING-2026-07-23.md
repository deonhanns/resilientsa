# SPOCK RULING — 2026-07-23

## 1. Retraction: docs/Data-Model-v1.0.md and docs/ORDER-002-Match-Loop-Spec.md

Both documents (commit `e98c907`) are **retracted and deleted**. They were issued from stale bridge intelligence — the bridge context contained only the ORDER 001 prototype and none of the ship's actual build state. The ship had already implemented a superior version of everything they specify:

- Data model → superseded by **CREW-ORDER-003** (`resilientsa-app/src/db/schema/`), which includes phone encryption (bytea + hash), node/cell hierarchy, and the `coop_pii` schema — none of which the retracted document specified
- Match loop → superseded by **CREW-ORDERS 004–006**, live on Vercel preview
- The "ORDER 002" numbering collides with the real CREW-ORDER-002 (scaffold)

Authoritative sources remain `resilientsa-app/src/db/schema/` and `docs/technical-architecture-v1.0.md`.

One idea worth salvaging: **completed trades as edges of the future Contribution Web.** The `trade_completions` table already accrues this graph — no action needed now, but it should be named as the Contribution Web's data source when that layer is designed.

## 2. ORDER 008 schema change — APPROVED (Critical Rule #3)

O'Brien's proposed change is approved as specified, with conditions:

- **Add `user_id uuid` to `grounders`**, referencing `users.id` — **nullable and unique**. Nullable because existing grounder rows predate the link; unique because one login represents one organisation for the pilot.
- **Add `'grounder'` to the `users.role` enum.** Since role is a text-mode enum in Drizzle (TypeScript-level, not a PG enum type), this is code + any check constraint — the migration must be purely additive, no rewrite of existing rows.
- **Named extension point, do not build:** if a Grounder organisation ever needs multiple staff logins, the fix is a `grounder_members` join table — not additional columns on `grounders`. Record this so nobody bolts on `user_id_2`.
- One caveat to verify in code: `role` is single-valued. A user cannot be both `cell_steward` and `grounder`. Acceptable for the pilot; if it bites, the answer is a roles join table, decided on the bridge first.

With this approved, `getGrounderForUser()` can be implemented and the grounder-facing routes unblocked.

## 3. Bones reviews outstanding

Two Bones Protocol reviews are now queued and block completion status:
1. **ORDER 007** — StewardDashboard UI (blocking 007 completion)
2. **ORDER 008** — Marketplace UI (blocking 008 completion)

Spock will run both in the next bridge session against `docs/bones-protocol-v1.0.md`. Until verdicts land, 007 stays at ~85% and 008 stays at "shipped, pending review" — per protocol, neither is COMPLETE.

## 4. Bridge process correction (permanent)

Root cause of the retracted documents: the bridge issued orders without first reading the ship. New standing rule for Spock: **no order, spec, or ruling leaves the bridge without first reading MISSION_STATUS.md, the relevant CREW_ORDERS, and OBRIEN_STANDUP.md from the current main.** The Captain should hold the bridge to this.
