# ResilientSA — Community Health Protocol Specification
## Bridge Document | Version 1.0
*Makes Mission Brief Sections 6.3, 6.4, and 6.5 buildable. Defines the assessment instrument, the platform's response per health state, and the Pre-Onboarding Pathway mechanics.*

---

## 1. Purpose and What This Closes

Mission Brief Section 6.3 defines four Community Health States (Generative, Stressed, Fragile, Collapsed) and Section 6.4 describes the Pre-Onboarding Pathway for Fragile communities. Section 6.5 describes a Community Health Assessment that is "human-administered by a Regional Steward or specialist Grounder — not a digital form."

What none of these sections provide: the actual assessment questions, the format for the Regional Steward to administer and record it, how the platform's behaviour changes per state beyond the UI-level descriptions, or how a community transitions between states over time. This document closes all four gaps.

**Governing principle, restated from Mission Brief 6.5:** This assessment is human-administered, asset-focused first, and its results are shared privately with community leadership only — never published, never visible to other communities, never used to exclude or stigmatise. The platform holds this data with the same privacy protections as `Node.health_state_notes` (Technical Architecture Document Section 3.1 — PRIVATE, never exposed beyond Node Admin + Regional Steward). This is not a scoring system. It is a structured conversation that produces honest, private intelligence for people who need it.

---

## 2. The Assessment Instrument

The Regional Steward administers this verbally or as a facilitated conversation with community leadership — not as a form handed to community members to fill out. The questions below are prompts for the Steward, not a questionnaire. The Steward records their observations; the community experiences a conversation, not an evaluation.

Six dimensions are assessed. Each dimension produces an observation across a three-point informal spectrum (Strong / Adequate / Fragile) — not a score, not a number, not a formal rating. The Steward's final judgement synthesises across all six.

### 2.1 Dimension 1 — Trust and Relationships

**What the Steward is looking for:** the quality of relationships between community members, the degree of informal mutual aid already present, and whether trust is distributed across the community or concentrated in one or two people.

**Conversation prompts:**
- "Tell me about a time recently when neighbours helped each other without being asked. How often does that happen here?"
- "If someone in this community had a problem they were embarrassed about — money troubles, a sick family member — who would they turn to? How many people would that list include?"
- "Who are the connectors here — the people everyone knows and trusts?"
- "Are there groups within the community that don't mix much? What's the relationship like between them?"

**Steward observation:** Is trust distributed (multiple trusted figures, cross-group relationships) or concentrated (one or two people holding everything, significant factions)?

### 2.2 Dimension 2 — Leadership and Decision-Making

**What the Steward is looking for:** whether legitimate, recognised leadership exists, whether it is contested or stable, and whether decisions get made collectively or are imposed.

**Conversation prompts:**
- "Who makes decisions for this community? How does that work in practice?"
- "Can you give me an example of a decision the community made together in the last six months? How did it go?"
- "Are there people who feel left out of decisions? Who?"
- "What happens when there's a disagreement about something important?"

**Steward observation:** Is leadership legitimate and broadly recognised, or contested and fragile? Does collective decision-making actually happen?

### 2.3 Dimension 3 — Safety and Physical Security

**What the Steward is looking for:** whether community members feel physically safe in their own neighbourhood, whether there are functioning informal safety networks, and whether domestic or inter-group violence is present at a level that would undermine platform introduction.

**Conversation prompts:**
- "Do people feel safe here — to walk around at night, to leave their homes unattended?"
- "What does the community do when something unsafe happens? Who do people call on?"
- "Are there parts of the community or groups that feel particularly unsafe?"

**Steward observation:** Basic physical safety adequate for collective activity, or is active threat present that would undermine any platform-based coordination?

### 2.4 Dimension 4 — Social Cohesion

**What the Steward is looking for:** whether the community functions as a community — shared identity, collective activity, willingness to help people outside immediate family — or whether it is a collection of isolated households.

**Conversation prompts:**
- "What do people in this community have in common? What makes this a community rather than just a neighbourhood?"
- "When something happens — a celebration, a funeral, a crisis — do people come together? What does that look like?"
- "Are there community events, meetings, or gatherings that most people attend?"
- "Is there anything that divides people here that doesn't get talked about openly?"

**Steward observation:** Does collective identity and collective action exist, or is the community more like isolated households sharing a geography?

