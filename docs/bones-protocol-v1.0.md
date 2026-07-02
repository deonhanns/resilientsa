# ResilientSA — Bones Protocol
## Bridge Document | Version 1.1
*Formalises the design gate for all human-facing builds. Extends CREW_MANIFEST.md Studio section.*

---

## 1. What the Bones Protocol Is

Bones (McCoy) is not a crew member who lives in VS Code. Bones is a **design gate** — a structured review invoked before any human-facing build begins or merges. The gate returns a verdict. It does not converse, iterate, or advise. It passes or it flags.

This document formalises the protocol for ResilientSA specifically: when it is invoked, what the brief to Claude Design looks like, what the six-question test evaluates against, and what the output requires.

---

## 2. The Invocation Trigger

Bones is invoked whenever a Crew Order produces, or requires as a dependency, any of the following:

- A user interface screen or component (PWA — Trade Exchange, Community Marketplace, Steward dashboard, Gifts Profile, Crisis Mode, Cooperative Formation wizard)
- A notification or alert message (SMS, WhatsApp, push) that a community member or Cell Steward will read
- A printed artefact (Community Directory, Crisis Roster, quarterly print)
- An onboarding flow step that a first-time community member encounters
- Any copy, label, or instruction text that is community-facing

**Invocation is Spock's responsibility.** Spock includes a Bones Brief in the Crew Order (element 3 of the 11-element order structure, per `CREW_ORDERS/README.md`) and flags whether this order requires Bones before O'Brien builds or before merge.

**The gate position matters:**
- For new screens or flows: Bones reviews the brief and design before O'Brien writes a single line of code
- For copy/notification text: Bones reviews the draft text before it is committed
- For printed artefacts: Bones reviews the layout before it goes to the print mechanism

---

## 3. The Six-Question Bones Test

Every Bones review runs six questions against the work being reviewed. These are not a checklist — they are the lens Bones applies to produce a verdict.

**Q1 — Is it human?**
Does this feel like it was made by a person who cares about the person receiving it? Or does it feel generated, templated, corporate, or NGO-generic? The platform's warm, grounded, non-institutional tone (Mission Brief Section 2.5, Brand Identity System) must be present in every human-facing element.

**Q2 — Is it clear on first encounter?**
Could a Cell Steward who has never seen this before understand what it is and what to do with it, without explanation? No jargon, no assumed platform knowledge, no cognitive overhead. This applies with heightened weight for ResilientSA: many community members are first-time platform users on basic smartphones with variable literacy levels.

**Q3 — Does it reduce anxiety?**
Does it make the person feel more capable and more in control, or does it introduce uncertainty and pressure? This is particularly important for the Cooperative Formation wizard (legal jargon without translation fails this test), Crisis Mode interfaces (information overload fails this test), and onboarding flows (anything that feels like a test or an evaluation fails this test).

**Q4 — Would a stretched Cell Steward or Node Admin trust it on first use?**
ResilientSA's Cell Stewards are volunteers doing this work on top of already demanding lives. The platform must earn their trust quickly and never waste their time. Anything that requires reading before doing, explaining before using, or trusting before understanding fails this test. The platform should feel like a trusted neighbour, not a system requiring orientation.

**Q5 — Does it respect the community member's time and dignity?**
No dark patterns. No false urgency. No guilt. No nudges that exploit psychological pressure. Nothing that treats the person as a data source rather than a human being. The platform is in service of communities; communities are not in service of the platform.

**Q6 — Does it communicate without relying on text?**
South Africa has 11 official languages. ResilientSA serves communities where English is not a home language and where literacy varies. Cover the text on the screen — does the person still know what pillar they're looking at, what state a listing is in, what action is available? Pillar colours, icons, and visual hierarchy must carry meaning independently of the text label. If the design fails when the text is removed, it fails this question.

This is not about making text optional — text matters and all UI strings are translated into Afrikaans at MVP (isiZulu at Phase 2). This is about ensuring the visual layer does its own work so that language and literacy are lower barriers, not higher ones. The Cell Steward is the human language bridge for their community — the platform's job is to make the Steward's job easier, not to require the Steward to explain every screen.

