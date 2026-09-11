# CREW ORDER — 009
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-009
**Issued by:** O'Brien — drafted at Captain direction, 2026-09-11
**Status:** 🟡 **DRAFT — AWAITING SPOCK / CAPTAIN APPROVAL**
**Assigned to:** O'Brien (primary builder)
**Date drafted:** 2026-09-11
**Depends on:** CREW-ORDER-004 (auth / SMS OTP) ✅ COMPLETE · CREW-ORDER-009a (Node & Cell Formation) ✅ BUILT · **AT sender-ID registration ⚠️ CAPTAIN ACTION — NOT STARTED**
**Blocks:** CREW-ORDER-010 (Crisis Mode + Resource Map)

> **Why this is a draft and not an issued order.** Crew Orders are Spock's artefact and `AGENTS.md` Critical Rule #3 reserves schema changes to Spock's approval. The Captain asked O'Brien to draft this because O'Brien is the one who has just read the schema, the admin surface and the RLS situation in detail. **It is a proposal for Spock to review, amend and issue — not an order in force.** Nothing in it should be built until approved and, where marked, until the CRIT-001 dependency below is resolved.

---

## 1. STRATEGIC CONTEXT

ORDER 009a closed the structural gap: the platform now has a real product path to create a Node, create a Cell, assign members and grant `cell_steward`. What it does not have is a way to bring **actual community members** in. Every signup today is still hardcoded into one placeholder node (`00000000-...-0001`) at verification in `api/auth/[...path].ts`, because there is no other path — and no way to say "this person belongs to *this* cell".

That is the missing link. A Cell Steward who has just been promoted can create a cell, but cannot invite their own neighbours into it. Until they can, the cell is a container with nothing in it, and the Node/Cell/Steward hierarchy built in 009a is structural only.

The product promise this order has to land is plain: **a Cell Steward can bring their actual neighbours into their actual cell, by phone, in a way that feels like a neighbour knocking rather than a platform recruiting.** ResilientSA's users are explicitly skeptical of "development theatre", so the invite must look like something a person they know sent — because it is.

**Dependency that gates real use:** `AT_API_KEY`/`AT_USERNAME` are still not in Vercel, so all SMS today runs on the `OTP_DEBUG_LOG` fallback (Pattern 003). Sender-ID registration through SA mobile networks has a days-to-weeks lead time and is a **Captain action that has not been started**. This order can be built and internally piloted on the fallback, but **no invite may be sent to a real person until a real sender ID is registered and `OTP_DEBUG_LOG` is unset** — see §6.7.

---

## 2. MISSION OBJECTIVE

Let a `cell_steward` or `node_admin` invite a specific phone number into a specific cell, by SMS. The recipient taps a link, lands on a warm screen that names the cell and who invited them, enters their phone number, verifies it with the existing OTP flow, and is created in the correct Node and Cell with role `member`. The invite is single-use, expires, and is tied to that one phone number.

**Deliberately out of scope:** WhatsApp invites (ORDER 009 is SMS; WhatsApp needs separate sender approval — see §9). Bulk/CSV import. Self-service node creation. Any change to the OTP flow itself.

---

## 3. BONES BRIEF

**Two human-facing artifacts here, both of which are new and neither of which has a prototype.** Bones must rule before build, per `AGENTS.md` ("Do not build UI without a Bones verdict in `BONES_VERDICT.md`").

**Artifact 1 — the SMS message itself.** This is the first thing a community member ever sees from this platform, and it arrives uninvited on their phone. That is precisely the "development theatre" risk. Proposed copy for Bones to rule on:

> *"[Steward's name] from [Cell name] has asked us to invite you to join your neighbours on ResilientSA. It's how your street shares what it has and needs. Tap to join: [link]"*

Guardrails to hold:
- No "sign up", "register", "create account", "profile" — the existing anti-pattern list from ORDER 004/005 applies unchanged.
- Must name **the steward and the cell**, not the platform, in the first clause. The trust anchor is a neighbour, not a product.
- Must not disclose *why* the invitee was chosen, or reference any need, gift, or crisis state. If a steward invited someone because they're known to have a skill, the message must not hint at it — that is a person's information, disclosed without consent, on an SMS.
- Must fit in 2 SMS segments. No link shorteners (they read as spam and break trust).

**Artifact 2 — the invite landing screen** (`/invite/:token`). Emotional target: *"A neighbour asked me to join. This is for my street."* Names the cell, names the steward, one field, no terms, no countdown. Reuses the ORDER 004 auth screens' visual and tonal conventions.

