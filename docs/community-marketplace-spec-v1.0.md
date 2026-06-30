# ResilientSA — Community Marketplace Feature Specification
## Bridge Document | Version 1.0
*Extends Mission Brief Section 3.4 (Grounder role) and Section 4.2 (Core Platform Modules)*

---

## 1. Purpose

This feature defines how Grounder programmes become visible, browsable, and requestable by communities — without ever exposing the internal "Grounder" identity language to community-facing users.

It resolves a naming and architecture gap in the original Mission Brief: the **Grounder Directory** (Section 4.2) was originally specified as the community-facing browsing surface. This document replaces that framing with a clean separation between the internal partner identity and the community-facing catalogue.

---

## 2. The Naming Architecture

| Term | Audience | Where It Lives |
|---|---|---|
| **Grounder** | Internal / partner-facing only | Verification process, Platform Steward Council vetting, impact reporting, the Elder Prospectus, partner agreements |
| **Programme Offering** | Community-facing | The catalogue item a Cell Steward browses and requests |
| **Get Support** | Community-facing | The entry point / verb framing — plain, warm, conversational |
| **Community Marketplace** | Community-facing | The section of the platform where Programme Offerings live |

**The governing rule:** A community member never needs to learn or see the word "Grounder." They experience an organisation's identity only as the named provider of a Programme Offering — secondary information on the card, not the primary unit of browsing.

This mirrors how an app store surfaces the app before the developer, or how a community surfaces what's being given before who's giving it — consistent with the platform-wide principle that gifts and offerings are the unit of value, not the status of the giver.

---

## 3. The Community Entry Point: "Get Support"

A single, prominent entry point on the Community Hub (per Mission Brief Section 4.2), phrased as a plain-language question rather than a navigation label:

> **"What kind of support does your community need?"**

Tapping it presents the Six Pillars as the first filter — Water, Food, Health, Safety, Energy, Skills & Trade — using the existing pillar colour mapping from the Brand Identity System. This keeps total consistency with how the Trade Exchange already organises listings, so the mental model a member has already learned for trading gifts transfers directly to finding Programme Offerings.

A secondary, smaller entry point — "Search support" — allows free-text search for members who already know roughly what they're looking for.

---

## 4. The Community Marketplace — Structure

### 4.1 Browsing View

Once a pillar is selected (or a search performed), the Marketplace displays a list of **Programme Offering cards**. Each card shows, in this priority order:

1. **Offering name** (plain language, set by the Grounder but reviewed for clarity during verification — see Section 6)
2. **Pillar tag** (using brand pillar colour mapping)
3. **One-line description** — what the community receives, in concrete terms
4. **Community endorsement signal** — a simple count or indicator ("Used by 14 communities") rather than a star rating, consistent with the platform-wide rejection of algorithmic rating systems (Mission Brief Section 5.6 — Contribution Web uses endorsement, not scoring)
5. **Provider name** — shown smaller, secondary, with a "Verified" badge if applicable
6. **"Request for our community"** button

### 4.2 Detail View

Tapping a card opens the full Programme Offering detail:

