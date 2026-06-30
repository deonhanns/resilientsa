# ResilientSA — Pillar Integration Reference
## Bridge Document | Version 1.0
*The authoritative definition of the Six Pillars and how every system entity maps to them. This is the single source of pillar truth for all specs, all code, and all intelligence functions.*

---

## 1. Purpose

The Six Pillars are not a categorisation scheme bolted onto ResilientSA — they are its organising spine. Every trade listing, every signal, every forecast, every crisis role, every programme offering, every alert, and every network health observation maps back to one or more pillars. This document makes that mapping explicit, computable, and consistent across every layer of the platform.

**The governing rule:** if an entity, event, or signal cannot be mapped to at least one of the Six Pillars, it does not belong in the platform's core data model or intelligence layer. The pillars define the platform's scope, not just its UI categories.

---

## 2. The Six Pillars — Authoritative Definitions

Scope definitions matter because ambiguity at the boundary (is firewood Energy or Food?) creates inconsistency in listings, signal mapping, and crisis role assignment. These definitions are the tiebreakers.

### Pillar 1 — Water
**Scope:** Anything relating to the provision, storage, conservation, purification, or distribution of water for drinking, sanitation, cooking, or basic hygiene.

**Includes:** Drinking water access, boreholes, rainwater harvesting, water storage (tanks, containers), sanitation and greywater systems, water purification knowledge, irrigation for subsistence food production (shared with Pillar 2), river/spring/borehole knowledge.

**Does not include:** Large-scale commercial irrigation (out of scope), water used purely for energy generation (mapped to Pillar 5 instead if relevant).

**Pillar colour:** Rainwater Blue `#3D6B8C`
**Crisis decommodification:** Yes — Pillar 1 is in the Pillars 1–3 protected group. In crisis mode, water cannot be withheld pending trade.
**Crisis priority:** 1 (highest)

---

### Pillar 2 — Food
**Scope:** Anything relating to the production, preservation, preparation, distribution, or nutritional sufficiency of food.

**Includes:** Staple food items, fresh produce, seeds and seedlings, food gardens, traditional farming knowledge, food preservation techniques (drying, fermenting, pickling), cooking skills and fuel for cooking (shared with Pillar 5 where cooking-specific), foraging knowledge, community food stores, livestock and small animals kept for food.

**Does not include:** Non-food plants (mapped to Health if medicinal), alcohol and non-nutritional items, commercial food retail operations.

**Pillar colour:** Fynbos Aloe `#4A7256`
**Crisis decommodification:** Yes — Pillar 2 is in the Pillars 1–3 protected group. Food staples cannot be withheld pending trade in crisis mode.
**Crisis priority:** 2

---

### Pillar 3 — Health
**Scope:** Anything relating to the physical or psychological wellbeing of community members.

**Includes:** Medicines and medical supplies, first aid knowledge and equipment, traditional and indigenous healing knowledge, medicinal plants, psychosocial support and trauma care, mental health resources, elder care and childcare (where health-relevant), disability support, maternal and reproductive health knowledge, community health workers and practitioners.

**Does not include:** General care work not related to health outcomes (mapped to Skills & Trade, Pillar 6), spiritual care (mapped to Pillar 4 or Skills & Trade depending on context).

**Pillar colour:** Fynbos Aloe `#4A7256` (shared with Food — both represent life, growth, and wellbeing)
**Crisis decommodification:** Yes — Pillar 3 is in the Pillars 1–3 protected group. Health resources cannot be withheld pending trade in crisis mode.
**Crisis priority:** 3

---

### Pillar 4 — Safety
**Scope:** Anything relating to the physical security, shelter, conflict resolution, legal protection, or psychological safety of community members.

**Includes:** Shelter and housing, conflict mediation and dispute resolution, community security and watch networks, legal knowledge and rights awareness, emergency protocols, safety information sharing, protection from domestic or community violence, refugee and displacement support, spiritual and cultural grounding (as a safety/identity anchor — see Section 6 below on multi-pillar mapping).

