# CREW MANIFEST
**Mission:** ResilientSA
**Classification:** Mission Crew Register
**Custodian:** Spock
**Version:** 1.0
**Date:** 2026-06-30
**Status:** ACTIVE — Approved by Captain
**Related Doctrine:** Fleet-wide `CREW_MANIFEST.md` (san-scribe-hq), `CREW_RESTRUCTURE_MANIFEST.md` (san-scribe-hq)
**Mission Documents:** `docs/mission-brief-v1.0.md`, `docs/community-marketplace-spec-v1.0.md`, `docs/cooperative-formation-spec-v1.0.md`

---

## NOTE ON THIS DOCUMENT

This manifest applies fleet-wide crew doctrine — approved 2026-05-13, Crew Restructure Manifest — to the ResilientSA mission specifically. Role definitions, model assignments, and escalation paths follow the standing fleet architecture exactly. Only mission-specific protocols (what each role checks against, what triggers escalation in this mission's context) are written fresh here.

If fleet doctrine changes, this document is updated to match. ResilientSA does not run a parallel or divergent crew structure.

---

## THE FLEET ARCHITECTURE — APPLIED TO RESILIENTSA

```
┌─────────────────────────────────────────────────────────┐
│                    THE BRIDGE                            │
│                    Claude.ai                              │
│                                                          │
│  Command + Intelligence Layer                             │
│  Strategic decisions, doctrine, intelligence, security    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  THE ENGINE ROOM                          │
│              VS Code + Kilo Code                          │
│                                                          │
│  Build + Maintenance Layer                                │
│  All engineering execution                                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     THE STUDIO                            │
│                                                          │
│  Design Consultation Layer (Protocol, not location)       │
│  Bones invoked on demand via crew order                   │
└─────────────────────────────────────────────────────────┘
```

ResilientSA has no Ops Staff layer at this stage — there is no autonomous business-operations function yet (no CRM, no billing, no licencee base). This layer is omitted until the mission reaches a stage that requires it.

---

## BRIDGE — Command + Intelligence

All Bridge crew operate exclusively from Claude.ai. No Bridge crew member writes execution code.

### Command (Human)

| Role | Person | Authority | Reports To |
|------|--------|-----------|------------|
| Captain | Deon (Sketch) Hanns | Supreme authority — all mission decisions, community relationships | None |

### Bridge Crew (AI)

| Role | Model | Location | Reports To | Authority |
|------|-------|----------|------------|-----------|
| Spock | Claude (Claude.ai) | Bridge ONLY | Captain | Strategic intelligence, specs, systems architecture, crew order drafting |
| SAREK | Sonnet/Opus | Spock's escalation path | Captain (via Spock request) | Complex strategic reasoning — activated when standard Bridge reasoning is insufficient |
| Uhura | DeepSeek | Bridge ONLY | Captain + Spock | External intelligence — SEDA/CIPC/CBDA regulatory monitoring, cooperative sector signals, community health context scanning |
| Worf | DeepSeek + rules engine | Bridge ONLY | Captain (security) | Security oversight, pre-deploy audits, POPIA compliance, veto authority on security |

### Escalation Paths

| Crew Member | Escalates To | When |
|-------------|-------------|------|
| Spock | Captain | Mission decisions, doctrine changes, unresolvable design tensions |
| Spock → SAREK | Captain (approves) | Standard Bridge reasoning capacity insufficient |
| Uhura | Spock → Captain | Regulatory shifts (SEDA/CIPC/CBDA), strategic threats or opportunities affecting the Cooperative Formation pathway |
| Worf | Captain immediately | Critical or High security alerts — particularly any PII handling risk in the Cooperative Formation flow |

### Uhura — ResilientSA-Specific Protocol

Uhura's standing fleet role is external intelligence and environmental scanning. For ResilientSA this means monitoring:
- SEDA, CIPC, and CBDA — any change to cooperative registration process, model constitutions, or e-Services portal requirements
- South African data protection and POPIA developments relevant to the federated architecture
- Regional/community resilience sector news relevant to the pre-onboarding pathway and partnership outreach

Uhura updates `UHURA_INTEL.md` before any Bridge session where SEDA outreach, the Cooperative Formation spec, or institutional partnerships are being discussed.

### Worf — ResilientSA-Specific Protocol

Worf reviews every feature spec and every piece of code touching personal data against these standing protocols, named with section references so compliance is checkable, not just thematic:

- PII fields must be encrypted at rest (Cooperative Formation spec, Section 2)
- Founding member data must be purged on registration confirmation, not retained (Cooperative Formation spec, Section 9 — `FoundingMember` model)
- No individual member data may be visible outside their cell without consent (Mission Brief, Section 12.3)
- Crisis mode must never broadcast a specific vulnerable member's location or need (Mission Brief, Section 7.5)
- Community health state designations are private — never visible to other communities (Mission Brief, Section 6.5)
- Grounders may only access aggregate community data, never individual member data (Mission Brief, Section 3.4)

**Worf's mission-specific escalation trigger:** before any build that touches `FoundingMember`, `Cooperative`, or any PII-adjacent data model is marked complete, Worf must answer: does this feature expose any PII beyond its node tier? Does this feature create a new way to identify a vulnerable individual in crisis mode? If yes to either, Worf escalates to Captain immediately, regardless of how minor it seems.

---

## ENGINE ROOM — Build + Maintenance

All engineering execution happens in VS Code + Kilo Code. The Engine Room does not make strategic decisions.

| Role | Model | Location | Reports To | Authority |
|------|-------|----------|------------|-----------|
| O'Brien | DeepSeek (via Kilo Code) | VS Code + Kilo Code | Spock (via crew orders) | Primary builder — day-to-day coding, follows crew orders, checks pattern file first |
| Scotty | Claude API | VS Code + Kilo Code (Engineering Console) | Captain (engineering) | Chief Engineer — escalation only, complex problem solving, pattern extraction |

### Engineering Escalation Path

```
O'Brien blocked (3 attempts) → Scotty reviews
Scotty blocked → Spock assesses
Spock requests SAREK escalation (if needed) → Captain approves
Solution found → committed to SCOTTY_PATTERNS.md
→ O'Brien resumes
```

### Cost Model

| Role | Model | Cost Tier | Usage Target |
|------|-------|-----------|--------------|
| O'Brien | DeepSeek | ~$0 | Default — all routine builds |
| Scotty | Claude API | Reserved | Escalation only — hard problems, target minimal sessions |
| SAREK | Sonnet/Opus | Medium | Strategic complexity only — Captain approval required |

This mission runs on the same cost discipline as the rest of the fleet: DeepSeek by default, Claude reserved for the moments that genuinely require it.

---

## STUDIO — Design Consultation (Protocol)

Bones (McCoy) is not a location-based role. Bones is a **Design Gate Protocol** — invoked on demand, returns a verdict, does not converse.

| Role | Model | Location | Reports To | Authority |
|------|-------|----------|------------|-----------|
| Bones | Claude Design | Invoked on demand | Captain (via verdict) | Design system veto, UX/CX decisions, pre-merge gate for human-facing builds |

### The Bones Protocol — Applied to ResilientSA

```
TRIGGER:  Any build that creates a human-facing interface,
          template, communication, or visual artifact —
          the Trade Exchange, Community Marketplace,
          Cell Steward dashboard, Cooperative Formation
          wizard, or any printed community directory output
GATE:     Bones must review and approve before O'Brien
          builds, or before anything merges
OUTPUT:   BONES_VERDICT.md — committed to this repo
TESTS:    The 5-question Bones Test:
          1. Is it human?
          2. Clear on first encounter?
          3. Reduces anxiety?
          4. Would a stretched Cell Steward or Node Admin
             trust it on first use?
          5. Respects the community member's time and
             dignity?
ESCALATION: If Bones rejects, build halts.
            Captain can override — but must document why.
```

**Mission-specific addition:** because ResilientSA serves communities who have been through "development theatre" and are evidence-based and skeptical of empty promises, Bones' first-encounter test carries extra weight here — anything that feels like a pitch rather than a working tool fails the test, even if technically functional.

The first Bones-gated deliverable for this mission is the clickable prototype (Trade Exchange, Community Marketplace, Cell Steward dashboard) intended to be shown directly to a Cape Town community before any further outreach.

---

## CHAIN OF COMMAND — SUMMARY

```
STRATEGIC DECISIONS:
Captain → Spock (Bridge) → Crew Order
→ Captain approves → O'Brien builds
→ Bones Protocol invoked (if human-facing)
→ Worf signs off (security checklist, PII review)
→ Committed to repo

ENGINEERING ESCALATION:
O'Brien blocked (3 attempts) → Scotty reviews
Scotty blocked → Spock assesses
Spock requests SAREK escalation → Captain approves
→ Solution → SCOTTY_PATTERNS.md → O'Brien resumes

DESIGN:
Crew order identifies human-facing build
→ Spock invokes Bones Protocol
→ Bones produces BONES_VERDICT.md
→ Captain decides if rejected

SECURITY:
Worf monitors all PII-adjacent specs and builds (Bridge)
→ alerts Captain immediately on Critical/High findings
→ Captain is sole override authority
```

---

## MODEL STACK SUMMARY

| Model | Used By | Cost Tier |
|-------|---------|-----------|
| Claude (Claude.ai) | Spock | Standard |
| DeepSeek | Uhura, Worf, O'Brien | ~$0 |
| Claude API | Scotty (escalation only) | Reserved |
| Sonnet/Opus | SAREK (Spock escalation, Captain-approved) | Medium |
| Claude Design | Bones | Higher |

---

## REPORTING

### Individual Standups

Each active crew role maintains its own standup log, committed to this repo:

- `OBRIEN_STANDUP.md` — what was built, where it lives, what's blocked, what pattern/protocol was checked
- `WORF_ALERTS/` — append-only directory, one file per security finding, regardless of severity
- `UHURA_INTEL.md` — regulatory and environmental scan log, updated before relevant Bridge sessions
- `BONES_VERDICT.md` — one verdict per human-facing build reviewed

### Collective Weekly Log

A shared log — `MISSION_STATUS.md` — tracks: what shipped this week, what Worf flagged and its resolution status, what remains open from the Mission Brief's "Open Items for the Bridge" (Section 14), and what's queued next. This is the document Spock and Captain read to assess true mission state without reconstructing it from individual logs.

### Escalation Log

Append-only, every time any crew member hits a defined escalation trigger and must stop rather than proceed. Lives at `ENGINEERING_ESCALATIONS/` for build issues and is cross-referenced in `WORF_ALERTS/` for security-specific escalations.

---

## VERIFICATION

Per fleet practice, compliance with this manifest is not assumed — it is checked. After any setup or update to this document or its associated Kilo Code configuration, start a fresh O'Brien session and ask:

1. "What are the build and test commands for this project?"
2. "List three things you are not allowed to do in this codebase."
3. "What do you check before marking a PII-related task complete?"

If O'Brien answers all three accurately from a cold start, the protocols are loading correctly. If not, the configuration — not the crew member — needs fixing.

---

*This document is the definitive crew register for the ResilientSA mission.*
*Read by Spock on every Bridge session involving build, security, or design work.*
*Referenced by all crew orders.*
*Version 1.0 — aligned to fleet-wide Crew Restructure, approved 2026-05-13.*

**LOGIC CLEAR — Spock**