**ResilientSA-specific addition to Q2 and Q4:** because Cape Town communities specifically have been through development theatre and are evidence-based and tired of empty promises (Captain's direction, 2026-06-30 Bridge session), anything that feels like a pitch rather than a working tool — even if technically functional — fails the test. The platform earns trust by working, not by presenting well.

---

## 4. The Bones Brief — What Spock Provides

When Spock invokes Bones in a Crew Order, element 3 (Bones Brief) must include:

```
BONES BRIEF

What is being reviewed:
[Screen name / notification type / printed artefact / copy element]

Who will encounter this:
[Cell Steward / Node Admin / General member / Regional Steward /
 Grounder / First-time user]

Context of encounter:
[When and why does this person see this? What state are they in?
 What do they know already? What are they trying to do?]

Emotional target:
[How should they feel after encountering this? What should change
 for them?]

Anti-patterns to avoid:
[What specific failure modes has the Bridge already identified
 for this build?]

Brand references:
[Specific sections of docs/brand-palette-v1.0.md applicable here.
 Colour tokens, type scale, specific design principles.]

Pillar context (if applicable):
[Which pillar(s) does this build serve? What does the pillar
 colour signal in this context?]

Language context:
[Which languages does this build serve at review time?
 English only / English + Afrikaans / English + Afrikaans + isiZulu.
 Bones reviews all populated language versions, not English alone.]
```

---

## 5. The BONES_VERDICT.md Format

Every Bones review produces a `BONES_VERDICT.md` committed to the repo root. If multiple screens are reviewed in one session, each gets a clearly separated section within a single verdict file, timestamped.

```
# BONES VERDICT
**Date:** [date]
**Build:** [Crew Order ID + what was reviewed]
**Languages reviewed:** [e.g. English + Afrikaans]
**Status:** PASS / CONDITIONAL PASS / FAIL

---

## Q1 — Is it human?
[Bones' assessment — specific, evidence-based, not generic]

## Q2 — Is it clear on first encounter?
[Assessment + specific line/element references where it fails]

## Q3 — Does it reduce anxiety?
[Assessment]

## Q4 — Would a stretched Cell Steward trust it on first use?
[Assessment]

## Q5 — Does it respect time and dignity?
[Assessment]

## Q6 — Does it communicate without relying on text?
[Assessment — describe what the screen communicates with text
 covered. Name specific elements that carry or fail to carry
 meaning visually.]

---

## VERDICT

**PASS** — O'Brien may build from this. No changes required.

OR

**CONDITIONAL PASS** — O'Brien may build with the following
mandatory changes applied before merge:
- [Change 1 — specific, actionable]
- [Change 2 — specific, actionable]

OR

**FAIL** — Build is halted. Return to the brief with the
following issues resolved before re-invoking Bones:
- [Issue 1 — specific, explains why it fails the test]
- [Issue 2 — specific]

Captain override available: if Captain overrides a FAIL,
document the reason here before O'Brien proceeds.

---

## CREW ORDER ISSUED
[What specific instruction follows from this verdict — to O'Brien
 if PASS or CONDITIONAL PASS, or back to Spock if FAIL]

**BONES VERDICT SIGNED**
```

---

## 6. The First Bones-Gated Build for ResilientSA

The first deliverable requiring Bones Protocol review is the **clickable prototype** — the artefact you carry into a Cape Town community hall rather than a pitch document.

**Three screens, in priority order:**
1. **The Trade Exchange** — the core gift/need listing and match experience. This is the platform's primary value proposition made tangible. A Cell Steward must be able to understand and use this without any explanation in a 10-minute community meeting.
2. **The Community Marketplace ("Get Support")** — how a community finds and requests Programme Offerings. Must feel like browsing for help, not navigating a directory.
3. **The Cell Steward Dashboard** — the needs radar, member list, and network summary a Steward sees on their phone. Must give clarity at a glance, not demand interpretation.

**This prototype is NOT a full working app.** It is a clickable design in Claude Design (McCoy's domain), built from the brand system in `docs/brand-palette-v1.0.md` and the Claude Design onboarding brief in `docs/claude-design-onboarding-brief.md`, validated by the Bones Protocol, and then handed to O'Brien as the design specification for the actual PWA build.

**The Bones review for the prototype** uses the following Bones Brief:

```
BONES BRIEF — Clickable Prototype v1

What is being reviewed:
Three-screen clickable prototype: Trade Exchange, Community
Marketplace ("Get Support"), Cell Steward Dashboard.

Who will encounter this:
A Cell Steward or community leader in a Cape Town RA or CPF
meeting, seeing the platform for the first time on a phone.
Present in the room: other community members. Time available:
approximately 10 minutes.

Context of encounter:
The person has been through development theatre before. They
have been promised things that didn't materialise. They are
not hostile, but they are not credulous. They want to see
something real, not a presentation. They are busy. They
have a phone.

Emotional target:
"Oh, I see what this does." Followed by: "Could we use this
for [specific thing they already care about]?" Not: "This
looks nice." Nice is not enough. Useful is what matters.

Anti-patterns to avoid:
- Any screen that requires reading before acting
- Any label that uses platform jargon without translation
- Any flow that could be mistaken for a government form or
  NGO survey
- Anything that feels like it was designed for Cape Town's
  tech scene rather than Cape Town's communities
- Any onboarding or sign-up gate before the person can see
  the actual product
- Any design that communicates meaning only through text —
  pillar colour and icon must carry the meaning independently

Brand references:
docs/brand-palette-v1.0.md — full Living Soil palette.
Ubuntu font for headings. Inter for body. Baobab Bark on
Canvas Grey base. Pillar colours for tags and states.
No pure black or white. No corporate blue. No charity green.

Pillar context:
The Trade Exchange and Marketplace must make the Six Pillars
visible and immediately understandable as the organising
structure — without explaining what a "pillar" is. The visual
design carries the meaning; the word "pillar" may not appear
at all in the prototype.

Language context:
English only for the prototype review. Afrikaans translations
are wired in ORDER 002 — Bones reviews both language versions
from ORDER 004 onward when real copy exists.
```

---

## 7. What Happens After a Verdict

**PASS:** Spock includes the `BONES_VERDICT.md` reference in the relevant Crew Order section and O'Brien builds from the approved design. The verdict file stays in the repo as the permanent design decision record.

**CONDITIONAL PASS:** The mandatory changes are applied by McCoy (in Claude Design) before O'Brien builds. O'Brien does not build from a Conditional Pass until the changes are confirmed applied and the updated design is committed.

**FAIL:** Build halts. Spock revises the brief and re-invokes Bones. Captain may override with documented reason — but the override itself is recorded in `BONES_VERDICT.md`, not silently bypassed.

**One verdict per build, not per session.** If O'Brien makes a significant change to a human-facing element during the build that was not in the original Bones-reviewed design, a new invocation is required — not a check-in, not a verbal approval.

**Language versioning:** from ORDER 004 onward, Bones reviews all populated language versions — not English alone. A design that passes in English but fails in Afrikaans is a CONDITIONAL PASS with Afrikaans corrections required before merge.

---

*ResilientSA Bones Protocol v1.1 | Bridge Document | Updated: six-question test, Q6 Visual Language Independence, language versioning in verdict format | For Bridge, Studio, and Engine Room Use*