**Does not include:** General governance and administration (mapped to Skills & Trade), commercial security services.

**Pillar colour:** Ochre Earth `#C85A3C`
**Crisis decommodification:** No formal decommodification in Pillars 1–3 framework, but Safety is prioritised in the Crisis Mode interface alongside 1–3 per Community Needs Radar weighting.
**Crisis priority:** 4

---

### Pillar 5 — Energy
**Scope:** Anything relating to the generation, storage, distribution, or conservation of energy for household and community use.

**Includes:** Cooking fuel (firewood, gas, paraffin, biogas), solar panels and solar charging equipment, generators and fuel for generators, batteries and power banks, candles and lighting alternatives, load shedding mitigation knowledge and equipment, energy conservation skills, traditional fire-making knowledge.

**Does not include:** Large-scale commercial energy generation, grid-connected infrastructure managed by Eskom/municipalities (these are monitored as external signals, not community-traded items).

**Pillar colour:** Sunbaked Clay `#E6A854`
**Crisis decommodification:** No, but Energy is the pillar most directly affected by the most common SA crisis trigger (load shedding escalation) and receives elevated weight in the Anticipatory Intelligence layer (Docs: anticipatory-intelligence-spec-v1.0.md Section 6.3).
**Crisis priority:** 5

---

### Pillar 6 — Skills & Trade
**Scope:** All goods, skills, knowledge, and services not covered by Pillars 1–5, plus the exchange mechanisms themselves.

**Includes:** Technical and manual skills (electrical, plumbing, building, mechanical), educational and teaching skills, financial and administrative skills, creative and craft skills, care work not covered by Pillar 3, transport and logistics, communication and media skills, cultural and artistic contributions, general goods and equipment, the Trade Exchange itself as a functioning system.

**Does not include:** Nothing is explicitly excluded from this pillar — it is the catch-all for anything that serves community life but doesn't map cleanly to Pillars 1–5. When in doubt, map to Pillar 6.

**Pillar colour:** Sunbaked Clay `#E6A854` (shared with Energy — both represent warmth, human capacity, and activity)
**Crisis decommodification:** No.
**Crisis priority:** 6 (lowest in formal crisis prioritisation, but never irrelevant — see Section 6 below on skills in crisis)

---

## 3. Pillar Mapping — Every Data Entity

This section is the master cross-reference for O'Brien. Every entity in the Technical Architecture Document (technical-architecture-v1.0.md) that carries a pillar reference is listed here with its mapping rule.

### 3.1 `Listing.pillar_tags` (Technical Architecture Section 3.1)

Multi-value array. A single listing can carry more than one pillar tag where the item genuinely spans multiple pillars (e.g. a solar water pump spans Pillar 1 and Pillar 5). The UI displays all tags; the Needs Radar aggregates by tag.

**Validation rule:** minimum 1 pillar tag, maximum 3. If a member cannot identify any of the six pillars as relevant to their listing, the listing belongs in Skills & Trade (Pillar 6) as the catch-all.

### 3.2 `ExternalSignal.pillar_tag` (Anticipatory Intelligence Spec Section 4.1)

Single value. Every external signal Uhura logs must be tagged to at least one pillar. The pillar tag is how the convergence logic (Section 4.2 of that spec) matches an external signal to an internal forecast and routes it to the correct Needs Radar context. See Section 4 of this document for the full signal-to-pillar mapping.

### 3.3 `InternalForecast.pillar_tag` (Anticipatory Intelligence Spec Section 4.1)

Single value. Internal forecasts are computed per-pillar from `Listing` trend data. A separate `InternalForecast` row exists for each pillar showing stress — not one combined row per node.

### 3.4 `AnticipatoryAlert.pillar_tag` (Anticipatory Intelligence Spec Section 4.1)

