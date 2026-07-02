# CREW ORDER — 006
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-006
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY — awaiting O'Brien
**Date issued:** 2026-07-03
**Depends on:** CREW-ORDER-005 ✅ COMPLETE

---

## 1. STRATEGIC CONTEXT

This is the core product. Everything built in ORDERS 002–005 exists to make ORDER 006 possible. The Trade Exchange is the moment a community member sees what their neighbours are offering and needing, posts their own listing, and the Cell Steward facilitates a match. This is Ubuntu made functional.

The approved McCoy design is in `design/prototype-v1/ui_kits/resilientsa-app/TradeExchange.jsx` and the Bones-approved screenshots are on record. O'Brien builds from those. The pillar colours, card patterns, left border treatment, ↑/↓ pill icons, and "I want this" / "I can help" / "Match a member" button pattern are all specified and approved — do not deviate from them.

**Parallel order note:** ORDER 007 (Steward Dashboard) and ORDER 008 (Community Marketplace) both depend on ORDER 006 being complete. Once ORDER 006 is merged, O'Brien may start ORDER 007 and ORDER 008 can begin in parallel if capacity allows.

---

## 2. MISSION OBJECTIVE

Build the complete Trade Exchange: listing CRUD API, match proposal and confirmation flow, fairness confirmation, Community Exchange Reference generation, and the full PWA UI matching the Bones-approved prototype design.

---

## 3. BONES BRIEF

**Bones review required** — this is the primary product screen and the platform's first value demonstration to a community.

**What is being reviewed:** Trade Exchange listing feed, create-listing sheet, and match interaction states.

**Who will encounter this:** A community member browsing their cell's listings, or a Cell Steward facilitating a match. This is the screen they saw in the prototype at the community meeting. It must match that expectation.

**Emotional target:** "I can see what my community has and needs. I can contribute in 30 seconds."

**Visual spec — mandatory, from Bones-approved prototype:**
- Listing cards carry a **6px left border in the pillar colour** — this is load-bearing for Q6 (visual language without text)
- **Offering cards:** green (Fynbos Aloe `#4A7256`) left border, ↑ icon + "Offering" pill in aloe tint, "I want this" primary button (full width, Fynbos Aloe)
- **Needed cards:** Ochre Earth `#C85A3C` left border, ↓ icon + "Needed" pill in safety tint, "I can help" outlined button (Ochre Earth border/text), "Match a member" secondary dashed button (Steward only)
- **Pillar icon row:** scrollable, all six pillars visible, coloured circles with Lucide icons from `design/prototype-v1/components/`
- **Filter tabs:** Everything / ↑ Offering / ↓ Needing — tab with icon, not just text
- **Create listing sheet:** "Share with your cell", ↑ I'm offering / ↓ I need help toggle, 3×2 pillar grid with full-colour circles, single text input, "Post to the cell" primary button
- **FAB:** Fynbos Aloe `#4A7256` circle, + icon, fixed bottom-right

**Anti-patterns to avoid:**
- Any card without a pillar colour left border
- The word "pillar" anywhere in the UI
- A create-listing form with more than one visible field at a time (pillar selection + description is the full form)
- Any confirmation dialog before "I want this" — the tap should feel immediate

**Brand references:** All pillar colours from `src/lib/pillars.ts` — PILLAR_COLOURS is the single source. Never hardcode hex values in components.

---

## 4. WORF BRIEF

No new PII in this order — listings contain user-generated text only (title, description). Worf review is not required. O'Brien should confirm:
- Listings queries respect the RLS context (`withRLSContext` used on all listing routes)
- The `node_id` and `cell_id` on new listings are derived from the authenticated session, never from the request body — a member cannot post a listing to a different node by sending a different node_id

---

## 5. DESIGN SYSTEM REFERENCE

`design/prototype-v1/ui_kits/resilientsa-app/TradeExchange.jsx` — McCoy's approved component. Read it before writing any Trade Exchange component. The component structure, state management pattern, and UI copy are all there. O'Brien re-implements in the production React/TypeScript project — not copy-paste, but faithful to the approved design.

`design/prototype-v1/components/cards/ListingCard.*` — the card component from McCoy's system.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 Backend — API Routes

Add `server/routes/listings.ts`:

```typescript
// GET /listings?cell_id=&pillar=&type=&status=
// POST /listings
// PATCH /listings/:id
// DELETE /listings/:id  (soft delete → status: withdrawn)

// GET /matches?user_id=
// POST /matches                     (Steward-initiated)
// PATCH /matches/:id/confirm
// PATCH /matches/:id/decline

// POST /trade-completions/:match_id/confirm-fairness

// GET /community-exchange-reference?cell_id=&pillar=
```

