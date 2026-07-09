# CREW ORDER — 007
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-007
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY — awaiting O'Brien
**Date issued:** 2026-07-09
**Depends on:** CREW-ORDER-006 ✅ COMPLETE
**Parallel with:** CREW-ORDER-008 (different surface, minimal overlap)

---

## 1. STRATEGIC CONTEXT

The Cell Steward is the load-bearing human role in the ResilientSA architecture. The Steward transforms the platform from a database of listings into a living network. Everything O'Brien has built so far — auth, gifts profiles, trade exchange — generates data that the Steward needs to see in one coherent view.

This order builds that view.

The Steward Dashboard is not an admin panel. It is a situation room. It tells the Steward: who in my cell is connected, who is isolated, where the unmet needs are clustering, and whether the network is becoming more or less resilient. It surfaces what June Holley calls "network health" — not raw graph data, but actionable, plain-language signals.

The McCoy-approved prototype at `design/prototype-v1/ui_kits/resilientsa-app/StewardDashboard.jsx` defines the visual contract. O'Brien builds the production implementation from it.

**Parallel order note:** ORDER 008 (Community Marketplace) depends only on ORDER 006 and has minimal code overlap with ORDER 007 — different API routes, different components, different data models. Both can proceed independently.

---

## 2. MISSION OBJECTIVE

Build the Cell Steward Dashboard — needs radar, member list with status flags, network health summary, isolate/hub detection, offline trade logging, and nightly batch jobs for network phase snapshots and internal forecasts — matching the Bones-approved prototype design.

---

## 3. BONES BRIEF

**Bones review required** — this is the Steward's primary working surface and their daily operational tool.

**What is being reviewed:** Cell Steward Dashboard screen — needs radar, member list, network summary, isolate flags.

**Who will encounter this:** A Cell Steward — a community member who has volunteered to connect people. They may be stretched, time-poor, and not technically sophisticated. The dashboard must feel like a companion, not a control panel.

**Emotional target:** "I know what's happening in my cell right now. I can see who needs connecting. I'm not alone in this."

**Visual spec — mandatory, from Bones-approved prototype:**

From `design/prototype-v1/ui_kits/resilientsa-app/StewardDashboard.jsx`:

- **NetworkSummary** card at top: trend indicator (↑/↓ arrow with direction), plain-language phase message ("Your cell's connections are growing — 8 new connections this week"), and a single stat
- **Needs Radar:** circular/radial display of unmet needs by pillar. Each pillar area is sized relative to need volume. Tap a pillar to filter. The visual must communicate urgency without numbers — larger, ringed circles demand attention. Colours per `src/lib/pillars.ts` PILLAR_COLOURS
- **Member list:** ordered by status — isolates first, then quiet, then active. Each `MemberRow` shows: name, recent activity indicator, pillar tags for their gifts, status badge. No raw data dumps
- **Isolate badge:** ochre-tinted pill showing count of members "out of touch" — warmth, not alarm. The language is "X members out of touch" not "X isolates detected"
- **"Where the need is"** heading — conversational, not clinical
- **Tap feedback:** when a Steward taps a pillar area on the needs radar, display the pillar tag and count. Inform, don't alarm

**Anti-patterns to avoid:**
- No "dashboard" language anywhere in the UI — the heading is the Steward's cell name, not "Dashboard"
- No raw numbers without context — every stat has a plain-language interpretation
- No red/alert colours for isolate flags — ochre (warm, attention-getting without alarm) per prototype
- No graph visualisations — the NetworkSummary is a text summary, not a node-link diagram. This is per the build roadmap and June Holley guide: plain-language phase summaries only
- No "manage" or "administer" framing — the Steward connects people, they don't manage a system

**Brand references:** All pillar colours from `src/lib/pillars.ts`. PILLAR_COLOURS is the single source of colour truth.

---

## 4. WORF BRIEF

No new PII in this order. The dashboard surfaces aggregate cell data — member names (already stored, already encrypted), listing counts, network phase metrics. Worf review is not required, but O'Brien must confirm:

- Dashboard queries respect RLS context — a Steward can only see their own cell's data
- `GET /steward/dashboard/:cell_id` validates that `req.userId` belongs to the requested cell and holds `role === 'cell_steward'` or `role === 'node_admin'`
- No member PII (phone numbers, encrypted fields) is returned in dashboard responses — names and gifts profile data only
- The network summary never exposes individual member-level connection data — it is aggregate-only
- No individual member data from one cell is visible to a Steward of another cell

---

## 5. DESIGN SYSTEM REFERENCE

`design/prototype-v1/ui_kits/resilientsa-app/StewardDashboard.jsx` — McCoy's approved component. Read it before writing any dashboard component.

`design/prototype-v1/components/data/NetworkSummary.jsx` — the network summary card pattern.

`design/prototype-v1/components/data/MemberRow.jsx` — the member list row pattern.

`design/prototype-v1/components/data/NeedsRadar.jsx` — the needs radar visualisation.

The component structure, state management, and UI copy patterns are all in these files. O'Brien re-implements in the production React/TypeScript project — faithful to the approved design, not copy-paste.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 Backend — API Routes

Add `server/routes/steward.ts` with all five routes below. All routes require `role === 'cell_steward'` or `role === 'node_admin'`. All use `withRLSContext`.

```typescript
// GET /steward/dashboard/:cell_id
//   Returns: { members, needsRadar, recentActivity, reciprocityFlags }
//
// GET /steward/isolates/:cell_id
//   Returns: { isolates: Member[], count, lastChecked }
//
// GET /steward/hubs/:cell_id
//   Returns: { hubs: HubMember[], burnoutRisk }
//
// GET /steward/network-summary/:cell_id
//   Returns: { phase, trend, message, stat, lastUpdated }
//
// POST /steward/log-offline-trade
//   Body: { cellId, description, pillar, parties, date }
//   Creates: Listing (status: completed) + TradeCompletion + ConnectionEvents
//   Purpose: Steward records a trade that happened offline/face-to-face
```

#### 6.1.1 GET /steward/dashboard/:cell_id

```typescript
// Response shape:
{
  members: MemberRow[],        // ordered: isolates → quiet → active
  needsRadar: {                // aggregated from open listings grouped by pillar
    [pillar: string]: number   // count of open "needing" listings per pillar
  },
  recentActivity: {            // last 7 days
    newListings: number,
    completedTrades: number,
    newConnections: number
  },
  reciprocityFlags: {          // members whose giving/receiving ratio is significantly imbalanced
    memberId: string,
    name: string,
    direction: 'giving' | 'receiving',  // which side dominates
    ratio: number
  }[]
}

// Query logic:
// members: SELECT id, display_name, gifts_profile, 
//          (SELECT COUNT(*) FROM connection_events WHERE user_id = u.id AND created_at > NOW() - INTERVAL '30 days') as recent_connections
//          FROM users u WHERE u.cell_id = :cellId
//          ORDER BY recent_connections ASC (isolates first)
// 
// needsRadar: SELECT pillar, COUNT(*) FROM listings 
//             WHERE cell_id = :cellId AND type = 'needing' AND status = 'open'
//             GROUP BY pillar
//
// recentActivity: aggregated counts from listings, trade_completions, connection_events
//   filtered to cell_id and last 7 days
//
// reciprocityFlags: compare each member's listing counts (offering vs needing)
//   and trade_completion participation counts.
//   Flag when offering_count > (needing_count * 3) OR needing_count > (offering_count * 3)
//   with a minimum threshold of 3 total interactions to avoid false flags on new members
```

#### 6.1.2 GET /steward/isolates/:cell_id

