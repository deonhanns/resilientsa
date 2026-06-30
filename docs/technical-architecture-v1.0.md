# ResilientSA — Technical Architecture Document
## Bridge Document | Version 1.0
*The technical foundation for O'Brien's build. Scoped to MVP (Mission Brief Section 11) — Phase 2/3 architecture noted but not detailed here.*

---

## 1. Purpose and Scope

This document translates the Mission Brief's architecture principles (Sections 4, 10, 12) into a concrete, buildable system: the actual data model, the actual API surface, the actual sync mechanism, and the actual project structure. Where the Mission Brief says "federated" or "offline-first," this document says exactly what that means in code.

**Scope:** MVP only (Mission Brief Section 11.1–11.2). Phase 2 features (cooperative formation backend, adaptive ML, mesh radio, multi-region federation) are noted where they affect MVP data modelling decisions, but not fully specified here — they get their own architecture addenda when their time comes.

This document does not replace `docs/community-marketplace-spec-v1.0.md` or `docs/cooperative-formation-spec-v1.0.md` — it is the substrate those specs are built on. Where those specs already define data models (e.g. `ProgrammeOffering`, `Cooperative`), this document shows how those models fit into the whole.

---

## 2. The Three-Tier Architecture — Made Concrete

Mission Brief Section 4.4 defines three tiers conceptually. Here is what each tier actually is.

### 2.1 Device Edge

**What it is:** The Progressive Web App running in a member's or Cell Steward's browser.

**Technology:**
- React (function components, hooks only — no class components)
- Vite as build tool (fast, simple, well-suited to PWA tooling)
- IndexedDB via the `idb` library for structured offline storage
- Service Worker for offline asset caching and background sync queue
- Tailwind CSS, configured with the ResilientSA design tokens (Section 6 below)

**What it stores locally:**
- The current user's profile and Gifts Profile
- Their cell's recent trade listings (last 90 days, capped)
- Their cell's Community Exchange Reference (cached, refreshed on connect)
- Any unsent actions (new listings, fairness confirmations, trade matches accepted) queued for sync

