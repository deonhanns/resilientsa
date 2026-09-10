# CREW ORDER — 009a
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-009a
**Issued by:** Spock
**Assigned to:** O'Brien (executed directly by Spock, interim, 2026-09-10 — O'Brien out of credits since 2026-08-31)
**Status:** READY
**Date issued:** 2026-09-10
**Depends on:** CREW-ORDER-003 (schema), CREW-ORDER-004 (auth) ✅ COMPLETE
**Blocks:** CREW-ORDER-009 (Notifications/SMS invites) — invites are meaningless without a real node/cell to invite someone into

---

## 1. STRATEGIC CONTEXT

Discovered 2026-09-10, during the first session login actually worked end-to-end: **there is no product path anywhere in the codebase to create a Node, create a Cell, or assign anyone to the `node_admin` or `cell_steward` roles.** Every signup is hardcoded into one placeholder node (`00000000-...-0001`). Cells exist only via direct seed-script inserts. The `/admin` route is a literal unbuilt placeholder (`<div>Node Admin — Phase 2</div>`), not even auth-gated.

This is a gap in the platform's foundational architecture, not a missing feature at the edges. Every other order built so far — Trade Exchange, Steward Dashboard, Marketplace — assumes a real node and cell already exist. They've been testable only because of one-off seed scripts and, as of today, a temporary hand-built Vercel endpoint used once to manually assign a cell (see `OBRIEN_STANDUP.md`, 2026-09-10 pt.5). That's not sustainable past a single test user.

**The schema already anticipated this order.** `users.role` includes `regional_steward` and `node_admin` — both unused, sitting exactly where a real hierarchy belongs. `cells.stewardUserId` and `cells.stewardCompanionUserId` exist and are unused. `nodes.raCpfName` already ties a Node to an existing Resident Association or Community Policing Forum, matching the platform's founding principle of extending existing community structures rather than building parallel ones. Nobody has built the code that writes to any of these columns. This order does that.

**Role hierarchy this order establishes:**
```
regional_steward  →  creates Nodes, designates each Node's first node_admin
node_admin         →  (scoped to one node) creates Cells, promotes members to cell_steward
cell_steward       →  (scoped to one cell) — role and dashboard already exist (ORDER 007)
```

**Bootstrap:** nobody currently holds `regional_steward`. One person needs a one-time manual promotion to start the chain — the same category of bootstrap `grounder` needed before ORDER 008's schema fix (see §6.5).

---

## 2. MISSION OBJECTIVE

Build the Node Admin console: real Node creation (regional_steward), real Cell creation and member-to-cell assignment and Cell Steward promotion (node_admin) — replacing the `/admin` placeholder with a working, role-gated screen. Per Captain's direction (2026-09-10 bridge session):
- Member-to-cell assignment: **admin-assigns via a real UI now**, replacing today's manual/temp-endpoint approach. SMS invite-links that carry a node/cell token are explicitly deferred to CREW-ORDER-009 proper, once AT sender-ID registration is complete.
- Node creation: **gets a real UI now**, even though only one Node (Delft/Mzansi Digital) will exist for a while — Captain's call, worth the investment.
- Cell Steward promotion: **self-serve by node_admin** via the UI, not a manual/Spock-approved action.

---

## 3. BONES BRIEF

**No McCoy prototype exists for this screen** — unlike every prior order, there's no `design/prototype-v1/` reference to build against. This is genuinely new UI. Flag explicitly: this order's Bones review is necessarily a from-scratch judgment call against the Living Soil design system and the platform's established tone, not a fidelity check against an approved mock. A real Bones pass (ideally with an actual prototype sketch first) is even more warranted here than usual before this ships to Delft.

**Who will encounter this:** A `regional_steward` (in the pilot: Spock/Captain acting in a platform-operator capacity, or eventually a small regional coordination role) and `node_admin`s (institutional staff — e.g. a Mzansi Digital coordinator — not general community members). This is the one UI in the platform whose primary user is *not* a Delft resident. It's closer to an operational tool for a trusted partner than a community-facing screen.

