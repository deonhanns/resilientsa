# CREW ORDER — 001
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-001
**Issued by:** Spock
**Assigned to:** McCoy (Claude Design)
**Status:** COMPLETE ✅
**Date issued:** 2026-06-30
**Date closed:** 2026-07-02

---

## 1. STRATEGIC CONTEXT

ORDER 001 is the gate through which the entire build sequence passes. Per the Build Roadmap (`docs/build-roadmap-v1.0.md`), no PWA code begins until McCoy produces a Bones-approved clickable prototype that a Cape Town RA/CPF community leader can tap through in 10 minutes and immediately understand — without explanation, without development theatre, without promises. This order closed that gate.

---

## 2. MISSION OBJECTIVE

Produce a Bones-approved three-screen clickable prototype and a complete Living Soil Design System that O'Brien can build the ResilientSA PWA from.

---

## 3. BONES BRIEF

Fully specified in `docs/bones-protocol-v1.0.md` Section 6. Bones reviewed all screens across three sessions. Full verdicts on record in the Bridge session.

---

## 4. WORF BRIEF

No PII in this order. No security review required.

---

## 5. DESIGN SYSTEM REFERENCE

`docs/brand-palette-v1.0.md` — Living Soil palette. McCoy extended this with two additions now adopted as canonical:

- **Health pillar:** Protea Rose `#B24C63` (SA's national flower) — replaces the original shared Fynbos Aloe
- **Skills & Trade pillar:** Indigo Cloth `#5E5A8C` (shweshwe textile reference) — replaces the original shared Sunbaked Clay

These are now the authoritative pillar colours. `docs/brand-palette-v1.0.md` and `docs/pillar-integration-reference-v1.0.md` require updates to reflect this. Flagged for next Bridge session.

---

## 6. O'BRIEN BRIEF

N/A — this order is McCoy's. O'Brien's instructions begin at ORDER 002.

---

## 7. CROSS-SPEC DEPENDENCIES

- `docs/mission-brief-v1.0.md` — platform philosophy and six pillars
- `docs/brand-palette-v1.0.md` — Living Soil palette (see Section 5 above for McCoy extensions)
- `docs/community-marketplace-spec-v1.0.md` — Get Support / Programme Offering card spec
- `docs/bones-protocol-v1.0.md` — the six-question test
- `docs/mccoy-prompt-order001-v1.0.md` — the full brief sent to Claude Design

---

## 8. DELIVERABLES — COMPLETE

### Screens Produced and Bones-Approved

| Screen | Bones Verdict | Notes |
|---|---|---|
| Trade Exchange — all states | ✅ PASS (v2) | Corrections applied: ↑/↓ icons on Offering/Needed pills; Skills & Trade visible in pillar row |
| Trade Exchange — Water filter | ✅ PASS | |
| Trade Exchange — Skills filter | ✅ PASS | |
| Create listing sheet | ✅ PASS | "Share with your cell" — pillar grid with full colour circles |
| Steward Dashboard | ✅ PASS | Needs radar, "More members connecting directly", isolate flag |
| Offerings filter view | ✅ PASS | |
| Needing filter view | ✅ PASS | |
| Get Support — entry screen | ✅ CONDITIONAL PASS | Pillar icon colour weight correction delegated to O'Brien in ORDER 008 |
| Programme Offering cards | ✅ PASS | "38 communities used this" maps to OfferingEndorsement aggregate |

### Living Soil Design System

Complete design system committed to `design/prototype-v1/`:
- `tokens/` — 104 CSS custom properties (colours, typography, spacing, fonts)
- `components/` — Icon, PillarTag, PillarButton, PillarGrid, Button, IconButton, Input, SearchField, SegmentToggle, Card, ListingCard, ProgrammeCard, Badge, EmptyState, AppBar, BottomNav, NeedsRadar, MemberRow, NetworkSummary
- `ui_kits/resilientsa-app/` — working prototype (open `index.html` in browser)
- `_ds_bundle.js` — component bundle (reference only — not a production dependency)
- `readme.md` — full design system documentation (12KB)
- `README-summary.md` — quick-reference summary

### Claude Design Project

`https://claude.ai/design/p/6bdfddb8-c5a4-4333-b384-e052f1fe531a`

---

## 9. MILESTONES — ALL COMPLETE

- ✅ Three screens designed in Claude Design
- ✅ Bones Protocol reviewed — all screens passed
- ✅ Living Soil Design System exported
- ✅ Design files committed to `design/prototype-v1/`
- ✅ Prototype ready to carry into first Cape Town community meeting

---

## 10. REPORTING BACK

ORDER 001 is closed. O'Brien's first task begins at ORDER 002. Captain carries the prototype (`design/prototype-v1/ui_kits/resilientsa-app/index.html`) into the first Cape Town RA/CPF relationship.

---

## 11. SAREK ESCALATION CLAUSE

Not required — ORDER 001 complete.

---

**ORDER STATUS: COMPLETE ✅**
**BONES VERDICT: PASS**
**DESIGN SYSTEM: COMMITTED TO `design/prototype-v1/`**

*Logged by Spock — 2026-07-02*