**Key business rules to enforce server-side:**

`POST /listings` — `node_id` and `cell_id` are taken from `req.nodeId` and the authenticated user's `cellId` (looked up from session). Never trust node_id or cell_id from the request body.

`POST /matches` — requires `role === 'cell_steward'` or `role === 'node_admin'`. A general member cannot create a match. Sets `facilitated_by_steward` to `req.userId`.

`PATCH /matches/:id/confirm` — both listing parties must confirm. The API checks that `req.userId` is one of the users whose listing is in the match. Confirmation is recorded per-party, not as a single flag.

`POST /trade-completions/:match_id/confirm-fairness` — on fairness confirmation from both parties, write a `ConnectionEvent` for each pair (user_a ↔ user_b, `event_type: trade_completed`). This is what feeds the network health metrics in ORDER 007.

`GET /community-exchange-reference` — generated from `TradeCompletion` history, not hand-entered. Return the most recent 10 completed trades for the requested pillar/cell as reference data, with sample_size shown alongside every entry.

**Listing status transitions (server enforces these, client cannot skip):**
```
open → matched    (POST /matches confirms)
matched → completed  (POST /trade-completions/:id/confirm-fairness, both parties)
open → withdrawn  (DELETE /listings/:id)
matched → withdrawn  (only if match is declined)
```

**Conflict resolution for status fields (per Technical Architecture Section 5.2):**
On `PATCH /listings/:id`, require an `expected_status` field in the body. If the current DB status doesn't match `expected_status`, return 409 Conflict. This prevents two Stewards from simultaneously matching the same listing.

### 6.2 Offline — Outbox Pattern

New listings and fairness confirmations must work offline. Implement the Outbox pattern (Technical Architecture Section 5.1):

```typescript
// src/lib/outbox.ts
import { openDB } from 'idb'

export interface OutboxEntry {
  id:          string
  endpoint:    string
  method:      string
  payload:     unknown
  createdAt:   number
  syncStatus:  'pending' | 'syncing' | 'synced' | 'failed'
  retryCount:  number
}

const DB_NAME = 'resilientsa'
const STORE   = 'outbox'

// addToOutbox, getOutbox, updateOutboxEntry, removeOutboxEntry
// — implement as IndexedDB operations using idb
```

`useOutboxSync.ts` hook (stub from ORDER 002 — implement now): on connectivity return, drain the outbox in creation order, retry failed entries with exponential backoff, max 5 retries, then mark as failed and surface to user.

Listings created offline are written to IndexedDB immediately (optimistic UI) and queued to the outbox. The UI shows them instantly with a "pending sync" indicator.

### 6.3 Frontend — Component Structure

```
src/components/trade-exchange/
  TradeExchange.tsx        — main screen, filter tabs, listing feed
  ListingCard.tsx          — offer/need card with pillar border, actions
  PillarFilterRow.tsx      — scrollable pillar icon row
  CreateListingSheet.tsx   — bottom sheet, pillar grid, description input
  MatchActions.tsx         — "Match a member" steward action (role-gated)
  EmptyState.tsx           — first listing prompt, per pillar empty states
```

**`ListingCard.tsx` — the most critical component:**

```typescript
// Every card must have:
// - 6px left border in PILLAR_COLOURS[pillar] — no exceptions
// - Pill: ↑ "Offering" or ↓ "Needed" with tint background from PILLAR_TINTS[pillar]
// - Pillar icon (top-right corner): Lucide icon in PILLAR_COLOURS[pillar]
// - For offers: full-width "I want this" button in action-primary
// - For needs: "I can help" outlined button + "Match a member" dashed (steward only)
// - Member name + cell location below title
// - Card surface: bg-canvas-raised (#FBFBF9), rounded-md (16px), shadow-card
```

**`CreateListingSheet.tsx`:**

```typescript
// Bottom sheet — slides up from bottom (sheet animation from Living Soil motion spec)
// Header: "Share with your cell"
// Toggle: ↑ I'm offering / ↓ I need help (SegmentToggle from McCoy components)
// Pillar grid: 3×2, full-colour circles (same as Gifts Profile pillar selection)
// Single textarea: placeholder changes per toggle ("What are you offering?" / "What do you need?")
// Submit: "Post to the cell" — full width, action-primary
// On submit: optimistic add to feed, add to outbox if offline, close sheet
```

**`PillarFilterRow.tsx`:**