### 2.5 Dimension 5 — Existing Capacity and Gifts

**What the Steward is looking for:** what the community already has — skills, knowledge, informal systems, existing assets — before the platform is introduced. This is the asset-based dimension, explicitly required by Mission Brief 6.5.

**Conversation prompts:**
- "What do people here know how to do? What skills or knowledge are you most proud of in this community?"
- "Are there things this community already does collectively — informal trades, sharing, helping each other with food or care?"
- "Who are the people here whose knowledge or skills the whole community depends on?"
- "What resources does this community have that outsiders might not know about?"

**Steward observation:** What abundance exists here that the platform would make visible and connected, rather than create from nothing?

### 2.6 Dimension 6 — Trauma and Difficulty

**What the Steward is looking for:** whether the community is carrying significant recent or ongoing trauma — collective loss, sustained violence, displacement, acute poverty — that would make platform introduction premature or counterproductive. This dimension requires the most care and the most trust in the conversation before it is raised.

**Conversation prompts (raise only when enough trust exists in the conversation):**
- "What has this community been through in the last few years? What's been the hardest?"
- "Are there losses or experiences that people are still carrying — that come up when you talk about the future?"
- "Is there anything that happened that divided people, or that people don't talk about but that's still present?"

**Steward observation:** Is the community in a place where adding new infrastructure and new obligations would feel like support, or like another burden? Is there unresolved grief or conflict that would undermine collective activity?

---

## 3. Assessment Output — What the Steward Records

The output of the assessment is not a form or a score. It is a short private narrative — a paragraph per dimension, written by the Regional Steward after the conversation — stored in `Node.health_state_notes` (Technical Architecture Document Section 3.1, PRIVATE field). Alongside this narrative, the Steward records:

```
CommunityHealthAssessment {
  id (uuid, pk)
  node_id (fk → Node)
  conducted_by (fk → User — Regional Steward or specialist Grounder)
  conducted_at (timestamp)
  health_state_result (enum: generative, stressed, fragile, collapsed)
  dimension_notes (jsonb — {
    trust_and_relationships: text,
    leadership_and_decisions: text,
    safety: text,
    social_cohesion: text,
    existing_capacity: text,
    trauma_and_difficulty: text
  })
  recommended_pathway (enum: standard_onboarding, enhanced_support,
        pre_onboarding, humanitarian_referral)
  next_assessment_due (date — typically 6 months for Fragile,
        12 months for Stressed, 12 months for Generative)
  shared_with_community_leadership_at (timestamp, nullable)
}
```

This is an **append-only log** — consistent with the platform's existing design principle for all sensitive time-series data (NetworkPhaseSnapshot, CrisisRoster). Previous assessments are never deleted; they form the record of how a community's health has changed over time, which is itself valuable and honest.

---

## 4. Health State Definitions — Made Precise

Mission Brief Section 6.3 names the four states but does not give the Steward precise enough guidance to distinguish between them consistently. This section closes that gap.

### 4.1 Generative

**Indicators:** Distributed trust across multiple community figures. Recognised, broadly legitimate leadership. Adequate safety for collective activity. Active social cohesion — events, collective decision-making, informal mutual aid. Identifiable existing gifts and informal exchange systems. No acute unresolved trauma disrupting collective function.

**Does not require:** Perfection. A Generative community will have tensions, conflicts, and gaps — that is normal. What makes it Generative is that it has enough functioning social infrastructure to absorb a new tool without being overwhelmed by it.

**Platform pathway:** Standard onboarding (Mission Brief 9.4, all 10 stages). Full feature set available immediately.

### 4.2 Stressed

**Indicators:** Trust is strained but recognisable — there are still people the community trusts, but relationships are more fragile than they were. Leadership is present but contested or tired. Safety is adequate but precarious. Social cohesion exists but participation is lower, collective events are less frequent. Gifts and capacity exist but people are stretched. Some unresolved difficulty is present and acknowledged.

**Key distinguishing feature:** Underlying cohesion still intact — the community can still act collectively when it has to. It is under pressure, not broken.

**Platform pathway:** Enhanced support onboarding — slower pace, more Grounder involvement from the start, Regional Steward participates in early Cell Steward support sessions. Full platform available but introduced incrementally.

### 4.3 Fragile

