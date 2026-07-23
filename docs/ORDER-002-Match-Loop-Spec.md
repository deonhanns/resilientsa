# ORDER 002 — The Match Loop

**Mission:** One real match, on real phones, with data that survives a refresh.
**Depends on:** Data Model v1.0 (implement as written; challenge decisions on the bridge, not in code).
**Explicitly out of scope:** SMS fallback, Marketplace/Programmes, intelligence layer, multi-cell, offline sync. Design nothing for them beyond what the data model already names.

---

## 1. Stack (decided — do not relitigate mid-build)

| layer | choice | why |
|---|---|---|
| DB | SQLite (file) week one → Postgres before pilot | identical schema; zero ops friction while the loop stabilises |
| API | Node + Fastify (or Express), plain REST + JSON | boring, DeepSeek-friendly, no framework magic |
| Auth | Phone + OTP via Africa's Talking SMS; JWT (30-day) after verify | D1. **Dev mode:** `OTP_DEV=1` logs the code instead of sending — build the whole loop before touching the AT account |
| Client | The existing ORDER 001 React screens, wired to the API | no rewrite; replace toasts with state |
| Hosting | Local/dev only for ORDER 002 | SA-soil hosting is a Technical Architecture decision, later |

## 2. API surface (complete — nothing else in this order)

All routes JSON. All except auth require `Authorization: Bearer <jwt>`. All reads are scoped to the caller's cell — there is no cross-cell access, enforced server-side, not by the client.

### Auth
- `POST /auth/request-otp` `{ phone }` → sends/logs 6-digit code, 5-min expiry, max 3 sends per phone per hour
- `POST /auth/verify` `{ phone, code }` → `{ token, member }` · 401 on bad code · 404 if phone not onboarded (pilot is invite-only: members are created by the Steward or seed script, not self-signup)

### Listings
- `GET /listings?kind=&pillar=&status=open` → cell feed, newest first (serves TradeExchange)
- `POST /listings` `{ kind, pillar, title, description? }` → creates as `open`, touches `last_active_at`, writes `listing_posted` event
- `PATCH /listings/:id` `{ status: "withdrawn" }` → owner or steward only

### Matches
- `POST /matches` `{ listing_id }` → responder = caller · status `proposed` · 409 if listing already has a live match (invariant) or caller owns the listing · writes `match_proposed` event
- `POST /matches/:id/accept` → listing owner only · listing → `matched` · event
- `POST /matches/:id/decline` → listing owner only · listing back to `open`
- `POST /matches/:id/confirm` → giver or receiver sets their `*_confirmed_at`; when both present: match `completed`, listing `fulfilled`, `match_completed` event. Giver = offer-listing owner or need-responder; derive, don't ask.

### Steward (role-gated)
- `GET /steward/members` → members + derived status (isolate → quiet → active), humanised `last_active_at`
- `GET /steward/radar` → open needs count by pillar
- `GET /steward/summary` → completed matches last 30d vs prior 30d
- `POST /steward/matches` `{ listing_id, responder_id }` → steward-facilitated proposal (`facilitated_by` = steward); this is the "Match a member" button doing real work
- `POST /steward/reachout` `{ member_id }` → writes `steward_reachout` event and touches nothing else — a log that care happened, not a message system

### Events
- `GET /events?limit=20` → cell activity feed (steward dashboard ticker)

## 3. Client wiring (ORDER 001 screens → real state)

1. Kill every `notify()` that fakes an outcome. Toasts may *report* real outcomes only.
2. `"You asked Nomsa about…"` → `listing.member.name`. No name may ever be a string literal.
3. TradeExchange: feed from `GET /listings`; "Ask about this" → `POST /matches`; my-listing responses show Accept/Decline; accepted matches show Confirm.
4. StewardDashboard: radar, member list, summary, and events from the steward endpoints; "Match a member" opens a two-pick (listing + member) → `POST /steward/matches`.
5. Add the one missing screen: **My Exchanges** — the caller's listings and matches with their current state. Without it, acceptance and confirmation have no home. Reuse existing card components; no new design work.

## 4. Build sequence (each step ends runnable)

1. Schema + seed script: 1 cell, 1 steward, 6 members with real-sounding Delft names, 8 listings across pillars
2. Auth (dev OTP) + JWT middleware + cell scoping
3. Listings endpoints → wire TradeExchange feed + posting
4. Match lifecycle endpoints + invariant → wire propose/accept/decline/confirm + My Exchanges
5. Steward endpoints → wire dashboard
6. Events feed → dashboard ticker
7. Switch `OTP_DEV=0`, real AT sandbox, run the acceptance test below on two physical phones

## 5. Acceptance test (definition of done, verbatim)

> Phone A (Thandi) posts an offer: Food / "Spinach seedlings, about 20".
> Phone B (Nomsa) sees it in the feed and taps Ask about this.
> Phone A sees the proposal *from Nomsa by name*, accepts.
> Both phones confirm after the (real or simulated) handover.
> Steward dashboard shows the completed match in the summary and event feed.
> Kill the server, restart it, refresh both phones: everything is still true.

If any sentence fails, ORDER 002 is not done.

## 6. Guardrails for the crew

- No new tables, no new entities, no "while we're here" features. Extension points stay unbuilt.
- Server enforces every rule (ownership, roles, cell scope, match invariant); the client is untrusted.
- Phone numbers never appear in any API response except the caller's own profile. Members find each other by name and gifts, not numbers — contact exchange happens in the physical world or via the Steward. This is both POPIA posture and safety posture.
- Log nothing that contains a phone number or OTP in plaintext.