- Full description in plain language
- What the community needs to provide (space, time, a minimum number of participants, etc.)
- Typical duration / engagement length
- Which pillar(s) it serves
- Communities currently using it (node names only, with those communities' consent — opt-in visibility)
- Provider identity and a short "why we do this" statement
- The request action

### 4.3 What Is Deliberately Left Out of the Community View

- No pricing or monetary framing of any kind (programmes are free by platform-wide Grounder commitment — Mission Brief Section 3.4)
- No internal verification scoring, application status, or Platform Steward Council review notes
- No funder names or funding amounts (this lives only in the Grounder's own impact reporting layer, never community-facing)
- No comparison/ranking mechanics between providers — communities browse by relevance to their need, not by a "best" ranking

---

## 5. The Request Flow

1. **Cell Steward or Node Admin taps "Request for our community"** on a Programme Offering
2. A short, structured request form appears — auto-prefilled with the community's node profile data already on the platform (location, approximate size, dominant pillar activity) to minimise re-entry
3. A free-text field allows the Steward to add specific context ("We have 40 households without reliable water access")
4. Request is submitted to the Grounder's **Requests Inbox** (Mission Brief Section 3.4 — Grounder responsibilities)
5. The Grounder accepts, proposes a start date, or explains why they can't serve that community right now — all per the existing Grounder responsibilities already specified
6. Once accepted, the engagement is recorded and the Programme Offering becomes visible on the community's own profile as an active or completed engagement

This flow does not require new Grounder-side functionality — it routes into the existing Requests Inbox specified in the Mission Brief. The Marketplace is a new front door; the back-end relationship and accountability structure (Cell Steward as sole communication channel, no direct Grounder-to-member contact, impact reporting) is unchanged.

---

## 6. Programme Offering Creation and Review

When a verified Grounder creates a Programme Offering, the platform guides them through a short clarity check before publishing:

- A plain-language rewrite prompt if the description uses jargon ("Is there a simpler way to say this?")
- A mandatory "What does a community need to provide?" field — prevents vague offerings that create friction later
- A mandatory pillar tag (at least one of the Six Pillars)
- Optional photo or simple illustration

This is light-touch — not a heavy approval gate, since the Grounder has already been through the formal verification process (Mission Brief Section 3.4) to become a Grounder in the first place. The clarity check exists purely to protect the community-facing experience, not to re-litigate the Grounder's legitimacy.

---

## 7. Endorsement, Not Rating

Consistent with the platform-wide rejection of algorithmic scoring (Mission Brief Sections 5.6 and 6.1), Programme Offerings are not star-rated. Instead:

- After an engagement completes, the requesting community's Node Admin is asked one plain question: **"Would you recommend this to another community?"** — yes / no, with an optional short note
- Aggregate "yes" responses are shown as a simple count on the Offering card ("Recommended by 11 of 12 communities")
- Notes are visible in the full detail view, attributed to the community (with consent) or shown anonymously if preferred
- A pattern of "no" responses triggers a private review prompt to the Platform Steward Council — the same escalation path already used for Grounder accountability — rather than automatically removing the Offering

---

## 8. Data Model Additions (for Scotty)

```
ProgrammeOffering {
  grounder_id
  pillar_tags (array, min 1, from Six Pillars enum)
  name
  short_description
  full_description
  community_requirements (free text)
  typical_duration
  status (enum: draft, active, paused, archived)
  created_at
  updated_at
}

OfferingEngagement {
  offering_id
  node_id
  status (enum: requested, accepted, declined, active, completed)
  requested_at
  request_context (free text from Cell Steward)
  started_at (nullable)
  completed_at (nullable)
}

OfferingEndorsement {
  engagement_id
  node_id
  recommend (boolean)
  note (free text, optional)
  visibility (enum: attributed, anonymous)
  submitted_at
}
```

`ProgrammeOffering` is owned and edited by the Grounder. `OfferingEngagement` and `OfferingEndorsement` follow the same node-tier data principles as the rest of the platform — visible to the community that created them, aggregated (not raw) data visible to the Grounder, and never sold or shared commercially.

---

## 9. UX Notes

- The word "Marketplace" should not imply a monetary transaction is happening anywhere in this flow — the visual design must lean on the existing Brand Identity System (Fynbos Aloe for active/positive states, Sunbaked Clay for pending requests) rather than any e-commerce visual convention (no shopping cart icons, no "price" styling, no checkout language)
- Pillar filtering must work identically to how it already works in the Trade Exchange — one mental model across the whole platform
- The entire Marketplace must degrade gracefully offline: cached Programme Offering data remains browsable; requests queue and send once connectivity returns, consistent with the platform-wide offline-first principle (Mission Brief Section 10)
- "Get Support" must be discoverable from the Community Hub without requiring the member to already know the word "Marketplace" or "Offering" — entry is need-first, not catalogue-first

---

## 10. What This Does Not Change

- Grounder verification, onboarding, and the Platform Steward Council review process (Mission Brief Section 3.4) — unchanged
- The Elder Prospectus and all partner-facing language — unchanged, "Grounder" remains the correct term in that context
- Impact reporting to funders — unchanged, still Grounder-facing only
- The Cell Steward as sole communication channel between Grounders and individual members — unchanged and reinforced by this spec, since the Marketplace request flow is explicitly Steward/Admin-initiated, not individual-member-initiated

---

*ResilientSA Community Marketplace Feature Spec v1.0 | Bridge Document | Extends Mission Brief Sections 3.4 and 4.2 | For Engine Room Use*