Single value — inherited from the `InternalForecast` or `ExternalSignal` that generated it. Pillar-tagged alerts route to the correct dashboard panel in the Cell Steward and Node Admin views.

### 3.5 `ProgrammeOffering.pillar_tags` (Community Marketplace Spec Section 8)

Multi-value array. A Programme Offering must carry at least one pillar tag. The Community Marketplace's primary filter is by pillar. See Section 5 of this document for the Programme Offering category-to-pillar mapping.

### 3.6 `CrisisRoleAssignment.role` (Crisis Roles Framework Spec Section 6)

Not directly tagged with a pillar, but each crisis role maps to one or more pillars via the mapping in Section 6 of this document. The Needs Radar routes crisis-period needs to the relevant role-holders using this mapping.

### 3.7 `NetworkPhaseSnapshot` (Technical Architecture Section 3.4a)

Not pillar-tagged — network topology is a cross-pillar property of the whole community, not pillar-specific. The `NetworkPhaseSnapshot` informs the baseline confidence of all pillar forecasts but does not itself carry a pillar tag.

---

## 4. Signal Source to Pillar Mapping

Full cross-reference: every signal source in the Anticipatory Intelligence Spec (anticipatory-intelligence-spec-v1.0.md Section 6.3) mapped to its primary pillar(s).

| Signal Source | Primary Pillar(s) | Secondary Pillar(s) | Notes |
|---|---|---|---|
| FAO Food Price Index | Pillar 2 — Food | Pillar 3 — Health (nutrition) | Rising global food prices cascade to community food access |
| Fund for Peace Fragile States Index | All pillars | — | Structural backdrop — informs baseline weighting across all pillars |
| IMF World Economic Outlook | Pillar 6 — Skills & Trade | Pillar 2, 5 | Economic contraction reduces purchasing power across all pillars |
| NOAA El Niño/La Niña tracker | Pillar 1 — Water | Pillar 2 — Food | Drought/flood patterns directly affect water availability and food production |
| SADC-CSC SARCOF seasonal outlook | Pillar 1 — Water | Pillar 2 — Food | Rainfall probability directly maps to water and food growing conditions |
| EskomSePush API | Pillar 5 — Energy | Pillar 1, 2, 3 | Load shedding affects water pumping (P1), food cold chain (P2), medical equipment (P3) |
| Eskom Data Portal | Pillar 5 — Energy | Pillar 1, 2, 3 | Same cascade as EskomSePush, longer-horizon planning data |
| Stats SA CPI | Pillar 2 — Food | Pillar 5 — Energy | Food and energy sub-indices are the most community-relevant |
| BER Weekly Data Review | Pillar 6 — Skills & Trade | Pillar 2, 5 | Economic conditions affect community trade capacity and purchasing power |
| SARB Quarterly Bulletin | Pillar 6 — Skills & Trade | All | Monetary conditions are cross-pillar backdrop |
| NICD Disease Outbreak Notices | Pillar 3 — Health | Pillar 2 — Food (food-borne illness) | Direct health pillar signal |
| South African Weather Service | Pillar 1 — Water | Pillar 4 — Safety (storms, flooding) | Weather warnings map primarily to water and safety |
| Municipal service disruption notices | Pillar 1 — Water | Pillar 5 — Energy | Water and electricity cuts are the two primary municipal disruption types |
| Provincial health department alerts | Pillar 3 — Health | — | Direct health pillar signal at provincial level |
| Media monitoring — civil unrest | Pillar 4 — Safety | Pillar 6 — Skills & Trade (market disruption) | Unrest signals affect safety and community trade activity |

**Multi-pillar cascade rule:** when a signal's primary pillar is Pillar 5 (Energy), the platform automatically checks for secondary stress in Pillars 1, 2, and 3 — because load shedding reliably cascades into water (pump failure), food (cold chain disruption), and health (medical equipment, refrigerated medicines) within 24–72 hours. This cascade check is a Structured Intelligence rule (Mission Brief Section 4.3), not an ML inference.