```typescript
// Scrollable horizontal row
// First item: "All" — dark circle (Baobab Bark), sprout icon
// Then: all 6 pillars — PILLAR_COLOURS circle, PILLAR_ICONS icon, PILLAR_LABELS label
// Active state: larger circle, bold label, pillar colour border ring
// All six pillars must be accessible — scroll hint if needed on small screens
```

### 6.4 Routing and Data Flow

**`/trade` route:**
1. On mount: fetch `GET /listings?cell_id=<user's cell>` — show loading state
2. Cache response in IndexedDB (90-day rolling window per Technical Architecture Section 5.3)
3. If offline: serve from IndexedDB cache with a staleness timestamp shown to user
4. Filter tabs update the `type` query param, re-fetch (or filter cached)
5. Pillar filter updates the `pillar` query param similarly

**Post-auth flow check:** if user has no `cellId` (not yet assigned to a cell), show a friendly holding state — "Your Cell Steward will add you to a cell soon" — not an error.

### 6.5 i18n — add to `en.json` under `"exchange"` key

Most keys already exist from ORDER 002 scaffold. Add or confirm:
```json
{
  "offering_pill": "Offering",
  "needed_pill": "Needed",
  "i_want_this": "I want this",
  "i_can_help": "I can help",
  "match_member": "Match a member",
  "share_title": "Share with your cell",
  "im_offering": "I'm offering",
  "i_need_help": "I need help",
  "what_offering": "What are you offering?",
  "what_needing": "What do you need?",
  "post_to_cell": "Post to the cell",
  "filter_all": "Everything",
  "filter_offer": "Offering",
  "filter_need": "Needing",
  "empty_cell": "Be the first to offer something",
  "empty_offer": "Nothing being offered in this pillar yet",
  "empty_need": "No needs posted in this pillar yet",
  "pending_sync": "Waiting to sync",
  "no_cell_yet": "Your Cell Steward will add you to a cell soon"
}
```

Add equivalent keys to `af.json`.

### 6.6 ConnectionEvent on Trade Completion

This is critical for ORDER 007 (network health). On `POST /trade-completions/:match_id/confirm-fairness` when both parties have confirmed:

```typescript
// Write ConnectionEvent rows
await db.insert(connectionEvents).values([
  { nodeId, userAId: party1UserId, userBId: party2UserId, eventType: 'trade_completed' },
  { nodeId, userAId: party2UserId, userBId: party1UserId, eventType: 'trade_completed' },
])
```

Two rows, one per direction — this makes the graph undirected and simplifies the network analysis queries in ORDER 007.

---

## 8. MILESTONES

1. `POST /listings` creates a listing — `node_id` and `cell_id` from session, not body ✅
2. `GET /listings` returns listings filtered by cell, pillar, type, status ✅
3. `POST /matches` (Steward only) creates a match — non-steward returns 403 ✅
4. `PATCH /matches/:id/confirm` — 409 on status conflict ✅
5. `POST /trade-completions/:id/confirm-fairness` — writes `ConnectionEvent` on both-party confirmation ✅
6. `GET /community-exchange-reference` returns completed trade history ✅
7. Offline: new listing created without connectivity appears in feed immediately, syncs on reconnect ✅
8. ListingCard renders with correct pillar left border colour for all six pillars ✅
9. CreateListingSheet opens, pillar grid works, submission creates listing ✅
10. Steward sees "Match a member" button; non-steward does not ✅
11. All copy in English and Afrikaans ✅
12. Bones verdict — PASS or CONDITIONAL PASS with changes applied
13. `OBRIEN_STANDUP.md` entry committed

---

## 9. UHURA INTELLIGENCE REQUIRED

None for this order.

---

## 10. REPORTING BACK

O'Brien commits `OBRIEN_STANDUP.md` entry including:
- Confirmation that `node_id`/`cell_id` injection from session (not body) is verified
- ConnectionEvent write confirmed on trade completion
- Offline outbox test result (created listing offline, went online, confirmed sync)
- Bones verdict reference
- Any deviations and why

Then await CREW-ORDER-007 (Cell Steward Dashboard + Batch Jobs) — may run in parallel with ORDER 008.

---

## 11. SAREK ESCALATION CLAUSE

The offline Outbox pattern implementation is the most technically complex part of this order — specifically the background sync timing and the optimistic UI reconciliation when the outbox drains. If blocked for 3 attempts on the Service Worker background sync event, escalate to Scotty. The conflict resolution (409 on status mismatch) may require careful testing with concurrent requests — use Postman or similar to simulate two simultaneous PATCH calls to the same listing.

---

**ORDER STATUS: READY — awaiting O'Brien**

*Issued by Spock — 2026-07-03*