**Emotional target:** "I can see exactly who's in my community and set up the structure to support them — without needing anyone else to do it for me." Capable and clear, not corporate. Still warm — this is Ubuntu-philosophy infrastructure being stood up, not a SaaS admin panel — but it's allowed to look more like a working tool and less like a community screen, because the person using it has a different relationship to the platform than a Cell member does.

**Guardrails carried over from the Steward Dashboard brief (ORDER 007), since the tone family is related:**
- No raw "Admin Panel" or "Dashboard" heading language — name the screen after what it does ("Your communities," "Set up a cell") not what it is administratively.
- Role-gate message for non-admins hitting `/admin` follows the same warm pattern as `/steward`'s `RoleGateMessage` (ORDER 007, built 2026-09-10) — not a 403 page.
- No "manage" framing for Cell Steward promotion — a node_admin is recognising someone's role in the community, not administering staff.

---

## 4. WORF BRIEF

**This is the highest-privilege-escalation surface built in the platform to date.** Every prior role gate (steward, grounder) checked an existing role; this order is the first to *grant* roles and move users between nodes. Extra scrutiny warranted:

- `POST /api/admin/nodes` — `regional_steward` only. Creates a Node and, in the same request, promotes a specified existing user to `node_admin` for that Node (moving their `nodeId`). Must validate the target user exists and is not already a `node_admin` elsewhere before mutating.
- `POST /api/admin/cells` — `node_admin` only. `nodeId` taken from session, never from the request body — same injection-safety pattern already established in `listings`, `matches`, `marketplace`.
- `PATCH /api/admin/members/:userId/cell` — `node_admin` only. Target user must belong to the caller's own node (checked server-side, not trusted from the client) — a node_admin must never be able to reassign a member in a different node.
- `PATCH /api/admin/members/:userId/role` — `node_admin` only, and only permits promoting to/demoting from `cell_steward` — explicitly must not allow granting `node_admin`, `regional_steward`, or `grounder` through this route. Same cross-node ownership check as above.
- The bootstrap step (§6.5) that grants the first `regional_steward` is the one action in this entire order that cannot go through a normal authenticated route (nobody holds the role yet to authorize it). It must be a narrow, single-purpose, token-gated, immediately-deleted action — same pattern used for today's temp cell-assignment endpoint — never a standing "become admin" route.
- `/admin` in `App.tsx` currently has **no** `ProtectedRoute` wrapper at all — not even auth-gated, just a static div. This must be fixed as part of this order regardless of anything else, independent of severity — an unguarded route is worth flagging even though today it renders nothing sensitive.

---

## 5. DESIGN SYSTEM REFERENCE

None available (see Bones Brief above — no prototype exists). Build from `src/lib/pillars.ts` tokens, the Living Soil CSS variables already in use throughout the app (`--surface-card`, `--border-hairline`, `--action-primary`, `--text-primary`/`--text-secondary`/`--text-muted`), and the visual conventions already established in `StewardDashboard.tsx` (card-based sections, role-gate pattern, ochre for attention-without-alarm) for consistency within the "operational" screen family.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 Schema

One small additive migration:

```sql
ALTER TABLE nodes ADD COLUMN created_by uuid REFERENCES users(id);
```

`nodes.createdBy` — records which `regional_steward` created the node, for accountability. Nullable (existing placeholder node has no creator). No other schema changes needed — `cells.stewardUserId`, `cells.stewardCompanionUserId`, `users.role`, `users.cellId`, `users.invitedBy` all already exist and are simply unused until this order.

### 6.2 Backend — API Routes

New consolidated catch-all, following the established function-count-conservation pattern (Vercel Hobby 12-function limit; currently at 7, this adds 1 → 8):

```typescript
// api/admin/[...path].ts
//
// GET  /api/admin/nodes                    — list nodes (regional_steward: all; node_admin: own node only)
// POST /api/admin/nodes                    — create node + promote initial node_admin (regional_steward only)
// GET  /api/admin/cells                    — list cells in caller's node (node_admin only)
// POST /api/admin/cells                    — create cell in caller's node (node_admin only)
// GET  /api/admin/members                  — list caller's node's members, both cell-assigned and unassigned (node_admin only)
// PATCH /api/admin/members/:userId/cell    — assign/reassign a member to a cell within caller's node (node_admin only)
// PATCH /api/admin/members/:userId/role    — promote to/demote from cell_steward within caller's node (node_admin only)
```

