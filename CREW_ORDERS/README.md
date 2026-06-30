# CREW ORDERS

**Classification:** Mission Operational Orders
**Custodian:** Spock
**Location:** `resilientsa/CREW_ORDERS/`

---

## PURPOSE

This directory contains all crew orders issued from the Bridge for the ResilientSA mission. Every order follows the 11-element structure below. ResilientSA is a separate venture from the San Scribe Enterprise fleet — orders here originate and stay in this repo, not in any shared HQ.

Crew orders are the primary mechanism by which Captain decisions become engineering action. No build begins without an approved crew order.

---

## STATUS FLOW

```
DRAFTED (Spock writes)
    ↓
APPROVED (Captain approves)
    ↓
COMMITTED (Spock commits to GitHub)
    ↓
RECEIVED (O'Brien reads on session open)
    ↓
IN PROGRESS (O'Brien building)
    ↓
REVIEW (Bones + Worf sign-off, where applicable)
    ↓
COMPLETE (status updated in this order + MISSION_STATUS.md)
    ↓
ARCHIVED (moved to CREW_ORDERS/archive/)
```

---

## FILE NAMING

```
CREW_ORDER-[ID]-[short-title].md   — Active orders
CREW_ORDERS/archive/                — Completed orders
```

ID format: Sequential 3-digit numbers starting at 001.

---

## CREW ORDER CONTENTS — 11 MANDATORY ELEMENTS

Every `CREW_ORDER-[ID].md` contains:

```
1. STRATEGIC CONTEXT
   Why this matters for the mission
   What Captain decision triggered this
   How it fits the Mission Brief

2. MISSION OBJECTIVE
   One sentence. Unambiguous.
   "Build X so that Y can Z."

3. BONES BRIEF
   How this must feel to the human
   Specific emotional targets
   Anti-patterns to avoid
   Reference: Mission Brief Section 2.5 (Calm Technology),
              Brand Identity System

4. WORF BRIEF
   What data this build handles
   What attack surface it creates
   What must never be logged or exposed
   Reference: CREW_MANIFEST.md Worf protocol list,
              Mission Brief Section 12.3 (Data Principles)

5. DESIGN SYSTEM REFERENCE
   Exact sections of docs/brand-palette-v1.0.md applicable
   Colour tokens, typography rules, pillar mapping

6. O'BRIEN BRIEF (technical specification)
   Exact technical specification
   Technology + environment
   Inputs and outputs
   Data schema if relevant
   Integration points
   Definition of done (precise)

7. CROSS-SPEC DEPENDENCIES
   What other mission document this depends on
   (Mission Brief section, Community Marketplace spec,
   Cooperative Formation spec)

8. MILESTONES
   Milestone 1: [deliverable]
   Milestone 2: [deliverable]
   Definition of order complete

9. UHURA INTELLIGENCE REQUIRED (if applicable)
   Research needed before O'Brien builds
   External data needed (SEDA/CIPC/CBDA, POPIA, etc.)

10. REPORTING BACK
    What gets logged in OBRIEN_STANDUP.md on completion
    What triggers a new Bridge session
    What can be decided without escalation

11. SAREK ESCALATION CLAUSE
    Default: not required for this order
    State explicitly if this order anticipates a likely
    SAREK escalation given its complexity
```

---

## CURRENT ORDERS

| ID | Title | Assigned To | Status | Date |
|----|-------|-------------|--------|------|
| — | *No orders issued yet* | — | — | — |

---

*Crew orders managed by Spock. Captain approves every order before execution.*

**LOGIC CLEAR — Spock**