---

## 5. Programme Offering Categories to Pillar Mapping

Every Grounder programme category maps to at least one pillar. This mapping drives the Community Marketplace's pillar-filter browsing experience and the Grounder-community matching logic.

| Programme Offering Category | Primary Pillar(s) | Notes |
|---|---|---|
| Water and sanitation | Pillar 1 — Water | Borehole programmes, greywater, rainwater harvesting |
| Agriculture and food production | Pillar 2 — Food | Food gardens, farming knowledge, seed banks |
| Food preservation and nutrition | Pillar 2 — Food | |
| Health and psychosocial wellbeing | Pillar 3 — Health | Covers both physical and psychological health |
| Traditional and indigenous healing | Pillar 3 — Health | |
| Community safety and conflict resolution | Pillar 4 — Safety | |
| Legal knowledge and rights | Pillar 4 — Safety | Legal rights as a safety and protection function |
| Energy and solar technology | Pillar 5 — Energy | |
| Cooking fuel alternatives | Pillar 5 — Energy | Shared with Pillar 2 where cooking-specific |
| Network weaving and community development | Pillar 6 — Skills & Trade | The Cell Steward training Grounder programme |
| Cooperative formation and legal support | Pillar 6 — Skills & Trade | |
| Digital literacy | Pillar 6 — Skills & Trade | |
| Financial literacy | Pillar 6 — Skills & Trade | |
| Knowledge transfer and apprenticeship | Pillar 6 — Skills & Trade | |
| Community wellbeing (care work) | Pillar 3 — Health | Pillar 6 where non-health-specific |
| Crisis preparedness training | All pillars | Multi-pillar by definition |

---

## 6. Crisis Role to Pillar Mapping

Each crisis role (Crisis Roles Framework Spec Section 4) maps to its primary pillar(s). This mapping drives two things: the Needs Radar's routing logic (which role-holder receives which alert type) and the Crisis Roster's gap identification (which pillar is unrostered).

| Crisis Role | Primary Pillar(s) | Routing Logic |
|---|---|---|
| Infrastructure Responders | Pillar 1, Pillar 5 | Routed: Water infrastructure failures + Energy system failures |
| Wellbeing Holders | Pillar 3 | Routed: Health-pillar needs in the Needs Radar; also receives psychosocial distress signals |
| Sense Makers | All pillars | Routed: Community broadcast permission; information coordination across all pillars |
| Network Weavers in extremis | All pillars | Routed: Isolation monitoring alerts; bridges between all pillar-specific role-holders |
| Provision Holders | Pillar 1, Pillar 2 | Routed: Water and food Needs Radar priority entries |
| Crisis Coordinators | All pillars | Routed: Crisis Mode activation/deactivation; cross-pillar coordination |
| Community Anchors | Pillar 4 — Safety | Routed: No platform permission (intentional — see Crisis Roles spec Section 4); anchors community identity as a safety and cohesion function |

**Crisis roster gap rule:** if a community's `CrisisRoster` has no assignment for Provision Holders (covering Pillars 1 and 2) or Wellbeing Holders (Pillar 3), the gap is flagged as Critical — these are the roles that directly correspond to the decommodified pillars (Pillars 1–3) and cannot be left unrostered. All other gaps are flagged as Warning.

---

## 7. Pillar Stress — Computable Definition

The intelligence layer needs a precise, consistent definition of what "pillar stress" means so that the rule engine (Structured Intelligence) can apply it uniformly across all nodes and all pillars.

### 7.1 Pillar Stress Thresholds

A pillar is **stressed** for a given cell or node when any of the following conditions are true:

```
LISTING DEPLETION STRESS:
  Open Listings of type 'need' for this pillar > open Listings of
  type 'offer' for this pillar, with ratio exceeding 2:1, sustained
  over a 7-day rolling window.

UNMATCHED NEED STRESS:
  5 or more unmatched 'need' Listings for this pillar have been open
  for more than 72 hours in this cell.

RAPID DEPLETION:
  The count of open 'offer' Listings for this pillar has declined
  by more than 40% over a 14-day rolling window.

EXTERNAL SIGNAL ELEVATION:
  An active ExternalSignal with primary or secondary pillar_tag
  matching this pillar, with severity: warning or severe.

INTERNAL FORECAST SIGNAL:
  An active InternalForecast for this pillar with confidence: medium
  or high.
```

Any single condition triggers **Pillar Stress: Watch** for that pillar in that cell/node.
Two or more conditions simultaneously trigger **Pillar Stress: Warning**.
Any condition for Pillars 1–3 automatically elevates to **Warning** (not Watch) given their decommodified crisis status.

### 7.2 What Pillar Stress Triggers

Per the Structured Intelligence rule engine (Mission Brief Section 4.3):

| Pillar Stress Level | Trigger |
|---|---|
| Watch (any pillar) | Gentle note on Cell Steward dashboard needs pulse |
| Warning (Pillars 4–6) | Steward dashboard alert + suggestion to review listings + Grounder programme matching for relevant pillar |
| Warning (Pillars 1–3) | Above, plus: Node Admin notified, Regional Steward notified, relevant Grounders alerted via existing notification channel |
| Multi-pillar Warning (2+ pillars simultaneously) | `MultiSignalAlert` generated (Anticipatory Intelligence Spec Section 6.6) — Regional Steward receives converging stress summary |

### 7.3 Pillar Stress in Crisis Mode

When `CrisisMode` is active for a node, all Pillar Stress thresholds tighten:
- Listing Depletion Stress ratio drops from 2:1 to 1.5:1
- Unmatched Need threshold drops from 5 listings/72 hours to 3 listings/48 hours
- Rapid Depletion window compresses from 14 days to 7 days

And only Pillars 1–3 thresholds generate real-time Needs Radar alerts visible to Crisis Coordinators. Pillars 4–6 remain monitored but are surfaced to the Cell Steward rather than the Crisis Coordinator, to keep crisis-mode information flow focused.

---

## 8. The Pillar as a Universal Key — Implementation Note for O'Brien

The Six Pillars enum should be defined once, in a single shared constants file, imported everywhere it is used. It should never be redefined per feature or per component. This is the computable form:

```typescript
// src/lib/pillars.ts — THE SINGLE SOURCE OF PILLAR TRUTH IN CODE

export enum Pillar {
  Water = 'Water',
  Food = 'Food',
  Health = 'Health',
  Safety = 'Safety',
  Energy = 'Energy',
  SkillsTrade = 'Skills_Trade'
}

export const PILLAR_COLOURS = {
  [Pillar.Water]:       '#3D6B8C', // Rainwater Blue
  [Pillar.Food]:        '#4A7256', // Fynbos Aloe
  [Pillar.Health]:      '#4A7256', // Fynbos Aloe
  [Pillar.Safety]:      '#C85A3C', // Ochre Earth
  [Pillar.Energy]:      '#E6A854', // Sunbaked Clay
  [Pillar.SkillsTrade]: '#E6A854', // Sunbaked Clay
} as const

export const CRISIS_PROTECTED_PILLARS = [
  Pillar.Water,
  Pillar.Food,
  Pillar.Health
] as const

export const PILLAR_PRIORITY = {
  [Pillar.Water]:       1,
  [Pillar.Food]:        2,
  [Pillar.Health]:      3,
  [Pillar.Safety]:      4,
  [Pillar.Energy]:      5,
  [Pillar.SkillsTrade]: 6,
} as const

// Energy cascade: when Energy is stressed, check these pillars for secondary stress
export const ENERGY_CASCADE_PILLARS = [
  Pillar.Water,   // pump failure
  Pillar.Food,    // cold chain disruption
  Pillar.Health,  // medical equipment, refrigerated medicines
] as const

// Catch-all: if a listing, offering, or signal cannot be mapped,
// use this as the default
export const DEFAULT_PILLAR = Pillar.SkillsTrade
```