```typescript
// Response:
{
  isolates: {
    id: string,
    displayName: string,
    lastActive: string | null,    // ISO date of last connection event, or null
    daysSinceLastConnection: number,
    giftsProfile: { lovesToDo: string, caresDeeplyAbout: string } | null
  }[],
  count: number,
  lastChecked: string             // ISO timestamp of this query
}

// Query logic:
// Users in the cell with zero ConnectionEvent rows in the last 30 days,
// OR users who have never had a ConnectionEvent at all.
// ORDER BY daysSinceLastConnection DESC (longest-isolated first).
```

#### 6.1.3 GET /steward/hubs/:cell_id

```typescript
// Response:
{
  hubs: {
    id: string,
    displayName: string,
    connectionCount: number,      // unique users connected to in last 30 days
    risk: 'none' | 'attention' | 'concern'
  }[],
  burnoutRisk: boolean            // true if the Steward themselves is flagged as a hub
}

// Query logic:
// Members whose ConnectionEvent count (as either user_a or user_b) in the last 30 days
// exceeds the cell median by 2x → risk: 'attention'
// exceeds the cell median by 3x → risk: 'concern'
// "Hub" in this context means: a member who everyone connects through (hub-and-spoke pattern).
// Per June Holley, this is an early-stage network pattern that needs gentle nudging 
// toward multi-hub — not a problem to "fix."
//
// Steward Companion depletion signal (per Mission Brief Section 3.2):
// If the Steward's own connection count exceeds median by 2x, set burnoutRisk: true.
// This is surfaced in the dashboard as a gentle nudge, not an alert.
```

#### 6.1.4 GET /steward/network-summary/:cell_id

```typescript
// Response:
{
  phase: 'scattered' | 'hub-and-spoke' | 'multi-hub' | 'core-periphery',
  trend: 'growing' | 'stable' | 'declining',
  message: string,               // plain-language, one sentence
  stat: string,                  // single supporting stat, e.g. "12 connections this month"
  lastUpdated: string
}

// Phase determination (June Holley / Krebs & Holley four-phase model):
// 
// scattered: median connections per member < 2, no member has > 5 connections
// hub-and-spoke: 1-3 members have > 5 connections, most others < 2
// multi-hub: 4+ members have > 3 connections, median > 2
// core-periphery: clear density cluster (top quartile has > 5 connections each) 
//                 AND a tail of low-connection members (bottom quartile < 2)
//
// Trend: compare current connection count to 30 days ago.
//   > 20% increase → growing, < 20% decrease → declining, otherwise → stable
//
// message: generated from phase + trend. Examples:
//   "Your cell is just getting started — most members haven't connected yet."
//   "A few members are connecting everyone — try introducing people who haven't met."
//   "Your cell's connections are growing — 8 new connections this week."
//   "Your network is dense and distributed — the connections are making themselves."
//
// THIS IS NOT A GRAPH. No node-link visualisation. No raw adjacency data.
// This endpoint returns a text summary only, matching the NetworkSummary component.
```

#### 6.1.5 POST /steward/log-offline-trade

```typescript
// Request body:
{
  cellId: string,
  description: string,
  pillar: Pillar,
  offeringParty: string,       // user ID of the person providing
  needingParty: string,        // user ID of the person receiving
  date: string                 // ISO date when the trade happened
}

// Server logic:
// 1. Create a Listing with status: 'completed', type: 'offering', 
//    pillar, and description (the Steward's summary of what was traded).
// 2. Create a TradeCompletion referencing that listing and both parties.
// 3. Create two ConnectionEvents (bidirectional):
//    - user_a: offeringParty, user_b: needingParty, event_type: 'trade_completed'
//    - user_a: needingParty, user_b: offeringParty, event_type: 'trade_completed'
// 4. Return { listingId, tradeCompletionId }
//
// Purpose: Many trades in a community setting happen face-to-face without touching 
// the app. The Steward needs a way to log these so the network health metrics 
// (ConnectionEvents, NetworkPhaseSnapshots) reflect reality, not just in-app activity.
```

### 6.2 Frontend — Components

Create `src/components/steward-dashboard/` with these components:

