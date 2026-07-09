# CREW ORDER — 008
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-008
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY — awaiting O'Brien
**Date issued:** 2026-07-09
**Depends on:** CREW-ORDER-006 ✅ COMPLETE
**Parallel with:** CREW-ORDER-007 (different surface, minimal overlap)

---

## 1. STRATEGIC CONTEXT

The Trade Exchange (ORDER 006) lets community members trade gifts with each other. But some needs can't be met within a single cell — they require external organisations with specialised programmes, funding, or institutional reach.

The Community Marketplace is the bridge between those organisations (Grounders) and the communities that need them. A Cell Steward browses Programme Offerings by pillar, finds one that matches their community's need, and requests it. The Grounder sees the request and responds.

Critically, a community member never sees the word "Grounder." They experience this as "Get Support" — a simple, warm entry point to browse what's available. The naming architecture established in `docs/community-marketplace-spec-v1.0.md` Section 2 governs all UI copy in this order.

The McCoy-approved prototype at `design/prototype-v1/ui_kits/resilientsa-app/Marketplace.jsx` defines the visual contract.

**Parallel order note:** ORDER 007 (Steward Dashboard) runs alongside this order. They share no API routes, no components, and minimal data model overlap. O'Brien may sequence as capacity allows.

---

## 2. MISSION OBJECTIVE

Build the Community Marketplace — Programme Offering browsing by pillar, request flow from Cell Steward to Grounder, Grounder-side offering management, endorsement collection on engagement completion, and the full PWA UI matching the Bones-approved prototype design.

---

## 3. BONES BRIEF

**Bones review required** — this is the community-facing browsing experience for external support.

**What is being reviewed:** Community Marketplace screen — pillar grid entry point, offering cards, request flow.

**Who will encounter this:** A Cell Steward or Node Admin browsing for their community. The language must feel like asking a neighbour for help, not shopping a catalogue.

**Emotional target:** "My community can get support for what we need. It's clear what's available and how to ask."

**Visual spec — mandatory, from Bones-approved prototype:**

From `design/prototype-v1/ui_kits/resilientsa-app/Marketplace.jsx`:

- **Entry point:** "What kind of support does your community need?" — a question, not a label. Subtitle: "Tap one to see what other communities have used."
- **Pillar grid:** 3×2 grid of pillar circles, identical visual treatment to the Trade Exchange pillar grid. Consistent mental model across the platform.
- **Offering cards (ProgrammeCard):** Each card shows: provider name (small, secondary), offering title, one-line description, pillar tag (coloured), endorsement count ("Used by X communities"), "Request for our community" button
- **Back navigation:** After selecting a pillar, an arrow-left "Back to support types" button and the active pillar tag shown as a solid-coloured badge
- **Empty state:** "Nothing here yet — check another kind of support." (warm, not disappointing)
- **Request confirmation:** After tapping "Request for our community", a brief request form (auto-prefilled with community details), submit → confirmation message

**Anti-patterns to avoid:**
- The word "Marketplace" anywhere in the UI — it implies commerce. The community-facing term is "Get Support"
- The word "Grounder" anywhere in the community-facing UI — the naming architecture separates internal identity from community language
- Any pricing, monetary, or "buy" framing — programmes are free by platform-wide Grounder commitment
- Star ratings or ranking mechanics — endorsements are "Recommended by X of Y communities", not scores
- E-commerce visual conventions: no shopping cart icons, no checkout language, no "add to cart"
- A pillar grid that differs from the Trade Exchange — it must look identical so the mental model transfers

**Brand references:** All pillar colours from `src/lib/pillars.ts`. PILLAR_COLOURS is the single source. The Fynbos Aloe green is used for positive/active states; Sunbaked Clay for pending requests — consistent with the brand palette.

---

## 4. WORF BRIEF

No new PII in this order — Programme Offerings, engagements, and endorsements contain organisational data and community names only. Worf review is not required, but O'Brien must confirm:

- `POST /marketplace/offerings/:id/request` validates that the requesting user is a Cell Steward or Node Admin — individual members cannot make requests (per community-marketplace-spec Section 10)
- Grounder verification status is checked before their offerings appear in browse results — unverified Grounders cannot publish offerings
- Offering request data (`request_context` free text) is not logged to console
- Community names shown on offering detail view (Section 4.2 of the community marketplace spec) respect the opt-in visibility flag — communities that haven't consented are not listed

---

## 5. DESIGN SYSTEM REFERENCE

`design/prototype-v1/ui_kits/resilientsa-app/Marketplace.jsx` — McCoy's approved component. Read it before writing any Marketplace component.

`design/prototype-v1/components/cards/ProgrammeCard.jsx` — the offering card pattern.

`design/prototype-v1/components/pillars/PillarGrid` — the pillar selection grid (if available; otherwise match the Trade Exchange's pillar grid pattern).

The component structure, state management, and UI copy are in these files. O'Brien re-implements in the production React/TypeScript project — faithful to the approved design, not copy-paste.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 Backend — API Routes

Add `server/routes/marketplace.ts`:

```typescript
// Community-facing:
// GET  /marketplace/offerings?pillar=&search=
// POST /marketplace/offerings/:id/request
//
// Grounder-facing:
// POST /marketplace/offerings                   (create offering)
// PATCH /marketplace/offerings/:id              (edit offering)
// GET  /marketplace/offerings/mine              (Grounder's own offerings)
// GET  /marketplace/requests                    (Grounder's incoming requests)
// PATCH /marketplace/engagements/:id            (accept/decline/complete)
// POST /marketplace/engagements/:id/endorse     (post-engagement endorsement)
```

All routes require authentication. Grounder-facing routes require `role === 'grounder'` (set via the `Grounder` table lookup from `req.userId`).

#### 6.1.1 GET /marketplace/offerings

```typescript
// Query params: ?pillar=water&search=literacy
// Both optional. No params = return all active offerings.

// Response:
{
  offerings: {
    id: string,
    name: string,
    shortDescription: string,
    pillarTags: Pillar[],            // from ProgrammeOffering.pillar_tags
    providerName: string,            // from Grounder.organisation_name
    providerVerified: boolean,       // from Grounder.verification_status === 'verified'
    endorsementCount: number,        // COUNT of OfferingEndorsement WHERE recommend = true
    totalEndorsements: number,       // total endorsement responses
    status: string
  }[]
}

// Query logic:
// SELECT po.*, g.organisation_name, g.verification_status
// FROM programme_offerings po
// JOIN grounders g ON po.grounder_id = g.id
// WHERE po.status = 'active'
//   AND g.verification_status = 'verified'      -- never show unverified Grounder offerings
//   AND (:pillar IS NULL OR :pillar = ANY(po.pillar_tags))
//   AND (:search IS NULL OR po.name ILIKE '%' || :search || '%' 
//        OR po.short_description ILIKE '%' || :search || '%')
// ORDER BY po.created_at DESC
```

#### 6.1.2 POST /marketplace/offerings/:id/request

```typescript
// Request body:
{
  nodeId: string,              // from session, not request body
  requestContext: string       // free text from Steward: "We have 40 households without water"
}

// Server logic:
// 1. Validate role: cell_steward or node_admin (not general member)
// 2. Create OfferingEngagement:
//    - offering_id = :id
//    - node_id = req.nodeId
//    - status = 'requested'
//    - requested_at = NOW()
//    - request_context = body.requestContext
// 3. Return { engagementId, status: 'requested' }
//
// If this node already has a non-declined engagement for this offering,
// return 409 Conflict: "Your community has already requested this support."
```

#### 6.1.3 Grounder-side Routes

```typescript
// POST /marketplace/offerings
// Create a new ProgrammeOffering. Requires role: 'grounder'.
// Body: { name, shortDescription, fullDescription, pillarTags, communityRequirements, typicalDuration }
// Validation: pillarTags must contain at least 1 valid pillar.

// PATCH /marketplace/offerings/:id
// Edit own offering. Requires ownership (offering.grounder_id === grounder record for req.userId).

// GET /marketplace/offerings/mine
// Returns all offerings created by this Grounder, with engagement counts.

// GET /marketplace/requests
// Returns all OfferingEngagements for this Grounder's offerings where status != 'declined'.
// Includes: offering name, requesting node name, requestContext, requestedAt, status.

// PATCH /marketplace/engagements/:id
// Grounder accepts, declines, or marks an engagement as completed.
// Body: { status: 'accepted' | 'declined' | 'completed' }
// On 'accepted': set started_at = NOW()
// On 'completed': set completed_at = NOW()
// Requires: the engagement's offering belongs to this Grounder.

// POST /marketplace/engagements/:id/endorse
// After an engagement completes, the requesting Node Admin can endorse.
// Body: { recommend: boolean, note?: string, visibility: 'attributed' | 'anonymous' }
// Creates an OfferingEndorsement row.
// Requires: the requesting user is a Node Admin for the node in the engagement.
// Requires: the engagement status is 'completed'.
```

### 6.2 Frontend — Components

Create `src/components/marketplace/` with these components:

```
Marketplace.tsx          — main screen: entry question → pillar grid → offering list
ProgrammeCard.tsx        — offering card with provider, pillar tag, endorsement count, request button
RequestForm.tsx          — brief form: auto-prefilled community info + free-text context field
GrounderOfferings.tsx    — Grounder's own offering management view
GrounderRequests.tsx     — Grounder's incoming requests inbox
```

**Building from the prototype:** The McCoy prototype (`Marketplace.jsx`) uses the DS design system bundle. O'Brien re-implements using the project's existing Tailwind v4 token system and `src/lib/pillars.ts`.

**Key implementation notes:**
- The pillar grid for Marketplace must reuse the same visual pattern as the Trade Exchange pillar selection — `PillarFilterRow` from ORDER 006 can be adapted or a shared `PillarGrid` component extracted
- ProgrammeCard follows the same card architecture as ListingCard (surface-card background, shadow-card, 16px radius) but without the 6px left border — the pillar tag on the card serves the visual identification role instead
- "Request for our community" button uses Fynbos Aloe (`#4A7256`) — the platform's positive action colour
- The endorsement count displays as "Used by X communities" when `endorsementCount > 0`, hidden when zero
- The provider name is secondary text, not the card heading — the offering name leads

### 6.3 Routing

Add to `src/App.tsx`:

```
/support       → Marketplace (ProtectedRoute, accessible to all authenticated users)
/support/new   → GrounderOfferings (role-gated: grounder)
/support/requests → GrounderRequests (role-gated: grounder)
```

Add "Get Support" to the bottom navigation. Position: between Trade Exchange and the Steward area (if Steward) or Profile (if not).

### 6.4 i18n

All Marketplace UI copy externalised to `en.json` and `af.json`. At minimum:

- `marketplace.entryQuestion` — "What kind of support does your community need?"
- `marketplace.entrySubtitle` — "Tap one to see what other communities have used."
- `marketplace.backToTypes` — "Back to support types"
- `marketplace.available` — "{{count}} available"
- `marketplace.emptyState` — "Nothing here yet — check another kind of support."
- `marketplace.requestButton` — "Request for our community"
- `marketplace.requestHeading` — "Request this support"
- `marketplace.requestContextLabel` — "What does your community need?"
- `marketplace.requestSent` — "Your request has been sent"
- `marketplace.usedBy` — "Used by {{count}} communities"
- `marketplace.recommendedBy` — "Recommended by {{recommend}} of {{total}} communities"
- `marketplace.conflictMessage` — "Your community has already requested this support."

### 6.5 Offline Behaviour

- Programme Offering catalogue is cached in IndexedDB, refreshed on connect
- Browsing the catalogue works fully offline with cached data
- Requests queue via the existing Outbox pattern (`src/lib/outbox.ts`) — the request is written to IndexedDB and synced when connectivity returns
- The UI shows an offline indicator when cached data is being displayed

---

## 7. CROSS-SPEC DEPENDENCIES

| Document | Section | Relevance |
|---|---|---|
| `docs/community-marketplace-spec-v1.0.md` | Sections 2–9 | Complete feature specification — naming architecture, card structure, request flow, data model, UX constraints |
| `docs/technical-architecture-v1.0.md` | Section 4.2 | API endpoint listing for marketplace routes |
| `src/db/schema/public/programme-offerings.ts` | — | Schema already exists from ORDER 003 |
| `src/db/schema/public/offering-engagements.ts` | — | Schema already exists from ORDER 003 |
| `src/db/schema/public/offering-endorsements.ts` | — | Schema already exists from ORDER 003 |
| `src/db/schema/public/grounders.ts` | — | Schema already exists from ORDER 003 |
| `src/lib/pillars.ts` | — | PILLAR_COLOURS — single source of colour truth |
| `src/lib/outbox.ts` | — | Existing offline outbox pattern for request queuing |

---

## 8. MILESTONES

| # | Milestone | Verification |
|---|---|---|
| 1 | `GET /marketplace/offerings` returns active offerings from verified Grounders, filterable by pillar and search | 200 with filtered results |
| 2 | `POST /marketplace/offerings/:id/request` creates an OfferingEngagement, rejects non-Steward users, prevents duplicate requests | 201 on success, 403 for non-Steward, 409 for duplicate |
| 3 | `POST /marketplace/offerings` creates a new offering (Grounder role only) | 201 with offering data |
| 4 | `GET /marketplace/requests` returns incoming requests for the Grounder's offerings | 200 with engagement list |
| 5 | `PATCH /marketplace/engagements/:id` accepts/declines/completes, Grounder-gated | Status transitions correctly |
| 6 | `POST /marketplace/engagements/:id/endorse` creates endorsement, Node Admin-gated, requires completed engagement | 201 on success |
| 7 | Marketplace UI: entry question → pillar grid → offering list with ProgrammeCards | Matches McCoy prototype |
| 8 | RequestForm: auto-prefilled community info + free-text context → confirmation | Successful POST, confirmation shown |
| 9 | GrounderRequests inbox: shows incoming requests with community name, context, status | Correct data, Grounder-gated |
| 10 | Offline: cached catalogue browsable offline; requests queue via Outbox | IndexedDB cache populated, outbox entry created |
| 11 | EN + AF copy renders for all marketplace strings | All keys in both locales |
| 12 | Bones verdict | PASS or CONDITIONAL PASS |
| 13 | Standup committed | OBRIEN_STANDUP.md updated |

**Definition of order complete:** All 13 milestones verified. Bones verdict obtained. O'Brien standup committed.

---

## 9. UHURA INTELLIGENCE REQUIRED

None for this order. The Community Marketplace operates entirely on internal platform data. Grounder verification is an existing process (Mission Brief Section 3.4), not something this order changes.

---

## 10. REPORTING BACK

**In OBRIEN_STANDUP.md:**
- What was built and where it lives
- Any deviations from this spec (with justification)
- What's blocked (if anything)

**Triggers a new Bridge session:**
- If the Grounder verification status field doesn't exist or has unexpected values in the seeded schema
- If the naming architecture constraint ("Grounder" never visible to community) creates a technical naming conflict in the codebase

**Can be decided without escalation:**
- Exact card layout within the approved visual pattern
- Whether to extract a shared `PillarGrid` component or adapt `PillarFilterRow`
- Minor copy adjustments that don't change emotional tone

---

## 11. SAREK ESCALATION CLAUSE

Default: not required for this order. The technical components (CRUD endpoints, card-based UI, request flow) are within standard engineering scope.

If O'Brien encounters an architectural tension between the community-facing naming constraint and the code-level naming (e.g. route paths, component names, API field names that unavoidably expose "Grounder"), escalate to Spock for naming architecture resolution — not Scotty. This is a design tension, not an engineering problem.

---

*CREW ORDER 008 — Community Marketplace*
*Issued by Spock, 2026-07-09. Approved by Captain.*
*Next: O'Brien reads and executes.*