#### 6.2.1 POST /api/admin/nodes

```typescript
// Body: { name: string, raCpfName?: string, initialAdminUserId: string }
// Auth: regional_steward only
//
// Server logic:
// 1. Validate initialAdminUserId exists and is not already node_admin/regional_steward elsewhere
// 2. INSERT INTO nodes (name, ra_cpf_name, created_by) VALUES (...)
// 3. UPDATE users SET node_id = <new node id>, role = 'node_admin', cell_id = NULL
//    WHERE id = initialAdminUserId
//    (cell_id cleared — the promoted user starts fresh in the new node with no cell yet;
//    a node_admin doesn't need to be a member of a cell to do their job)
// 4. Return { nodeId, adminUserId }
```

#### 6.2.2 POST /api/admin/cells

```typescript
// Body: { name: string }
// Auth: node_admin only. node_id from session, never from body.
// INSERT INTO cells (node_id, name) VALUES (session.nodeId, body.name)
// Return { cellId }
```

#### 6.2.3 GET /api/admin/members

```typescript
// Auth: node_admin only.
// Returns all users where node_id = session.nodeId, with cell_id, role, display_name.
// Frontend splits into "Unassigned" (cell_id IS NULL) and grouped-by-cell sections.
```

#### 6.2.4 PATCH /api/admin/members/:userId/cell

```typescript
// Body: { cellId: string }
// Auth: node_admin only.
// Validate: target user's node_id === session.nodeId (reject cross-node reassignment — 403).
// Validate: cellId belongs to session.nodeId.
// UPDATE users SET cell_id = :cellId WHERE id = :userId
```

#### 6.2.5 PATCH /api/admin/members/:userId/role

```typescript
// Body: { role: 'cell_steward' | 'member' }
// Auth: node_admin only. Only these two values accepted — reject anything else with 400,
// explicitly never 'node_admin'/'regional_steward'/'grounder' through this route.
// Validate: target user's node_id === session.nodeId.
// UPDATE users SET role = :role WHERE id = :userId
// If role = 'cell_steward': also UPDATE cells SET steward_user_id = :userId WHERE id = <user's current cell_id>
// If role = 'member' (demotion): also clear cells.steward_user_id if it currently points to this user
```

### 6.3 Frontend

`src/components/admin/NodeAdmin.tsx` — single screen, sectioned by role:
- If `regional_steward`: "Your nodes" list + "Create a node" form (name, RA/CPF name, and a member picker/search to designate the initial node_admin by phone number or existing display name)
- If `node_admin`: "Your cells" list + "Create a cell" form (name only) + "Unassigned members" list with a cell-picker per member + per-cell member lists with a "Make Cell Steward" action
- If neither: `RoleGateMessage` (reuse the component built for ORDER 007, same warm-message pattern), not a 403 page

`src/lib/api.ts` — new `adminApi` export: `listNodes`, `createNode`, `listCells`, `createCell`, `listMembers`, `assignCell`, `setMemberRole`.

`src/lib/types.ts` — new types: `AdminNode`, `AdminCell`, `AdminMember`.

### 6.4 Routing

```typescript
// src/App.tsx
<Route path="/admin" element={<ProtectedRoute><AppShell><NodeAdmin /></AppShell></ProtectedRoute>} />
```

Replaces the current unguarded static div. Role-gating happens inside `NodeAdmin.tsx` (403 → `RoleGateMessage`), same pattern as `/steward`.

### 6.5 Bootstrap — granting the first `regional_steward`

No route can do this (nobody holds the authorizing role yet). Options, in order of preference:
1. **Preferred:** Captain/O'Brien runs a one-off script locally with a real `DATABASE_URL` (`scripts/bootstrap-regional-steward.ts`, following the `assign-cell.ts`/`seed-grounder.ts` convention — explicit required CLI argument for the target user id, no defaults).
2. **If needed immediately in a bridge session without local access:** the same narrow, token-gated, single-operation temporary Vercel endpoint pattern used in `OBRIEN_STANDUP.md` 2026-09-10 pt.5 — created, called once, deleted in the next commit, confirmed 404 afterward. Not a standing route under any circumstances.