```
StewardDashboard.tsx    — main screen, role-gated, fetches /dashboard/:cellId
NeedsRadar.tsx          — pillar-based needs visualisation (circular/radial)
MemberRow.tsx           — single member row with status badge, pillar tags, activity
NetworkSummary.tsx      — phase message + trend + stat card
IsolateList.tsx         — filtered view of isolated members
HubList.tsx             — filtered view of hub members
LogOfflineTrade.tsx     — simple form for logging face-to-face trades
```

**Building from the prototype:** The McCoy prototype (`StewardDashboard.jsx`) uses the DS design system bundle. O'Brien re-implements each visual element using the project's existing Tailwind v4 token system, `src/lib/pillars.ts` constants, and existing shared components where applicable (e.g. `PillarFilterRow` from ORDER 006 can be reused).

**Key implementation notes:**
- The NeedsRadar can be implemented as a set of six circular indicators arranged radially, each sized proportionally to need count. It does not need to be a canvas/SVG chart — CSS circles with dynamic sizing are sufficient and match the prototype's approach.
- MemberRow reuses pillar colour tokens from `src/lib/pillars.ts` — never hardcoded.
- NetworkSummary renders text from the API response directly — no computation on the client.
- The "Tap an area" instruction on NeedsRadar should use the `t()` i18n function.

### 6.3 Routing

Add to `src/App.tsx`:

```
/steward → StewardDashboard (ProtectedRoute, role-gated: cell_steward or node_admin)
```

The Steward navigates to this from the bottom nav. If a non-Steward navigates to `/steward`, they see a warm "This area is for your Cell Steward" message — not a 403 error page.

### 6.4 i18n

All dashboard UI copy externalised to `en.json` and `af.json`. At minimum:

- `steward.needsHeading` — "Where the need is"
- `steward.membersHeading` — "Your members"
- `steward.isolatesBadge` — "{{count}} out of touch"
- `steward.needsInstruction` — "Tap an area to see what's unmet"
- `steward.logTradeHeading` — "Log a trade"
- `steward.emptyState` — warm message when cell has no members yet
- `steward.roleGateMessage` — "This area is for your Cell Steward"
- `steward.burnoutNudge` — gentle message when Steward is flagged as a hub

### 6.5 Batch Jobs

Create `server/jobs/` directory with a nightly runner.

#### 6.5.1 NetworkPhaseSnapshot computation

Runs nightly (or on-demand when the Steward views the dashboard and the last snapshot is > 24 hours old).

```typescript
// For each active cell:
// 1. Count total members
// 2. Count total ConnectionEvents in last 30 days
// 3. Compute connection distribution: per-member connection count
// 4. Determine phase using the logic from 6.1.4 above
// 5. INSERT INTO network_phase_snapshots (cell_id, phase, member_count, 
//    connection_count, median_connections, isolate_count, hub_count, computed_at)
//
// Table already exists: src/db/schema/public/network-phase-snapshots.ts
```

#### 6.5.2 InternalForecast computation

```typescript
// For each active cell:
// 1. Review listing trends: offering/needing ratio shift over last 14 days
// 2. Review connection event velocity: rate of new connections vs previous period
// 3. Review crisis mode status
// 4. Produce a simple forecast: 'improving' | 'stable' | 'needs_attention' | 'crisis_likely'
// 5. INSERT INTO internal_forecasts (cell_id, forecast, confidence, 
//    signals_summary, computed_at)
//
// Table already exists: src/db/schema/public/internal-forecasts.ts
//
// Signal summaries are plain-language strings for Steward consumption:
//   "More people are asking for things than offering — this may signal growing strain"
//   "Connection rate is increasing — the network is activating"
//
// Confidence is a simple heuristic:
//   > 50 total listings + connections → 'medium'
//   > 100 → 'high'
//   < 50 → 'low'
```

**Batch runner:** Create `server/jobs/runner.ts` that can be invoked via:
- A simple `npm run jobs:nightly` script using `tsx server/jobs/runner.ts`
- Or triggered by the dashboard endpoint if the last snapshot is stale (> 24 hours)

