# ResilientSA — Crisis Roles Framework Specification
## Bridge Document | Version 1.0
*Makes Mission Brief Section 7 (Crisis Framework) buildable. Extends Mission Brief Sections 6.3, 7, and June Holley Integration Guide Section 6.*

---

## 1. Purpose and What This Closes

Mission Brief Section 7 establishes the Crisis Framework's philosophy — every gift has a crisis expression, roles are designed in peace and activated under pressure, the design process is a community workshop. What it does not provide: the data model, the actual workshop facilitation materials, the activation mechanics, or how this calibrates across the three Community Health States already defined in Section 6.3. This document closes that gap.

**Founding principle, sourced from June Holley Integration Guide Section 6.3:** Crisis roles are not new capacities invented for emergencies. They are the community's everyday capacities — to organise, to deepen equity, to cultivate leadership, to nurture networks, to provide mutual aid — expressed under pressure. This reframes the entire spec below: the platform is not building a separate "crisis system," it is building a pressure-tested view of the same gifts, relationships, and trust the platform already holds in normal operation.

This document is scoped to MVP-relevant groundwork plus the full Phase 2 design, consistent with the Technical Architecture Document's existing staging: MVP ships `CrisisMode` (simplified interface, Pillar 1–3 filter, resource map priority — already specced in Technical Architecture Section 3.5). The full Crisis Roster, the workshop, and anticipatory intelligence are Phase 2 (Mission Brief Section 11.3) — but the data model and workshop design are specified now so Phase 2 has no late discovery.

---

## 2. The Three-Tier Calibration, Made Concrete

Mission Brief Section 7.3 already states crisis role design differs by Community Health State (Section 6.3). This section makes each tier buildable.

### 2.1 State 1 — Generative: Full Roster

A node assessed as Generative (Mission Brief 6.3) runs the complete Crisis Roles Design Process (Mission Brief 7.4) — all seven steps, full gift-to-role mapping across all seven crisis role categories (Section 4 below), an annual table-top simulation, and the Crisis Roster recorded both in-platform and printed.

**Trigger for the workshop:** offered to the Node Admin once the node reaches a defined trade and connection maturity threshold — reusing the same readiness-signal pattern already established for the Cooperative Readiness Assessment (`docs/cooperative-formation-spec-v1.0.md` Section 3): months of active trade history, stable Cell Steward tenure, a ratified Value Charter. Not gated on a hard number — surfaced as a gentle, dismissible suggestion per the platform's existing intelligence principles (Mission Brief 4.5), never forced.

### 2.2 State 2 — Stressed: Core Roles Only

Per Mission Brief 7.3, a Stressed node gets a simplified design: core roles only, bi-annual check-ins rather than annual simulation, Regional Steward support during the workshop itself rather than the community running it unassisted.

**Core roles, by definition for this tier:** Provision Holders and Wellbeing Holders are mandatory (Pillars 1–3 dependencies — water, food, health — cannot be left unrostered in a Stressed node, since this is precisely the population most exposed if those pillars fail). Crisis Coordinators is mandatory (someone must hold the decision-making function). The remaining four categories (Sense Makers, Network Weavers in extremis, Infrastructure Responders, Community Anchors) are optional, added only if a clear gift exists and the community has appetite — not forced to complete the full set.

### 2.3 State 3 — Fragile: Micro-Network Only

Per Mission Brief 7.3, a Fragile node's crisis roles exist only within its micro-network (10–15 households, per the Pre-Onboarding Pathway, Mission Brief 6.4) and use physical protocols, not platform features — consistent with the broader principle that Fragile nodes are not yet introduced to the platform at all (Mission Brief 6.4).

**Concretely:** the Regional Steward, during Pre-Onboarding Phase 3 (Micro-network activation), facilitates an informal version of the workshop — one Provision Holder, one Wellbeing Holder, one Connector (the Fragile-tier name for the network-weaving function, deliberately not called "Network Weaver in extremis" at this tier — see Section 5.1 on tier-appropriate language). No `CrisisRoster` database row is created for a Fragile-tier micro-network; this lives entirely outside the platform, on paper, held by the Regional Steward, exactly as the Pre-Onboarding Pathway already specifies for all Fragile-tier activity.

---

## 3. The Crisis Roles Design Process — Workshop Materials

Mission Brief Section 7.4 lists seven steps. This section provides the actual facilitation content for each, written for delivery by a network-weaving Grounder (per June Holley Integration Guide Section 4) or a trained Cell Steward.