### 6.6 i18n

`en.json`/`af.json` (af as English fallback, matching the established pattern for internal-facing screens):
- `admin.nodesHeading` — "Your nodes"
- `admin.createNodeHeading` — "Create a node"
- `admin.cellsHeading` — "Your cells"
- `admin.createCellHeading` — "Create a cell"
- `admin.unassignedHeading` — "Not yet in a cell"
- `admin.makeSteward` — "Make Cell Steward"
- `admin.roleGateMessage` — "This area is for Node and Regional coordination."

---

## 7. CROSS-SPEC DEPENDENCIES

| Document | Section | Relevance |
|---|---|---|
| `src/db/schema/public/nodes.ts` | — | `raCpfName` already ties Nodes to existing community structures — this order activates it |
| `src/db/schema/public/cells.ts` | — | `stewardUserId`/`stewardCompanionUserId` already exist — this order activates them |
| `src/db/schema/public/users.ts` | — | `role` enum, `invitedBy` — this order activates the unused hierarchy tiers |
| `OBRIEN_STANDUP.md` | 2026-09-10 pt.5 | The temp-endpoint pattern this order's bootstrap step reuses, and the manual cellId assignment this order's UI replaces |
| `resilientsa-app/api/steward/[...path].ts` | — | `RoleGateMessage` pattern (ORDER 007, 2026-09-10) reused for `/admin`'s non-admin visitors |
| CREW-ORDER-009 (not yet written) | — | Depends on this order — SMS invite-links need a real node/cell to assign into |

---

## 8. MILESTONES

| # | Milestone | Verification |
|---|---|---|
| 1 | Migration: `nodes.created_by` added, purely additive | Confirmed via build/migration review |
| 2 | `POST /api/admin/nodes` creates node + promotes designated user to node_admin, regional_steward-gated | 201 for regional_steward, 403 for others |
| 3 | `POST /api/admin/cells` creates cell scoped to caller's node, node_admin-gated | 201 for node_admin, 403 for others |
| 4 | `PATCH /api/admin/members/:userId/cell` assigns member to cell, rejects cross-node targets | 200 same-node, 403 cross-node |
| 5 | `PATCH /api/admin/members/:userId/role` promotes/demotes cell_steward only, rejects other role values | 200 for cell_steward/member, 400 for anything else |
| 6 | `NodeAdmin.tsx` renders correctly for regional_steward, node_admin, and neither (RoleGateMessage) | All three states verified |
| 7 | `/admin` route now wrapped in `ProtectedRoute` + `AppShell` | No longer an unguarded static div |
| 8 | `npm run build` — zero errors | Verified against a fresh clone |
| 9 | Bones review — no prototype exists, so this is a from-scratch judgment call, not a fidelity check | PASS/CONDITIONAL PASS/NEEDS REVISION, documented in `BONES_VERDICT.md` |
| 10 | Bootstrap: one user promoted to `regional_steward` | Confirmed via the promoted user successfully creating a node |
| 11 | Standup committed | `OBRIEN_STANDUP.md` updated |

**Definition of order complete:** All 11 milestones verified.

---

## 9. UHURA INTELLIGENCE REQUIRED

None. Internal platform-data only.

---

## 10. REPORTING BACK

**Triggers a new Bridge session:** if the bootstrap step's temp-endpoint pattern needs to be reused more than once — at that point it should graduate into a real, permanently-authenticated admin route rather than staying a recurring one-off (flagged in `OBRIEN_STANDUP.md` 2026-09-10 pt.5 as exactly this concern).

**Can be decided without escalation:** exact layout of `NodeAdmin.tsx`'s sections; whether member search in the "create node" flow is by phone number or display name.

---

## 11. SAREK ESCALATION CLAUSE

Not required by default. If the role-escalation validation logic (§6.2, cross-node checks) proves genuinely ambiguous against real Delft onboarding data, escalate to Scotty.

---

*CREW ORDER 009a — Node & Cell Formation*
*Issued by Spock, 2026-09-10. Approved by Captain (design decisions confirmed via bridge session same day).*
*Next: executed directly by Spock this session, per Captain's "let's complete order 009a now."*