For MVP, the on-demand trigger from the dashboard view is sufficient. A proper cron/scheduler is Phase 2.

---

## 7. CROSS-SPEC DEPENDENCIES

| Document | Section | Relevance |
|---|---|---|
| `docs/technical-architecture-v1.0.md` | Section 4.3 | API endpoint definitions for steward routes |
| `docs/technical-architecture-v1.0.md` | Section 3.4a | NetworkPhaseSnapshot and InternalForecast schema |
| `docs/june-holley-integration-guide-v1.0.md` | Section 4a | Four-phase network topology model (Krebs & Holley) |
| `docs/june-holley-integration-guide-v1.0.md` | Section 3.2 | Gifts mapping → connection surfacing |
| `CREW_ORDER-006.md` | Section 6.1.4 | ConnectionEvent generation from trade completions — this order depends on those events existing |
| `src/db/schema/public/connection-events.ts` | — | Schema already exists from ORDER 003 |
| `src/db/schema/public/network-phase-snapshots.ts` | — | Schema already exists from ORDER 003 |
| `src/db/schema/public/internal-forecasts.ts` | — | Schema already exists from ORDER 003 |

---

## 8. MILESTONES

| # | Milestone | Verification |
|---|---|---|
| 1 | `GET /steward/dashboard/:cell_id` returns member list + needs radar + activity + reciprocity flags | 200 with populated response for a test cell |
| 2 | `GET /steward/isolates/:cell_id` returns members with no recent connections, ordered by isolation duration | Correct ordering, correct 30-day window |
| 3 | `GET /steward/hubs/:cell_id` returns high-connection members with risk level and burnout flag | Correct median calculation, Steward self-check |
| 4 | `GET /steward/network-summary/:cell_id` returns phase + trend + plain-language message | Correct phase detection against test data |
| 5 | `POST /steward/log-offline-trade` creates listing + trade completion + bidirectional connection events | All three DB writes in transaction |
| 6 | StewardDashboard UI renders — needs radar, member list (sorted), network summary card, isolate badge | Matches McCoy prototype visual contract |
| 7 | Role gate: non-Steward sees warm rejection message at `/steward` | Not a 403 error page |
| 8 | Isolate list filtered view accessible from dashboard | Shows only isolated members with days-since-last-connection |
| 9 | EN + AF copy renders for all dashboard strings | All keys in both locales |
| 10 | Nightly batch: NetworkPhaseSnapshot and InternalForecast generated for test cell | Rows inserted, phase correctly determined |
| 11 | Bones verdict | PASS or CONDITIONAL PASS |
| 12 | Standup committed | OBRIEN_STANDUP.md updated |

**Definition of order complete:** All 12 milestones verified. Bones verdict obtained. O'Brien standup committed.

---

## 9. UHURA INTELLIGENCE REQUIRED

None for this order. The Steward Dashboard operates entirely on internal platform data — no external regulatory or sector intelligence needed.

---

## 10. REPORTING BACK

**In OBRIEN_STANDUP.md:**
- What was built and where it lives
- Any deviations from this spec (with justification)
- What's blocked (if anything)

**Triggers a new Bridge session:**
- If the NeedsRadar visualisation proves technically challenging and requires design compromise
- If the network phase detection logic produces unexpected results against real data

**Can be decided without escalation:**
- Exact CSS implementation of the NeedsRadar (as long as it matches the prototype's visual intent)
- Minor copy adjustments that don't change the emotional tone

---

## 11. SAREK ESCALATION CLAUSE

Default: not required for this order. The technical components (aggregation queries, phase detection logic, visual components) are within standard engineering scope.

If the network phase detection produces consistently wrong classifications against real cell data and O'Brien cannot tune the heuristics after 3 attempts, escalate to Scotty per standard engineering escalation chain.

---

*CREW ORDER 007 — Cell Steward Dashboard + Batch Jobs*
*Issued by Spock, 2026-07-09. Approved by Captain.*
*Next: O'Brien reads and executes.*