### 3.1 Step 1 — Gifts Review (Crisis Lens)

**Facilitation script, opening framing:** *"We're going to look at the gifts map your community already built — but today we ask a different question of each one. Not 'what does this gift do for us normally,' but 'what does this gift become when everything falls apart?'"*

This directly reuses the existing `GiftsProfile` data (Technical Architecture Document Section 3.1) — no new data collection step, only a reframing exercise applied to data the platform already holds. The facilitator works through the cell's Gifts Directory (Mission Brief 4.2) gift by gift, prompting the group to call out the crisis expression.

### 3.2 Step 2 — Crisis Scenario Mapping

Per Mission Brief 7.4, scenarios are specific to the community's actual likely failures, not generic disaster templates. Facilitation prompt set:

- "What has actually happened here before — load shedding, water cuts, flooding, unrest nearby?"
- "What's the thing people in this community worry about most, even if it hasn't happened yet?"
- "If [the most likely scenario named above] happened and lasted three days, what would we run out of first?"

The output is not a formal document — it is the shared mental model the rest of the workshop builds on.

### 3.3 Step 3 — Role Matching

Gifts are matched to the seven crisis role categories (Section 4 below) through discussion, not assignment — per Mission Brief 7.4's explicit instruction that this is consensus-based, not facilitator-imposed. The facilitator's only job is to ask, for each scenario from Step 2: "Whose gift addresses this?"

### 3.4 Step 4 — Gap Identification

Where no current gift fills a needed role, this is recorded — not as a failure, but as honest intelligence that triggers two existing platform mechanisms already specified elsewhere: a Programme Offering request (`docs/community-marketplace-spec-v1.0.md`) for relevant training, and a Knowledge Transfer prompt (Mission Brief 6.6) if a neighbouring node holds the missing skill.

### 3.5 Step 5 — Crisis Roster Creation

