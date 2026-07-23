# ResilientSA — Data Model v1.0 (Pilot Scope)

**Status:** Bridge output for ORDER 002 · **Scope:** One pilot cell (Delft) · **Audience:** O'Brien / engineering crew
**Rule of this document:** Everything here exists to make one real match happen and survive a refresh. Anything not needed for that is an *extension point*, named but not built.

---

## 1. Design decisions (read first)

These are the decisions the schema encodes. Challenge them before building, not after.

**D1 — Phone number is identity.** Members authenticate with phone + OTP (Africa's Talking). No email, no passwords, no usernames. `phone` is unique, stored E.164 (`+27...`). This is also the POPIA data-minimisation posture: we hold a name, a phone, a cell, and what someone offers/needs. Nothing else.

**D2 — A match joins a listing to a person, not a listing to a listing.** In the real world, Nomsa responds to Thandi's seedlings offer without ever having posted a formal "need seedlings" listing. Requiring symmetric listings would kill most matches. So `Match = listing + responder`. If a counterpart listing *does* exist, it can be linked optionally and both close together.

**D3 — Member status is derived, never stored.** `active / quiet / isolate` is computed from `last_active_at` at read time (defaults: quiet > 14 days, isolate > 30 days — make these cell-level config). Storing it creates stale-flag bugs and, worse, a stored label on a person. The isolate flag is a nudge, not a record.

**D4 — Two-sided confirmation closes a match.** A match is only `completed` when both the giver and receiver confirm. This is the smallest possible trust mechanism, and it is the seed of the future Contribution Web — every completed match is an edge in that graph. We get the data for free by doing the pilot right.

**D5 — Soft delete everywhere, hard delete on request.** Listings are `withdrawn`, not deleted, so the Steward's picture stays honest. But a member exercising POPIA erasure gets a true hard delete of their row and anonymisation of their match history (`member_id → NULL`, name removed from denormalised fields).

**D6 — Pillar is a closed enum.** `water | food | health | safety | energy | skills`. Mirrors `pillarMeta.js` in the design system exactly. The DB and the UI must never disagree about what a pillar is.

---

## 2. Entities

### Cell
The unit of community. The pilot has exactly one.

| field | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text | e.g. "Eindhoven — Rhine Road block" |
| area | text | human-readable locality, not GPS |
| quiet_after_days | int, default 14 | status thresholds, per D3 |
| isolate_after_days | int, default 30 | |
| created_at | timestamptz | |

*Extension point:* `parent_cell_id` for cell federation. Do not build.

### Member

| field | type | notes |
|---|---|---|
| id | uuid pk | |
| cell_id | fk → Cell | pilot: everyone in one cell |
| phone | text, unique | E.164; the auth identity (D1) |
| name | text | first name or chosen name — what neighbours call them |
| role | enum: `member` \| `steward` | steward is a role, not a table |
| preferred_language | text, default 'en' | ISO 639-1; UI copy hook for later |
| gifts | text[] | free-text tags for now ("plumbing", "childcare") |
| consent_at | timestamptz | POPIA: explicit consent recorded at onboarding |
| last_active_at | timestamptz | touched on any write action by this member |
| created_at | timestamptz | |

**Derived — status:** `active` if last_active_at ≤ quiet_after_days; `quiet` if ≤ isolate_after_days; else `isolate`. Computed in a view/query, never written (D3).

### Listing
An offer or a need. The atom of the Trade Exchange.

| field | type | notes |
|---|---|---|
| id | uuid pk | |
| cell_id | fk → Cell | denormalised for cheap cell-scoped queries |
| member_id | fk → Member | the owner — this is where "Nomsa" comes from, never a hardcoded string |
| kind | enum: `offer` \| `need` | |
| pillar | enum (D6) | |
| title | text, ≤ 80 chars | "Spinach seedlings, about 20" |
| description | text, nullable | |
| status | enum: `open` \| `matched` \| `fulfilled` \| `withdrawn` | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Status flow: `open → matched` (an accepted match exists) `→ fulfilled` (match completed) · `open|matched → withdrawn` (owner or steward, D5).

### Match
The value exchange. The reason the platform exists.

| field | type | notes |
|---|---|---|
| id | uuid pk | |
| listing_id | fk → Listing | the anchor listing |
| responder_id | fk → Member | the person answering it (D2) |
| counterpart_listing_id | fk → Listing, nullable | optional symmetric listing; closes with the match |
| facilitated_by | fk → Member, nullable | NULL = self-service; set = a Steward made it happen |
| status | enum: `proposed` \| `accepted` \| `declined` \| `completed` \| `lapsed` | |
| giver_confirmed_at | timestamptz, nullable | D4 |
| receiver_confirmed_at | timestamptz, nullable | D4 |
| created_at | timestamptz | |

Status flow: `proposed` (responder or steward initiates) → `accepted` (listing owner says yes) → `completed` (both confirmations present, D4). `declined` by owner; `lapsed` if no acceptance in 14 days (background job or lazy evaluation).
**Invariant:** at most one non-declined, non-lapsed match per listing at a time.

### Event
Append-only activity log. Powers the Steward dashboard, in-app notifications, and later the intelligence layer — without any new tables.

| field | type | notes |
|---|---|---|
| id | uuid pk | |
| cell_id | fk → Cell | |
| actor_id | fk → Member, nullable | NULL after POPIA erasure |
| type | enum: `listing_posted` \| `match_proposed` \| `match_accepted` \| `match_completed` \| `member_joined` \| `steward_reachout` | |
| subject_id | uuid | the listing/match/member concerned |
| created_at | timestamptz | |

*Extension points (named, not built):* `Programme` (Marketplace/Grounders), `Dispute` (Fairness Tribunal), `ContributionEdge` (materialised view over completed Matches — the data already accrues via D4).

---

## 3. Derived views the UI needs

- **NeedsRadar:** `SELECT pillar, count(*) FROM listing WHERE cell_id=? AND kind='need' AND status='open' GROUP BY pillar`
- **Member list (Steward):** members + computed status, ordered isolate → quiet → active, with `last_active_at` humanised ("3 weeks quiet").
- **Cell health line (NetworkSummary):** completed matches in last 30 days vs prior 30 — one number, one trend word.
- **Exchange feed:** open listings in cell, newest first, filterable by pillar and kind — exactly what `TradeExchange.jsx` already renders.

Every screen in ORDER 001 maps to these four queries. No screen needs data this model can't serve.

## 4. POPIA posture (pilot-sufficient)

1. Consent captured at onboarding (`consent_at`), plain-language, in the member's preferred language.
2. Data held: name, phone, cell, gifts, listings, matches. Nothing else. No GPS, no ID numbers, no demographics.
3. Erasure on request: hard-delete Member, NULL `actor_id`/`member_id` references, strip name from anything denormalised.
4. Hosting on SA soil (data sovereignty) — provider decision belongs to the Technical Architecture Doc, not here.

## 5. What O'Brien builds from this

- Postgres schema (or SQLite for week one — the model is identical), the five tables above, the four views.
- A thin API: auth (OTP), CRUD listings, propose/accept/confirm match, cell feed, steward views.
- Wire ORDER 001's three screens to it. Every `notify()` toast becomes a real state change. `"Nomsa"` becomes `listing.member.name`.

**Definition of done for ORDER 002:** two real phones, two real people, one match proposed, accepted, and dual-confirmed — visible on the Steward dashboard, still there after a refresh.