**Mission-specific weight:** Bones' first-encounter test carries extra weight here — this screen is the *literal* first encounter, arriving unsolicited on a personal device. If it reads as a marketing campaign rather than a neighbour's invitation, it fails regardless of how well it works.

---

## 4. WORF BRIEF

**This order is the first to place a real person's phone number into the system before they are a user**, and the first to send unsolicited outbound communication. Two distinct risk classes:

**4.1 PII — mandatory, no exceptions**
- `invites.phone_number` **must be `bytea`** (pgcrypto-encrypted via `encryptPhone`), never TEXT/VARCHAR. `invites.phone_hash` (via `hashPhone`) is the only lookup column.
- The raw invite token is never stored — only its SHA-256 hash. It is shown exactly once, in the SMS, and is unrecoverable thereafter by design.
- No route may return `phone_number` in any form. `GET /api/invites` returns `phoneHash` only, and deliberately **cannot** return the token (it isn't stored).
- No `console.log` of phone numbers, tokens, or invite URLs. Note Pattern 003's warning: an OTP or invite URL in runtime logs is a live credential — short-lived, but live.
- The invite must be usable by **exactly the phone number it was sent to**. Accepting validates the submitted phone against `invites.phone_hash`, so a forwarded link cannot be claimed by a third party.

**4.2 Authorisation — the escalation risk**
- Accepting an invite must **always** result in `role = 'member'`. The role is read from the invite row, hardcoded, never from the request body. An invite must never be able to confer `cell_steward`, `node_admin`, `regional_steward` or `grounder`. This is the single most important line in this order — a role that can be escalated by crafting a request is the 009a class of bug all over again.
- `POST /api/invites` scope: `nodeId` from session, never body. `cellId` from body but validated to belong to the caller's node, and — if the caller is a `cell_steward` rather than a `node_admin` — validated to be *their own* cell. A steward must not be able to invite into another steward's cell.
- Token comparison must be constant-time.

**4.3 Abuse and cost**
- AT sends cost money per message and are an obvious abuse vector. Rate-limit: per-inviter and per-node caps per 24h, and reject a duplicate pending invite for the same `phoneHash` + `cellId`. Exact numbers are Spock's call; the caps must exist.
- Expiry: default 14 days. Revocable by the inviter or a `node_admin`.

**4.4 POPIA — flagged, needs a ruling before real invites**
Sending an SMS invitation to a person who has not agreed to be contacted is **direct-marketing-adjacent** under POPIA and is not obviously lawful merely because a neighbour initiated it. This is not a technical question and it is not O'Brien's to resolve. Recorded here as a gate: **Uhura + Worf ruling required before any real (non-test) invite is sent.** Possible right-of-way: the steward obtaining verbal consent from their neighbour first and the message being framed as a personal contact — but that is a legal position, not an engineering one.

**4.5 Inherited, non-negotiable: CRIT-001**
Per `WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md`, **RLS is enabled but not enforced** — `withRLSContext` applies its context to a transaction handle its callers don't use, and no table has `FORCE ROW LEVEL SECURITY` while the app connects as the table owner. **ORDER 009 must not rely on RLS for the isolation of invite data.** Every query must filter on `nodeId` explicitly in the handler, as the existing routes do. This order is the point at which real PII starts entering the system, so if CRIT-001 is not fixed first, the Captain must record explicit acceptance of the compensating control before this ships to real people.

---

## 5. DESIGN SYSTEM REFERENCE

Reuse, don't invent:
- [`PhoneInput.tsx`](resilientsa-app/src/components/auth/PhoneInput.tsx) and the OTP screen (ORDER 004) — the invite landing ends in exactly that flow.
- `RoleGateMessage` (ORDER 007) for non-authorised visitors.
- Living Soil tokens: `--surface-card`, `--border-hairline`, `--action-primary`, `--text-primary`/`--text-secondary`/`--text-muted`.
- The "operational vs community" split established in 009a: invite creation lives in the steward/node-admin screens (operational tone); the landing screen is community-facing and must feel like the latter.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 Schema — one additive migration

New table `invites` (public schema — invitees are not founding members, so `coop_pii` is the wrong home):

```sql
CREATE TABLE invites (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id            uuid NOT NULL REFERENCES nodes(id),
  cell_id            uuid NOT NULL REFERENCES cells(id),
  invited_by_user_id uuid NOT NULL REFERENCES users(id),
  phone_number       bytea NOT NULL,            -- encryptPhone(); never TEXT
  phone_hash         text  NOT NULL,            -- hashPhone(); the lookup column
  token_hash         text  NOT NULL UNIQUE,     -- SHA-256 of the raw token; raw never stored
  role               text  NOT NULL DEFAULT 'member',
  expires_at         timestamptz NOT NULL,
  accepted_at        timestamptz,
  accepted_user_id   uuid REFERENCES users(id),
  revoked_at         timestamptz,
  sms_sent_at        timestamptz,
  sms_status         text,                      -- 'sent' | 'debug_fallback' | 'failed'
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX invites_phone_hash_idx  ON invites (phone_hash);
CREATE INDEX invites_cell_pending_idx ON invites (cell_id) WHERE accepted_at IS NULL;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;   -- see 6.1.1
```

**6.1.1 Two honest caveats on this schema section.**

**(a) The `ENABLE ROW LEVEL SECURITY` line above is currently cosmetic.** Per CRIT-001, RLS is not enforced on this deployment. It is included because the project convention requires it and because it will matter once CRIT-001 is fixed — but **the handler-level filters are the actual control**, and any policy added here must not be treated as a backstop until CRIT-001 is resolved and verified.

**(b) `notification_log` cannot hold invite sends as currently defined** — two blockers found during review:
- Its `message_type` enum is `['trade_match','fairness_prompt','steward_alert','crisis_activation']`. There is no invite value.
- Its `user_id` is `NOT NULL` and FK'd to `users` — but an invite is sent to someone who has no `users` row yet. The send is unloggable there by definition.

**Recommendation:** keep invite send-status on the `invites` row for now (`sms_sent_at`, `sms_status` above) and **do not** extend `notification_log` in this order. Extending the enum and making `user_id` nullable is a separate, Spock-approved decision — flag it rather than bundling it. `notification_log`'s job is notifications to existing users; invites are pre-user by nature.

### 6.2 API — one new consolidated catch-all

`api/invites/[...path].ts`, following the established consolidation pattern (function count 8 → 9; Vercel Hobby limit is 12). **Remember Pattern 006:** the `segments()` helper must read `req.query.path ?? req.query['...path']`. Copy the helper verbatim from a current catch-all; do not hand-roll it.

```
POST  /api/invites                    — create + send invite   (cell_steward | node_admin)
GET   /api/invites                    — list pending invites   (scoped to caller)
POST  /api/invites/:token/accept      — public entry point
POST  /api/invites/:id/revoke         — inviter or node_admin
```

**`POST /api/invites`**
- Auth: `cell_steward` or `node_admin`. `nodeId` **from session**, never body.
- Body: `{ phone: string, cellId: string }`. Both validated.
- `cellId` must belong to `session.nodeId`. If caller is `cell_steward`, `cellId` must be their own cell (`cells.steward_user_id = session.userId`) — a steward cannot invite into another steward's cell.
- Reject if a pending, unexpired invite already exists for `phone_hash` + `cell_id`.
- Enforce rate caps (§4.3).
- Generate token → store hash → send SMS → return `{ inviteId }` (201). The raw token is **returned to nobody**; it exists only inside the SMS.

**`GET /api/invites`**
- Auth: `cell_steward` or `node_admin`. Scoped: admin sees the node, steward sees their own cells.
- Returns `id`, `cellId`, `role`, `expiresAt`, `acceptedAt`, `smsStatus`, `phoneHash` — **never** `phoneNumber`, and **never** the token (impossible; it is not stored).
- Note for implementation: showing a steward "who have I invited" without being able to show the number is a real UX constraint. `phoneHash` is not human-readable. **Decide deliberately** whether to store a masked display form (e.g. last 4 digits) — if yes, it must be a separate non-reversible field, never derived on read. Flag to Spock; do not improvise it.

**`POST /api/invites/:token/accept`**
- Public (no session — the invitee has no account). Body: `{ phone: string }`.
- Hash the token, look up by `token_hash`, constant-time compare.
- Reject: not found, `expires_at < now()`, `accepted_at IS NOT NULL`, `revoked_at IS NOT NULL`. Return one generic error for all of these — **no oracle** distinguishing expired from invalid from already-used, since that leaks whether a number was invited.
- Normalise the submitted phone (`normalisePhone`) and require `hashPhone(phone) === invite.phone_hash`. This is what makes a forwarded link useless to a third party.
- Do **not** create the user here. Hand off to the existing OTP flow so there is exactly one account-creation path in the system.
- On successful OTP verification, atomically: set `users.nodeId = invite.node_id`, `users.cellId = invite.cell_id`, `users.role = 'member'`, `users.invited_by = invite.invited_by_user_id`; mark invite `accepted_at` + `accepted_user_id`. Wrap in a transaction — the current codebase has exactly one transactional helper and it is broken (CRIT-001), so this needs whatever Spock settles on for transactions.
- **`role` comes from the invite row. It is never read from the body.**

**`POST /api/invites/:id/revoke`**
- Auth: the original inviter, or any `node_admin` in the same node. Sets `revoked_at`.

### 6.3 SMS dispatch

- Use the **lazy** `getClient()` in [`api/_lib/at.ts`](resilientsa-app/api/_lib/at.ts:14) — never construct the AT client at module scope (Pattern 005: eager construction throws at import and kills the whole function before any `try/catch` runs).
- Message copy is the Bones-gated artifact from §3. Template with steward name, cell name, link.
- Language: respect `users.preferred_language` where known; for a pre-user invite, default `en`. Afrikaans copy must exist for pilot usefulness — as **English fallback** unless professionally reviewed, consistent with every prior order.
- **On AT failure or missing credentials:** log the invite URL to runtime logs behind the same explicit opt-in flag convention as Pattern 003, so the flow is testable pre-sender-ID. **Do not reuse `OTP_DEBUG_LOG` for this** — it is a different secret with a different lifecycle. Introduce `INVITE_DEBUG_LOG`. And carry Pattern 003's warning forward verbatim: this flag **must be unset before real members are invited**.

### 6.4 Frontend

- `InviteMember.tsx` (or a section within the existing steward/node-admin screens) — invite by phone number, cell picker, list of pending invites with a revoke action.
- New route `/invite/:token` → `InviteLanding.tsx` — public, outside `ProtectedRoute`, ends in the existing OTP flow. Must not be wrapped in `AppShell`'s nav (the invitee has no app yet).
- `inviteApi` client methods; `Invite` type; `invite.*` i18n keys in `en.json` / `af.json`.
- **No UI may be built before the Bones verdict exists for the SMS copy and the landing screen.**

### 6.5 Token generation

32 bytes from a CSPRNG, base64url-encoded. Store **only** `SHA-256(token)`. Compare with a constant-time equality check. Expiry default 14 days. Single-use enforced by the `accepted_at IS NULL` condition, ideally as a conditional update so two concurrent accepts cannot both win.

### 6.6 Rate limits

Per-inviter and per-node 24-hour caps; duplicate-pending suppression on `phone_hash` + `cell_id`. Exact numbers to Spock. Purpose is twofold: AT cost control and abuse mitigation. Implemented as a count query over `invites` — no new dependency, no in-memory state (serverless).

### 6.7 The sender-ID gate — read this before testing with a real person

Order of operations matters:

1. **Build and pilot on `INVITE_DEBUG_LOG`** — invites to the Captain's own test numbers only.
2. **Captain registers the AT sender ID** (long lead time — start now, in parallel, not after the build).
3. **Add `AT_API_KEY`/`AT_USERNAME` to Vercel**, confirm a real SMS arrives.
4. **Unset `INVITE_DEBUG_LOG` and `OTP_DEBUG_LOG`** — leaving them on means invite URLs and OTPs in runtime logs, which are live credentials.
5. **Only then** invite a real Delft member, and only once §4.4's POPIA ruling is recorded.

---

## 7. CROSS-SPEC DEPENDENCIES

| Document | Section | Relevance |
|---|---|---|
| `CREW-ORDER-004` | — | The OTP flow the invite hands off to; `PhoneInput`/`OtpInput` reused |
| `CREW-ORDERS/CREW-ORDER-009a.md` | §4 | Role hierarchy this order invites *into*; the 409/allowlist discipline to mirror |
| [`api/auth/[...path].ts`](resilientsa-app/api/auth/[...path].ts) | `verifyCodeRoute` | Currently hardcodes `nodeId: '00000000-...-0001'` on signup — this order must bypass that for invited users only, without breaking plain signup |
| [`src/db/schema/public/users.ts`](resilientsa-app/src/db/schema/public/users.ts:28) | — | `invited_by` column already exists and is currently unused — this order activates it |
| [`src/db/schema/public/notification-log.ts`](resilientsa-app/src/db/schema/public/notification-log.ts:10) | `message_type` | Enum has no invite value; `user_id` NOT NULL — see §6.1.1(b) |
| [`WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md`](WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md:1) | CRIT-001 | Do not rely on RLS for invite isolation |
| [`SECURITY_NOTES.md`](SECURITY_NOTES.md:1) | AR-001 | The AT SDK dependency chain this order sends through |
| `MISSION_STATUS.md` | Open items | AT sender-ID registration — Captain action, not started |
| `CREW-ORDER-010` (not yet written) | — | Depends on this order |

---

## 8. MILESTONES

| # | Milestone | Verification |
|---|---|---|
| 1 | Bones verdict obtained for SMS copy **and** invite landing screen | `BONES_VERDICT.md` entry, before any UI is built |
| 2 | Uhura + Worf POPIA ruling recorded on unsolicited SMS invites (§4.4) | Written ruling, or Captain's explicit documented acceptance of the risk |
| 3 | Migration: `invites` table, additive, `phone_number` is `bytea` | Schema review; `coop_pii` untouched |
| 4 | `POST /api/invites` creates + sends; `nodeId` from session; steward scoped to own cell | 201 for steward, 403 for cross-cell and cross-node, 400 for bad body |
| 5 | `POST /api/invites/:token/accept` rejects forwarded links | Accept with a *different* phone → 400; with the invited phone → succeeds |
| 6 | Accept can only ever produce `role = 'member'` | Attempted `role` injection in body is ignored; DB shows `member` |
| 7 | Invite is single-use and expiring | Second accept → generic error; expired invite → generic error; same response both times |
| 8 | Rate caps and duplicate suppression enforced | Repeated calls within the window are rejected |
| 9 | Full loop verified with Captain's test phone | Invite SMS → landing → OTP → user in correct cell with role `member` |
| 10 | `GET /api/invites` never returns`phone_number` or a token | Response body inspected |
| 11 | `npm run build` — zero errors | Verified against a fresh clone |
| 12 | Standup committed | `OBRIEN_STANDUP.md` updated |

**Definition of order complete:** milestones 1–12 verified, **with milestone 9 explicitly run on the debug fallback and milestone 2 recorded before any real-person invite**. The order is *not* complete merely because the code builds — this order's whole risk profile is in who receives the SMS.

---

## 9. UHURA INTELLIGENCE REQUIRED

**Yes — required before real invites, not before the build.**

1. **AT sender-ID registration** — current requirements and realistic lead time for a South African sender ID, and whether an alphanumeric or short-code sender is needed for reliable delivery to the major SA networks.
2. **WhatsApp Business sender approval** — required to scope ORDER 010 and any later WhatsApp work. Note this order is SMS-only.
3. **POPIA position on unsolicited SMS invitations** (§4.4) — this is the one that gates real use. Is a neighbour-initiated invitation to a specific individual lawful without prior consent; does it change if the message is framed as a personal referral rather than a platform promotion; what must the message say or avoid.
4. Whether either SA network imposes content pre-registration on invitation-style messaging.

---

## 10. REPORTING BACK

**Triggers a new Bridge session (stop and escalate):**
- If the POPIA position (§4.4) cannot be resolved favourably, since that changes the product's onboarding model, not just the implementation.
- If the schema change needs to touch `notification_log` (§6.1.1b) rather than staying additive.
- **If CRIT-001 is still open when this order reaches milestone 9** — real PII arriving in a system with no enforced database-level isolation is a Captain decision, not an engineering one.

**Can be decided without escalation:** rate-cap values; exact SMS wording within the Bones guardrails; whether invite creation lives on the steward dashboard or the node-admin screen.

---

## 11. SAREK ESCALATION CLAUSE

Not required by default. If the accept-flow's interaction with the existing OTP/account-creation path proves genuinely ambiguous — specifically, how a first-time invited user is created without forking `verifyCodeRoute` into two divergent code paths — escalate to Scotty for the implementation pattern.

---

## 12. INHERITED RISKS — READ BEFORE BUILDING

| Risk | Effect on this order |
|---|---|
| **CRIT-001** — RLS enabled but not enforced | Do not rely on RLS for invite isolation. Handler-level `nodeId` filters are the control. Captain must accept or fix before real invites. |
| **AR-001** — AT SDK transitive advisories (`axios`/`lodash`/`joi`) | This order sends through that SDK. See revisit trigger 2 in `SECURITY_NOTES.md` — if invite sending starts passing user-controlled data anywhere other than the message body and recipient, AR-001 becomes actionable. |
| **Pattern 003** — `OTP_DEBUG_LOG` must be unset before real members | Applies doubly here: an invite URL in logs is a live credential granting cell membership. |
| **Pattern 005** — eager SDK construction kills the function at import | AT client must stay lazy. |
| **Pattern 006** — catch-all param arrives as `'...path'` | New catch-all must copy the existing `segments()` helper. |

---

*CREW ORDER 009 — Notifications: SMS Invites*
*Drafted by O'Brien, 2026-09-11, at Captain direction. **Not in force** — awaiting Spock review and Captain approval. This draft deliberately does not modify or supersede any completed order.*