The output of Steps 1–4 is recorded as a `CrisisRoster` (data model, Section 6 below) and made available to the community in two forms simultaneously: in-platform (visible to the Cell Steward and Node Admin) and the quarterly printed Community Directory (Mission Brief 5.2's existing print mechanism extended to include the roster).

### 3.6 Step 6 — Simulation

A simple table-top exercise, not a live drill, within three months of roster creation. Facilitation format: the facilitator reads out the Step 2 scenario and asks each named role-holder, in turn, "What do you actually do, right now, in this situation?" The goal is surfacing gaps in the roster's logic before a real crisis does — per Mission Brief 7.4's existing language, this reveals gaps and tests roles in practice.

### 3.7 Step 7 — Annual Review

A `CrisisRoster` is versioned, not overwritten (data model, Section 6 below) — consistent with the same append-only design principle already used for `NetworkPhaseSnapshot` in the Technical Architecture Document (Section 3.4a), since both are records of how a community changes over time and that history has value.

---

## 4. The Seven Crisis Role Categories — Defined for Build

Mission Brief Section 7.2 names seven gift-category-to-crisis-role mappings. This section adds the detail needed to actually implement role assignment and the activation behaviour each role triggers.

| Gift Category | Crisis Role | Function | What Activation Grants Them (per Technical Architecture 4.3) |
|---|---|---|---|
| Practical & Technical | Infrastructure Responders | Keep water, energy, shelter, transport functioning | Priority visibility on Resource Map infrastructure entries |
| Care & Healing | Wellbeing Holders | Physical and psychological care | Priority routing of Health-pillar (Pillar 3) needs in the Needs Radar |
| Knowledge & Wisdom | Sense Makers | Clarity, communication, meaning-making under pressure | Community broadcast permission (Mission Brief 7.5) |
| Relational & Social | Network Weavers in extremis | Hold cohesion when things pull apart | Isolation monitoring alerts routed to them directly (Mission Brief 7.5) |
| Production & Provision | Provision Holders | Keep the community fed and supplied | Priority visibility on Food/Water (Pillar 1–2) Needs Radar entries |
| Organisation & Leadership | Crisis Coordinators | Coordinate complexity, decide under pressure | Crisis Mode activation/deactivation permission (Technical Architecture Section 4.2) |
| Spiritual & Cultural | Community Anchors | Maintain identity during sustained crisis | No platform permission — this role is intentionally unmediated by the platform, consistent with June Holley Integration Guide Section 5's framing of spiritual and cultural practice as "light work" that should not be instrumentalised |

**Design note on Community Anchors:** every other role grants a platform permission because the role has a concrete platform-mediated function. Community Anchors deliberately do not — their function (per Mission Brief 7.2, "maintain community identity") is not a platform task, and giving it a permission would risk exactly the kind of feature-creep into spiritual/cultural life the Mission Brief's calm technology principle (2.5) warns against. This role exists on the Crisis Roster for recognition and dignity, not for software permissions.

---

## 5. Tier-Appropriate Language

### 5.1 Why Fragile-Tier Roles Get Different Names

Per Section 2.3 above, a Fragile-tier micro-network uses "Connector" rather than "Network Weaver in extremis." This is a deliberate, sourced choice: communities in this tier are, by the Mission Brief's own Pre-Onboarding Pathway design (6.4), often trauma-saturated or rebuilding trust from very little. Introducing the platform's full crisis-role vocabulary at this stage risks the same "development theatre" alienation the Captain flagged explicitly in earlier Bridge sessions regarding Cape Town communities — full jargon before full trust is a trust-eroding move, not a neutral one. Plain, human language ("Connector," not a platform-specific term) is used until a community has graduated to State 2 or State 1.

---

## 6. Data Model (for O'Brien)

Extends Technical Architecture Document Section 3.5 (`CrisisMode`, already specced for MVP). New entities below are Phase 2, per Mission Brief 11.3 — specified now to avoid late discovery, not built in MVP.

```
CrisisRoster {
  id (uuid, pk)
  node_id (fk → Node)
  cell_id (fk → Cell, nullable — State 1 rosters are typically cell-level,
            State 2 may be node-level given simplified scope)
  health_state_at_creation (enum, snapshot of Mission Brief 6.3 state
            at the time this roster was created — health state can
            change after roster creation, this preserves what tier
            of design process produced it)
  version (integer, starts at 1)
  superseded_by (fk → CrisisRoster, nullable — append-only versioning,
            same pattern as NetworkPhaseSnapshot)
  created_at
  last_simulation_at (nullable — Step 6, table-top exercise date)
  next_review_due (date — annual per Step 7, or bi-annual for State 2)
}

CrisisRoleAssignment {
  id (uuid, pk)
  roster_id (fk → CrisisRoster)
  user_id (fk → User)
  role (enum: infrastructure_responder, wellbeing_holder, sense_maker,
        network_weaver_extremis, provision_holder, crisis_coordinator,
        community_anchor)
  gifts_profile_basis (fk → GiftsProfile, nullable — which gift this
        role was matched from, per Step 3, for traceability back to
        the original gifts mapping)
  assigned_at
}

CrisisRosterGap {
  id (uuid, pk)
  roster_id (fk → CrisisRoster)
  role (enum, same as above)
  identified_at
  resolved_at (nullable)
  resolution_type (enum: programme_offering_requested,
        knowledge_transfer_initiated, member_joined, nullable)
}
```

**Activation behaviour** (extends `CrisisMode`, Technical Architecture Section 3.5): when `CrisisMode.activated_at` is set, the API queries the node/cell's current (non-superseded) `CrisisRoster` and applies the permission grants from Section 4's table above to each assigned user for the duration of the crisis. If no `CrisisRoster` exists (State 2/3 nodes, or a State 1 node that hasn't yet run the workshop), `CrisisMode`'s existing MVP behaviour applies unchanged — simplified interface and Pillar 1–3 filter, with no role-specific permissions, since there is no roster to grant them from.

---

## 7. What This Spec Does Not Cover

- **Anticipatory intelligence** — see `docs/anticipatory-intelligence-spec-v1.0.md` which closes this gap.
- **SMS broadcast tooling for Sense Makers** (Mission Brief 7.5) — the permission is specced above (Section 4 table) but the actual broadcast mechanism (rate limiting, message templating, opt-out handling) extends the existing `NotificationLog` infrastructure (Technical Architecture Section 4.1a) and needs its own short addendum before O'Brien builds it.
- **The printed Crisis Roster format** — Section 3.5 references the existing quarterly print mechanism (Mission Brief 5.2) but the actual layout/template is a Bones Protocol-gated design task (per `CREW_MANIFEST.md`), not specified in this document.

---

*ResilientSA Crisis Roles Framework Specification v1.0 | Bridge Document | Extends Mission Brief Sections 6.3, 7 and June Holley Integration Guide Section 6 | For Engine Room Use*