**Indicators:** Trust is significantly damaged — recent betrayal, sustained conflict, or a history of outside interventions that failed and left cynicism behind. Leadership is absent, highly contested, or illegitimate. Safety concerns limit what collective activity is possible. Social fabric is thin — there are isolated households but not a community acting collectively. Significant unresolved trauma is present and active.

**Key distinguishing feature:** The community cannot currently absorb the demands of platform onboarding without making things worse. It needs relationship and healing first.

**Platform pathway:** Pre-Onboarding Pathway (Mission Brief 6.4, five phases). Platform is NOT introduced until Phase 5 (Supported Onboarding), which is only reached after months of presence-first relationship building.

### 4.4 Collapsed

**Indicators:** No functioning social structure. No recognised leadership. Active violence or threat making collective activity dangerous. Complete breakdown of trust at community level. Members not in a position to engage with any organised support.

**Platform pathway:** Humanitarian referral. ResilientSA is not the appropriate response. The Regional Steward refers to relevant humanitarian, conflict resolution, or emergency support organisations and does not attempt platform introduction. This is not abandonment — it is honesty about what the platform can and cannot do.

---

## 5. Platform Behaviour Per Health State

The platform must behave differently depending on a node's health state. This section specifies how, in computable terms.

### 5.1 Feature Availability by State

| Feature | Generative | Stressed | Fragile | Collapsed |
|---|---|---|---|---|
| Full Trade Exchange | ✓ | ✓ | ✗ (not yet on platform) | ✗ |
| Community Marketplace | ✓ | ✓ (curated offerings surfaced first) | ✗ | ✗ |
| Gifts Directory | ✓ | ✓ | ✗ | ✗ |
| Resource Map | ✓ | ✓ | ✗ | ✗ |
| Crisis Mode | ✓ | ✓ (Regional Steward supports activation) | ✗ | ✗ |
| Crisis Roles Workshop | ✓ (Phase 2) | ✓ Core roles only (Phase 2) | ✗ | ✗ |
| Cooperative Formation | ✓ (Phase 2, when ready) | Deferred | ✗ | ✗ |
| Network Health Metrics | ✓ | ✓ (interpreted with care — see note) | ✗ | ✗ |
| Anticipatory Alerts | ✓ | ✓ (delivered via Regional Steward) | ✗ | ✗ |

**Note on Network Health Metrics for Stressed nodes:** hub identification flags should be interpreted with particular care for Stressed communities — a single dominant hub may be a sign of genuine network fragility OR a sign that one trusted figure is holding the community together in a difficult time. The platform surfaces this to the Regional Steward with the distinction noted, not as an automatic alert requiring action.

### 5.2 Grounder Programme Visibility by State

For Stressed nodes, the Community Marketplace surfaces a curated set of Programme Offerings first — specifically those tagged to community wellbeing, conflict resolution, network weaving, and psychosocial support (all Pillar 3 and Pillar 4 primary, per Pillar Integration Reference Section 5). Not all Programme Offerings are hidden, but the platform actively surfaces the most relevant ones first.

For Fragile nodes (in Pre-Onboarding), Programme Offerings are not accessed through the platform at all — the Regional Steward and specialist Grounders bring what's relevant directly as part of the five-phase pre-onboarding work. No platform browsing.

### 5.3 Anticipatory Alert Routing by State

For Generative nodes, alerts route to Cell Stewards and Node Admin as normal (Anticipatory Intelligence Spec Section 4.3).

For Stressed nodes, `AnticipatoryAlert` and `MultiSignalAlert` are routed to the Regional Steward as well as the Cell Steward — given that a Stressed community's own leadership may be under more pressure and less able to act on signals independently.

For Fragile nodes, anticipatory signals are held entirely at the Regional Steward level. There is no community-facing alert delivery — the Steward decides whether and how to surface the intelligence in person.

---

## 6. The Pre-Onboarding Pathway — Made Concrete

Mission Brief Section 6.4 describes five phases for Fragile communities. This section makes each phase actionable for the Regional Steward.

### 6.1 Phase 1 — Presence Without Platform