**What it does NOT store locally:**
- Other cells' or nodes' data beyond what's been explicitly shared with this user
- Any PII belonging to anyone other than the device's own user
- Cooperative formation founding member data (this is Node Admin-only, server-side, never cached to a general member's device)

### 2.2 Community Node

**What it is:** A single backend instance serving one community node (Mission Brief's RA/CPF-registered community). In MVP, this is **not** a literal Raspberry Pi in a community hall — it's a logical tenant in a shared multi-tenant backend, isolated by `node_id`. The Mission Brief's "local server or SA cloud instance" language (Section 4.4) describes the eventual physical deployment target for Phase 2/3, not the MVP starting point.

**MVP decision:** Build as multi-tenant from day one (every table carries `node_id`), so the migration path to genuinely separate physical/cloud instances per node later is a deployment change, not a data model rewrite.

**Technology:**
- Node.js + Express (or Fastify) API server
- PostgreSQL — single database, `node_id` as a tenant column on every table, with row-level security policies enforcing tenant isolation at the database layer, not just application logic
- Redis for session state and the SMS notification queue

**What it does:**
- Owns all of a node's trade listings, gifts profiles, cell data, ledger entries
- Runs the Structured and Statistical Intelligence layers (Mission Brief Section 4.3) — rule engine and trade-equivalence calculations scoped to its own node's data only
- Serves the API consumed by the Device Edge PWA

### 2.3 Regional Layer

**MVP decision: not built in Phase 1.** The Mission Brief lists "Inter-community trade at scale" and "Regional Steward dashboard" as explicitly Phase 2 (Section 11.3). Building a separate regional tier for a 5-community pilot is premature infrastructure. 

**What this means concretely:** in MVP, inter-community visibility (Mission Brief Section 4.2 — "Inter-community visibility allows nodes to see what others have to offer") is implemented as a **read-only cross-tenant query** within the same Community Node database — not a separate federated service. This is a deliberate, documented simplification. When Phase 2 requires genuine multi-region federation (separate databases per region, node-to-node sync), this becomes a real architectural project, not a config change — flagged here so it's not mistaken for "already solved."

---

## 3. Data Model

This section is the authoritative schema reference. Entities already defined in feature specs are referenced, not redefined.

### 3.1 Core Entities

```
Node {
  id (uuid, pk)
  name
  location (lat, lng — approximate, not precise address)
  ra_cpf_name
  health_state (enum: generative, stressed, fragile, collapsed)
  health_state_set_by (user_id)
  health_state_set_at (timestamp)
  health_state_notes (text, PRIVATE — never exposed beyond Node Admin + Regional Steward)
  created_at
}

Cell {
  id (uuid, pk)
  node_id (fk → Node)
  name
  steward_user_id (fk → User, nullable until elected)
  steward_companion_user_id (fk → User, nullable)
  created_at
}

User {
  id (uuid, pk)
  node_id (fk → Node)
  cell_id (fk → Cell, nullable until assigned)
  display_name
  phone_number (encrypted at rest)
  role (enum: member, cell_steward, node_admin, regional_steward)
  invited_by (fk → User, nullable)
  created_at
}

GiftsProfile {
  id (uuid, pk)
  user_id (fk → User, one-to-one)
  loves_to_do (text)
  naturally_good_at (text)
  cares_deeply_about (text)
  free_text_gifts (text, searchable)
  updated_at
}

Listing {
  id (uuid, pk)
  node_id (fk → Node)
  cell_id (fk → Cell)
  user_id (fk → User)
  type (enum: offer, need)
  pillar_tags (array, from Six Pillars enum — Water, Food, Health, Safety, Energy, Skills_Trade)
  title
  description
  photo_url (nullable)
  status (enum: open, matched, completed, withdrawn)
  created_at
  updated_at
}

Match {
  id (uuid, pk)
  listing_ids (array — 2 for direct match, 3+ for multi-party swap)
  status (enum: proposed, confirmed, completed, declined)
  facilitated_by_steward (fk → User, nullable — Mission Brief 5.3, Steward facilitates introductions)
  created_at
}

TradeCompletion {
  id (uuid, pk)
  match_id (fk → Match)
  fairness_confirmed_by_each_party (jsonb — {user_id: boolean})
  flagged (boolean, default false)
  flagged_reason (text, nullable)
  completed_at
}

CommunityExchangeReference {
  id (uuid, pk)
  node_id (fk → Node)
  cell_id (fk → Cell, nullable — can be cell-level or node-level)
  pillar_tag
  item_description
  typical_equivalent (text — generated from TradeCompletion history, not hand-entered)
  sample_size (integer — number of trades this is based on, always shown alongside the reference per Mission Brief 5.2)
  generated_at
}

ValueCharter {
  id (uuid, pk)
  node_id (fk → Node, one-to-one)
  content (text, structured per Mission Brief 5.4 sections)
  ratified_at (timestamp, nullable until community ratifies)
  last_reviewed_at
}
```

### 3.2 Marketplace and Grounder Entities

Already fully specified in `docs/community-marketplace-spec-v1.0.md` Section 8 — `ProgrammeOffering`, `OfferingEngagement`, `OfferingEndorsement`. Referenced here, not duplicated. One addition needed for MVP completeness:

```
Grounder {
  id (uuid, pk)
  organisation_name
  contact_email (encrypted at rest)
  verification_status (enum: applied, under_review, verified, rejected)
  verified_by (fk → User, Platform Steward Council member)
  verified_at (nullable)
  created_at
}
```

`ProgrammeOffering.grounder_id` references this table.

### 3.3 Cooperative Entities

Already fully specified in `docs/cooperative-formation-spec-v1.0.md` Section 9 — `Cooperative`, `FoundingMember`, `CooperativeStatusEvent`. Referenced here, not duplicated.

**Architectural note:** `FoundingMember` is the single most sensitive table in the schema. It must live in its own database schema namespace (`coop_pii`) with stricter row-level security than the rest of the platform, separately encrypted, and subject to the purge-on-registration rule (Cooperative Formation spec Section 2) enforced by a scheduled job, not just application logic that could be bypassed by a bug.

### 3.4 Network Health Entities

```
ConnectionEvent {
  id (uuid, pk)
  node_id (fk → Node)
  user_a_id (fk → User)
  user_b_id (fk → User)
  event_type (enum: trade_completed, steward_introduction, gift_acknowledgement)
  created_at
}
```

This table is the raw material for the Network Health Metrics in Mission Brief Section 6.1 (Connection Density, Isolate Detection, etc.) — those metrics are **computed views**, not stored state, recalculated on read or via a nightly batch job. Do not build them as columns that need manual updating.

### 3.5 Crisis Mode Entities — MVP Scope Only

Mission Brief Section 11.2 lists "Basic Crisis Mode" as Should Have for Phase 1 — simplified interface, Pillar 1-3 filter, resource map priority. The full Crisis Roster and Crisis Roles Framework (Mission Brief Section 7) is explicitly Phase 2 (Section 11.3). MVP needs only:

```
CrisisMode {
  id (uuid, pk)
  node_id (fk → Node)
  activated_by (fk → User)
  activated_at
  deactivated_at (nullable)
}
```

When a `CrisisMode` row is active for a node, the API filters `Listing` queries to Pillars 1–3 only and the PWA switches to the simplified crisis UI (Section 6.4 below). No Crisis Roster, no anticipatory intelligence, no SMS broadcast tooling — those are Phase 2 builds requiring their own spec (flagged in Section 8 of this document).

---

## 4. API Surface

REST, not GraphQL — simpler to implement offline-sync logic against, and the data access patterns here are mostly straightforward CRUD plus a handful of computed views, not complex nested queries that would benefit from GraphQL's flexibility.

### 4.1 Authentication

No passwords, no email/password accounts — consistent with Mission Brief's "no ID number, email, or bank details required" (Section 3.1). Authentication is phone-number + SMS one-time-code, via Africa's Talking.

```
POST /auth/request-code      { phone_number }
POST /auth/verify-code       { phone_number, code } → { session_token }
```

Session tokens are long-lived (30 days), stored in IndexedDB on the Device Edge, refreshed silently on each successful API call. This matches the offline-first principle — a member shouldn't need to re-authenticate every time connectivity returns.

### 4.1a Notification Channels — SMS, PWA Push, and WhatsApp (Augmenting, Not Replacing)

The platform's notification layer has three channels. **WhatsApp is additive — it augments the existing SMS and PWA notification channels, it does not replace either, and no platform function requires WhatsApp to work.** A member who never installs WhatsApp experiences zero functional loss.

This addition is grounded in South Africa's actual usage pattern, not assumption: WhatsApp penetration among South African internet users sits above 90%, average monthly usage exceeds 23 hours, and its low-data, offline-tolerant design specifically suits the connectivity conditions ResilientSA is built for (Mission Brief Section 10). For many Cell Stewards and community members, WhatsApp is already the app they open most — meaning a notification arriving there carries a materially lower adoption barrier than a new PWA notification or even an SMS, without requiring the platform to abandon either.

**Why this is low-effort to add:** Africa's Talking — already the specified SMS vendor (Section 7.1, Mission Brief 12.2) — offers a WhatsApp Business API product alongside SMS. This means WhatsApp can be added to the existing notification queue (Section 2.2, Redis-backed) as a third delivery channel through the same vendor relationship already budgeted and specified, not a new integration project.

**Scope — what WhatsApp is good for in MVP:**
- Trade match notifications ("Someone in your cell has what you're looking for — your Cell Steward will introduce you")
- Fairness-confirmation prompts after a trade
- Cell Steward alerts (isolate flags, burnout signals, needs radar summaries)
- Crisis Mode activation notices

These are all short, conversational, single-action messages — a natural fit for WhatsApp's format, structurally identical to what would otherwise be sent via SMS.

**Scope — what stays PWA/SMS only, deliberately not WhatsApp, in MVP:**
- Gifts Profile creation (multi-field structured input)
- Cooperative Formation founding member collection (Section 3.3 — PII-sensitive, requires the stricter `coop_pii` security boundary; a WhatsApp conversation is not an appropriate capture surface for ID numbers and addresses)
- Any Node Admin or Cell Steward dashboard view (these need structured, glanceable UI — a chat thread is the wrong medium)

**Data model addition:**
```
User {
  ...existing fields (Section 3.1)...
  whatsapp_opted_in (boolean, default false)
  whatsapp_number (encrypted at rest, nullable — may differ from primary phone_number)
}

NotificationLog {
  id (uuid, pk)
  user_id (fk → User)
  channel (enum: sms, push, whatsapp)
  message_type (enum: trade_match, fairness_prompt, steward_alert, crisis_activation)
  sent_at
  delivery_status (enum: sent, delivered, failed)
}
```

Opt-in is explicit and per-channel — a member can be on SMS without WhatsApp, or both, or neither beyond in-app push. No channel is assumed.

**What this is not:** this is not a WhatsApp-first redesign, not a chatbot, not a conversational interface replacing the Trade Exchange or Community Marketplace. It is a third delivery pipe for notifications the platform already generates, added because it meets people where they already spend their time — consistent with the platform's calm technology principle (Mission Brief Section 2.5) of serving without intruding.

### 4.2 Core Resource Endpoints

```
GET    /nodes/:node_id
GET    /cells/:cell_id

GET    /users/me
PATCH  /users/me

GET    /gifts-profile/me
PUT    /gifts-profile/me

GET    /listings?cell_id=&pillar=&type=&status=
POST   /listings
PATCH  /listings/:id
DELETE /listings/:id   (soft delete → status: withdrawn)

GET    /matches?user_id=
POST   /matches                          (Steward-initiated, per Match.facilitated_by_steward)
PATCH  /matches/:id/confirm
PATCH  /matches/:id/decline

POST   /trade-completions/:match_id/confirm-fairness
GET    /community-exchange-reference?cell_id=&pillar=

GET    /value-charter/:node_id
PUT    /value-charter/:node_id           (Node Admin only)

GET    /marketplace/offerings?pillar=&search=     (see community-marketplace-spec-v1.0.md Section 8)
POST   /marketplace/offerings/:id/request

GET    /crisis-mode/:node_id
POST   /crisis-mode/:node_id/activate    (Cell Steward or Node Admin only)
POST   /crisis-mode/:node_id/deactivate
```

### 4.3 Cell Steward and Node Admin Endpoints

```
GET    /steward/dashboard/:cell_id        (member list, ledger, needs radar — aggregated, computed)
GET    /steward/isolates/:cell_id         (Network Health — members with no recent ConnectionEvent)
GET    /steward/hubs/:cell_id             (Network Health — high connection density, burnout risk flag)
POST   /steward/log-offline-trade         (Mission Brief 3.2 — Steward records trades that happened offline)

GET    /admin/node-overview/:node_id
PATCH  /admin/cells/:cell_id/steward      (approve/assign Cell Steward)
```

### 4.4 Cooperative Formation Endpoints

Defined by `docs/cooperative-formation-spec-v1.0.md` Section 5 (the 7-step wizard). Summarised here for completeness:

```
GET    /cooperative/readiness/:node_id
POST   /cooperative/:node_id/start
PATCH  /cooperative/:node_id/founding-members
PATCH  /cooperative/:node_id/directors
POST   /cooperative/:node_id/generate-constitution
POST   /cooperative/:node_id/generate-coop1
PATCH  /cooperative/:node_id/status        (manual status tracker update, per spec Section 6)
```

All endpoints under `/cooperative/*` require Node Admin role and are subject to the stricter `coop_pii` security boundary (Section 3.3 above).

---

## 5. Offline Sync Mechanism

This is the piece the Mission Brief gestures at ("offline-first," "background sync") without specifying mechanics. Here is the actual mechanism.

### 5.1 The Outbox Pattern

Every write action (new listing, fairness confirmation, gift profile update) performed while offline is written to an **Outbox table in IndexedDB** on the device, not directly to the server. The UI updates optimistically (the user sees their action take effect immediately) while the Outbox entry waits to sync.

```
OutboxEntry {
  id (uuid, client-generated)
  endpoint
  method
  payload
  created_at
  sync_status (enum: pending, syncing, synced, failed)
  retry_count
}
```

The Service Worker's background sync event drains the Outbox whenever connectivity returns, in creation order, retrying failed entries with exponential backoff up to 5 attempts before flagging the entry as needing manual review (surfaced to the user as "this didn't save — tap to retry").

### 5.2 Conflict Resolution

Given the platform's nature — gift listings, not financial transactions — most conflicts are low-stakes and resolved with **last-write-wins** at the field level. The one place this is insufficient: `Listing.status` transitions (e.g. two Cell Stewards both trying to mark the same listing as matched while offline). For status fields specifically, the server rejects a sync if the current server-side status doesn't match the client's expected prior status, and returns a conflict response that the PWA surfaces to the Cell Steward as "this was already updated — refresh to see the current state" rather than silently overwriting.

### 5.3 What Syncs vs. What's Always Cached

| Data | Sync Behaviour |
|---|---|
| Own profile, own listings | Read from cache always, write via Outbox |
| Cell's recent listings (90 days) | Refreshed on connect, served from cache offline |
| Community Exchange Reference | Refreshed on connect, served from cache offline, timestamped so staleness is visible to the user |
| Cooperative formation data | **Never cached on general member devices** — Node Admin only, requires live connection (acceptable trade-off given this is a deliberate, infrequent, high-stakes workflow, not a daily-use feature) |
| Crisis Mode resource map | Aggressively cached, explicitly designed to remain usable for days without connectivity per Mission Brief Section 10 |

---

## 6. Frontend Architecture

### 6.1 Design Token Integration

`docs/brand-palette-v1.0.md` defines the full token set (Baobab Bark, Canvas Grey, Ochre Earth, Fynbos Aloe, Sunbaked Clay, Rainwater Blue) and the pillar/state mappings. These are implemented as a Tailwind config extension, not hardcoded hex values scattered through components:

```js
// tailwind.config.js (excerpt)
colors: {
  'baobab-bark': '#2C2A29',
  'canvas-grey': '#F4F4F2',
  'ochre-earth': '#C85A3C',
  'fynbos-aloe': '#4A7256',
  'sunbaked-clay': '#E6A854',
  'rainwater-blue': '#3D6B8C',
}
```

Pillar-to-colour mapping and UI-state-to-colour mapping (both defined in brand-palette-v1.0.md) are implemented as a single shared TypeScript constant (`pillarColours.ts`, `stateColours.ts`) imported everywhere a pillar tag or status indicator renders — never re-derived per component.

### 6.2 Component Structure

```
/src
  /components
    /trade-exchange       (Listing cards, create-listing flow, match proposals)
    /marketplace          (Programme Offering cards, request flow — per community-marketplace-spec)
    /steward-dashboard     (Needs radar, member list, ledger, isolate/hub flags)
    /gifts-profile         (Three-question guided capture)
    /crisis-mode           (Simplified high-contrast crisis UI)
    /shared                (PillarTag, StatusBadge, OfflineIndicator — used everywhere)
  /hooks
    useOutboxSync.ts
    useOfflineStatus.ts
  /lib
    api.ts                (typed API client)
    pillarColours.ts
    stateColours.ts
```

### 6.3 Routing

This is a PWA, not a multi-page app with deep server-rendered routing needs. React Router, client-side only, with these top-level routes for MVP:

```
/                    → Community Hub
/trade               → Trade Exchange
/trade/new           → Create listing
/support             → Community Marketplace ("Get Support" entry point)
/profile             → Gifts Profile
/steward             → Cell Steward dashboard (role-gated)
/admin               → Node Admin dashboard (role-gated)
```

---

## 7. Hosting and Deployment

### 7.1 MVP Hosting

Per Mission Brief Section 12.2 recommendation and Captain's existing Vercel connection:
- **Frontend (PWA):** Vercel
- **Backend (API + PostgreSQL):** South African data infrastructure — Hetzner SA or AWS Cape Town region, per Mission Brief 12.1 data sovereignty constraint. This is non-negotiable even though Vercel's edge network is global — the database itself must be SA-hosted.
- **SMS + WhatsApp:** Africa's Talking API — SMS as originally specified (Mission Brief 12.2), WhatsApp Business API as an augmenting notification channel (Section 4.1a) through the same vendor relationship

### 7.2 Environments

```
main          → Vercel preview deployment (current working branch — see .kilo/rules/crew-protocols.md branch strategy)
production    → does not exist yet, created when the domain goes live per Captain's decision
```

---

## 8. What This Document Does Not Cover (Flagged for Future Architecture Work)

- **Genuine multi-region federation** (Section 2.3) — needed when Phase 2's inter-community trade at scale and Regional Steward dashboard are built
- **The Crisis Roles Framework data model** (full Crisis Roster, anticipatory intelligence) — Phase 2, needs its own spec before architecture
- **Adaptive ML / federated learning infrastructure** (Mission Brief 4.3, 12.2) — Phase 2, genuinely different infrastructure (model training pipeline, not just CRUD) and deserves dedicated design
- **Voice/USSD interface** (Mission Brief 10.3) — Phase 2, requires Africa's Talking USSD product integration, not yet scoped
- **Mesh radio integration** (Mission Brief 10.2) — Phase 2, hardware-dependent, out of scope for this document

These are correctly absent here, not forgotten — they belong in their own architecture addenda once their preceding feature specs exist.

---

*ResilientSA Technical Architecture Document v1.0 | Bridge Document | For Engine Room Use | Scoped to MVP per Mission Brief Section 11*