This file is imported by:
- All Listing components (trade exchange)
- The Community Marketplace (Programme Offering cards and filters)
- The Needs Radar (dashboard)
- The Crisis Roles roster
- The intelligence layer's rule engine
- Tailwind config (pillar colour tokens already specified in Technical Architecture Section 6.1)
- The notification system (pillar-specific alert routing)

If this file is changed, it changes everything — consistently, everywhere. If a new pillar were ever added (it should not be without a Captain-level decision), it is added here and inherits automatically to all consumers.

---

## 9. Multi-Pillar Mapping Rules

Some items, signals, and roles genuinely span multiple pillars. The rules for handling these:

**Listings:** carry up to 3 pillar tags. Multi-tagged listings appear in filter results for all their tags. The Needs Radar counts them against each tagged pillar separately.

**Signals:** carry one primary pillar tag and optionally secondary pillar tags. Convergence logic uses the primary tag for initial matching; secondary tags are used for the cascade check (Section 4 above, energy cascade rule).

**Crisis roles:** mapped to their primary pillar(s) in Section 6 above. Sense Makers and Network Weavers are "all pillars" — in the Needs Radar routing logic, these are the roles that receive cross-pillar coordination alerts, not pillar-specific ones.

**Programme Offerings:** carry up to 3 pillar tags. Multi-pillar offerings appear in Community Marketplace results for all their tags.

**Skills & Trade (Pillar 6) as catch-all:** when any entity cannot be mapped to Pillars 1–5, it maps to Pillar 6. This is a design decision, not a gap — Pillar 6 is intentionally the broadest pillar because community life is broader than the five acute survival pillars. Pillar 6 being large is a sign the platform is capturing the full richness of community capacity, not a signal that the taxonomy needs fixing.

### 9.1 Worked Example — Sport

Sport is a real edge case that will arise in pilot communities and should be handled consistently from day one, not left to individual Cell Stewards to interpret differently.

Sport genuinely spans three pillars depending on its function:

**Pillar 3 — Health (secondary):** Sport as physical exercise, fitness, youth development through physical activity, and injury prevention. A community member offering coaching or a listing for shared sports equipment has a health dimension.

**Pillar 4 — Safety (secondary):** In South African township and community contexts specifically, sport — particularly football and netball — is one of the most powerful existing mechanisms for holding community identity together, reducing inter-group conflict, and keeping youth engaged and off the streets. This is not metaphorical: sport functions as a social cohesion and safety tool in these contexts in ways that directly parallel the Community Anchors crisis role (spiritual and cultural identity maintenance, Mission Brief Section 7.2). During sustained crisis or civil unrest, organised sport is a documented community stabilisation mechanism.

**Pillar 6 — Skills & Trade (primary):** Coaching, refereeing, sports administration, equipment sharing, team organisation, fundraising through sport. This is sport's primary mapping in ResilientSA because it is an activity, skill, and community organising function — not an acute survival resource.

**Standard mapping for sport-related listings and offerings:** Pillar 6 as primary, with Pillar 3 and/or Pillar 4 as secondary tags where the community context makes those functions explicit. A listing for "football coaching for under-16s" should carry Pillar 6 (primary) + Pillar 3 (youth development/health) + Pillar 4 (community cohesion) — all three legitimately apply. A listing for "football boots, size 8, available to borrow" carries Pillar 6 only unless the member explicitly frames it in health or safety terms.

Cell Steward training should include this example, since it demonstrates that the pillar system is not a rigid bureaucratic box but a flexible, context-sensitive tool — and that Pillar 6's scope ("all goods, skills, services, and knowledge that serve community life") is intentionally generous.

---

*ResilientSA Pillar Integration Reference v1.0 | Bridge Document | The single source of pillar truth for all specs, all code, and all intelligence functions | For Engine Room and Bridge Use*