**Duration:** Minimum 4–8 weeks, no upper limit.
**What it looks like:** The Regional Steward attends existing community spaces — meetings, events, informal gatherings — without introducing the platform or asking for anything. The goal is relationship, not recruitment.
**Platform role:** None. The platform does not know this phase is happening.
**Gate to Phase 2:** The Steward has attended at least three community gatherings, has at least one trusting relationship with a community member, and has a preliminary paper map of who the community's natural connectors are.

### 6.2 Phase 2 — Asset Mapping

**Duration:** 2–4 weeks.
**What it looks like:** The Regional Steward, now with some trust established, begins gentle conversations about what the community has — not what it lacks. Using the Gifts Profile's three founding questions informally as conversation starters, the Steward builds an informal asset map.
**Platform role:** None. The Steward records observations privately.
**Gate to Phase 3:** The Steward can name at least 10–15 households with some existing mutual trust, and at least 2–3 individuals with natural connector qualities.

### 6.3 Phase 3 — Micro-Network Activation

**Duration:** 3–6 months minimum.
**What it looks like:** The Steward facilitates very small, structured mutual aid activities among the identified households. No technology. Physical meetings, offline exchanges, simple shared activities. An informal crisis role structure is established at this level (per Crisis Roles Framework Spec Section 2.3).
**Platform role:** None. All activity is physical.
**Gate to Phase 4:** The micro-network has functioned for at least 3 months, at least 3 mutual aid exchanges have happened organically without the Steward initiating them, and trust between the identified connector figures is established.

### 6.4 Phase 4 — Minimum Viable Trust Threshold

**Duration:** 1–3 months assessment period.
**What it looks like:** The Regional Steward reassesses the community against the full Community Health Assessment (Section 2 above). The question being answered: has this community crossed from Fragile into Stressed?
**Platform role:** A new `CommunityHealthAssessment` record is created. If the result is now `stressed` or `generative`, `Node.health_state` updates.
**Gate to Phase 5:** Assessment result is Stressed or Generative.

### 6.5 Phase 5 — Supported Onboarding

**Duration:** Ongoing, with accelerated Grounder support.
**What it looks like:** Standard platform onboarding (Mission Brief 9.4) begins, with significantly more Regional Steward and Grounder support than a Generative-tier community would receive.
**Platform role:** Full standard onboarding, with `Node.health_state` set to `stressed` and the enhanced Grounder surfacing behaviour active (Section 5.2 above).

---

## 7. State Transitions — How a Community Changes State

Health states are not permanent. The platform tracks changes as an append-only assessment log (Section 3), not an overwritten field, preserving the honest history.

### 7.1 Upward Transitions (Improving)

A community moves from Fragile → Stressed when Phase 4 assessment confirms it. From Stressed → Generative when an annual or triggered reassessment confirms improved conditions across all six dimensions. Upward transitions are confirmed by a new `CommunityHealthAssessment` record, reviewed with community leadership before `Node.health_state` updates.

### 7.2 Downward Transitions (Declining)

**A downward transition is never made automatically by the platform.** It is a human judgement made by the Regional Steward, triggered by a combination of platform signals (Pillar Stress Warning persisting, Network Health metrics declining), Anticipatory Intelligence signals (MultiSignalAlert at warning severity), and direct ground observation. The Steward conducts a new assessment, discusses with community leadership honestly, and records the new state.

### 7.3 Triggered Reassessment

Beyond scheduled cadence, a reassessment should be triggered when:
- A `MultiSignalAlert` with `severity: warning` persists for more than 2 weeks for this node
- A Crisis Mode event has occurred and been deactivated
- The Regional Steward has direct observational evidence of significant change in any dimension

---

## 8. What This Spec Does Not Cover

- **Inter-community comparison or ranking.** Not built. Communities are never ranked against each other and no aggregate "health score" across the platform is produced. The assessment exists for each community's own benefit and honest self-understanding only.
- **A digital form version of the assessment.** Mission Brief 6.5 is explicit: human-administered, not a digital form. A future simple recording panel for the Regional Steward may be built, but the instrument itself remains conversational.
- **The specific Grounder programme content for Fragile and Stressed support.** These exist as Programme Offerings in the Community Marketplace — this document specifies which categories are surfaced per state, not the content of the offerings themselves.

---

*ResilientSA Community Health Protocol Specification v1.0 | Bridge Document | Extends Mission Brief Sections 6.3, 6.4, 6.5 | For Regional Steward and Engine Room Use*
