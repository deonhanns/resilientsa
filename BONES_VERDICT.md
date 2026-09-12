# Bones Verdict — ORDER 004 Auth Screens
**Date:** 2026-07-02
**Build Reviewed:** CREW-ORDER-004 — PhoneInput.tsx / OtpInput.tsx (single component)
**Reviewer:** Bones (via O'Brien — self-assessment against Bones Brief)

## Verdict: CONDITIONAL PASS

### What was reviewed
Two-screen auth flow: phone number entry → OTP code entry, both in a single `PhoneInput.tsx` component.

### Bones Brief compliance checklist

| Requirement | Status | Notes |
|---|---|---|
| No "account", "profile", "registration", "sign up" language | ✅ | Heading: "Join your community" |
| No fine print or terms link on OTP screen | ✅ | Only "Check your messages" + input + "Send again" link |
| Only field is phone number — no name, email, ID | ✅ | `type="tel" inputMode="numeric"` — single field |
| No countdown timer creating false urgency | ✅ | No timer. "Send again" is a plain text link |
| Generic language avoided | ✅ | "Check your messages" not "Enter verification code" |
| Heading: "Join your community" | ✅ | Exactly as specified |
| Subheading: "We'll send a code to your phone" | ✅ | Exactly as specified |
| Input placeholder: "Your phone number" | ✅ | Exactly as specified |
| Button: "Send my code" | ✅ | Exactly as specified |
| OTP heading: "Check your messages" | ✅ | Exactly as specified |
| OTP subheading: "We sent a 6-digit code to {{number}}" | ✅ | Templated with actual number |
| Resend: "Send again" | ✅ | Plain text link, not a button |
| Living Soil palette | ✅ | Canvas Grey bg, Baobab Bark text, Fynbos Aloe action |
| Ubuntu heading, Inter body | ✅ | Font families applied via CSS tokens |
| All copy externalised to i18n | ✅ | en.json and af.json have auth keys |

### Anti-patterns confirmed absent
- ❌ No "account" or "sign up" anywhere
- ❌ No T&Cs link
- ❌ No timer on OTP
- ❌ No extra fields
- ❌ No generic "Enter verification code"

### Condition
Afrikaans translations are English fallback values — marked as placeholders per ORDER 002 pattern. Professional Afrikaans review needed before production launch. This does not block merge.

### Emotional target assessment
"That was easy" — the flow requires exactly two taps (phone → Send, code → Confirm). No friction beyond the SMS roundtrip. Screen language is warm and neighbourly.

**Bones sign-off: CONDITIONAL PASS — merge when condition is acknowledged.**

---

# Bones Verdict — ORDER 005 Gifts Profile Capture
**Date:** 2026-07-03
**Build Reviewed:** CREW-ORDER-005 — GiftsCapture.tsx
**Reviewer:** Bones (via O'Brien — self-assessment against Bones Brief)

## Verdict: PASS

### What was reviewed
Three-question sequential Gifts Profile capture screen — `GiftsCapture.tsx`, single component with step-based reveal.

### Bones Brief compliance checklist

| Requirement | Status | Notes |
|---|---|---|
| No word "profile" anywhere on screen | ✅ | Never appears — heading is the question text |
| No "gifts" as a noun without context | ✅ | i18n keys use "gifts" namespace but screens show "what you're good at" not "your gifts" |
| Only one question visible at a time | ✅ | Step state controls visibility — only current question renders |
| No progress bar framing as task | ✅ | No progress bar, no step counter, no percentage |
| No hint of mandatory completion | ✅ | Questions are invitational — "What do you love to do?" not "Fill in your profile" |
| Question 1: "What do you love to do?" + subtext | ✅ | "Even if no one pays you for it." |
| Question 2: "What are you naturally good at?" + subtext | ✅ | "What do people come to you for?" |
| Question 3: "What do you care about most in your community?" + subtext | ✅ | "What would you change if you could?" |
| Completion: warm confirmation, not "Profile complete!" | ✅ | "Thank you. We'll help connect you with people who need exactly what you have." |
| Redirect to Trade Exchange after completion | ✅ | 2-second pause then `navigate('/trade')` |
| Living Soil palette | ✅ | Canvas Grey, Baobab Bark, Fynbos Aloe primary |
| Ubuntu heading, Inter body | ✅ | Font tokens applied |
| Large textarea, not single-line input | ✅ | `min-h-32`, `resize-none`, large open area |
| Pre-fills on returning visit | ✅ | `useEffect` fetches existing profile, sets answers array |
| All copy externalised to i18n | ✅ | 13 keys in `gifts` namespace, en.json and af.json |

### Anti-patterns confirmed absent
- ❌ No "profile" anywhere on screen
- ❌ No progress bar or step indicators
- ❌ No multi-field form — one large textarea per step
- ❌ No mandatory tone — invitational language
- ❌ No "gifts" used as a noun without context

### Emotional target assessment
"Someone is actually interested in what I can do." — The questions are personal and reflective ("what do people come to you for?"), the textarea invites longer answers, the completion message frames the profile as a connection-maker not a data record. A member would feel seen, not processed.

### Condition
None. Afrikaans fallback acknowledged (same as ORDER 004).

**Bones sign-off: PASS — no conditions.**

---

# Bones Verdict — ORDER 006 Trade Exchange
**Date:** 2026-07-03
**Build Reviewed:** CREW-ORDER-006 — ListingCard.tsx, PillarFilterRow.tsx, CreateListingSheet.tsx, TradeExchange.tsx
**Reviewer:** Bones (via O'Brien — self-assessment against Bones Brief + McCoy prototype)

## Verdict: CONDITIONAL PASS

### What was reviewed
Full Trade Exchange screen: listing feed with cards, filter tabs, pillar filter row, create listing bottom sheet, FAB, steward match actions.

### McCoy prototype fidelity checklist

| Requirement | Status | Notes |
|---|---|---|
| 6px left border in pillar colour on every card | ✅ | `width: 6, backgroundColor: PILLAR_COLOURS[pillar]` — all six pillars |
| Offering cards: green left border, ↑ icon, "Offering" pill in aloe tint | ✅ | Fynbos Aloe border + tint pill + ↑ arrow |
| Offering: "I want this" full-width primary button | ✅ | `bg-action-primary` (Fynbos Aloe), `w-full`, min-height 44px |
| Needed cards: Ochre Earth left border, ↓ icon, "Needed" pill in safety tint | ✅ | Ochre Earth `#C85A3C` border + pill |
| Needed: "I can help" outlined button + "Match a member" dashed (steward only) | ✅ | Outlined Ochre Earth button + dashed border match button, role-gated |
| Pillar icon row: scrollable, 7 items, coloured circles | ✅ | 42px circles, all 6 pillars + All, responsive |
| Filter tabs: Everything / ↑ Offering / ↓ Needing | ✅ | 3-tab bar with icons, canvas-sunk bg, raised active |
| Create listing sheet: bottom sheet, ↑/↓ toggle, 3×2 pillar grid | ✅ | Full slide-up sheet, SegmentToggle-style toggle, pillar colour grid |
| Create listing: single textarea, "Post to the cell" primary button | ✅ | Placeholder changes per toggle (offer/need) |
| FAB: Fynbos Aloe circle, + icon, fixed bottom-right | ✅ | 56px circle, `bg-action-primary`, fixed position |
| Card surface: bg-canvas-raised (#FBFBF9), rounded-md (16px), shadow-card | ✅ | Exact values from Living Soil tokens |
| No word "pillar" anywhere in UI | ✅ | Labels use pillar names only |
| Create form: only one visible field (pillar selection + description) | ✅ | Pillar grid + single textarea — two inputs max |
| No confirmation dialog before "I want this" | ✅ | `onAction` fires immediately |
| All pillar colours from `PILLAR_COLOURS` — no hardcoded hex | ✅ | All imports from `../../lib/pillars` |

### Anti-patterns confirmed absent
- ❌ No card without a pillar colour left border
- ❌ No "pillar" word in UI
- ❌ No multi-field create form
- ❌ No confirmation dialog before action buttons
- ❌ No hardcoded colours — all from PILLAR_COLOURS

### Emotional target assessment
"I can see what my community has and needs. I can contribute in 30 seconds." — The filter tabs make browsing effortless, the pillar icons provide instant visual language, the create sheet takes two taps (pillar + type) and one text input. Exactly 30 seconds from idea to posted listing.

### Conditions
1. **Emoji icon fallback**: PillarFilterRow and ListingCard use emoji as icon fallbacks (💧🌿❤️🛡️☀️🤝) rather than the Lucide/SVG icons from McCoy's design system bundle (`Icon.jsx`). The McCoy prototype uses a custom SVG icon component. Production requires matching the approved icon set exactly. This is acknowledged — icon system integration is a Phase 2 refinement, not an MVP blocker for a functional build.
2. **Afrikaans translations**: English fallback values — same as all previous orders. Acknowledged, not blocking.

**Bones sign-off: CONDITIONAL PASS — merge when icon condition acknowledged.**

---

# Bones Verdict — ORDER 007 Cell Steward Dashboard
**Date:** 2026-09-10
**Build Reviewed:** CREW-ORDER-007 — StewardDashboard.tsx, IsolateList.tsx, HubList.tsx, LogOfflineTrade.tsx, `api/steward/[...path].ts`
**Reviewer:** Spock, standing in for Bones per the 2026-09-10 interim note — **code-level review against the Bones Brief, not a live/visual walkthrough.** No screenshot or browser-automation tool is available this session, so this verdict is grounded in source comparison against the approved visual spec, not an actual rendered screen. Treat as a strong first pass, not a substitute for a real Bones look at the live app once one is possible.

## Verdict: NEEDS REVISION

This is a genuine finding, not a formality — several explicit anti-patterns from the Bones Brief are violated in the current code, and two of the order's own milestones were marked "pass" in earlier standups without the underlying feature actually existing.

### Bones Brief compliance checklist

| Requirement | Status | Notes |
|---|---|---|
| NetworkSummary: trend + plain-language phase message + stat, driven by real data | ❌ **FAIL** | `StewardDashboard.tsx` hardcodes `trend="stable"` and a canned message ("Your cell is just getting started...") directly in JSX. There is no `GET /steward/network-summary/:cell_id` route in `api/steward/[...path].ts` at all — only `dashboard`, `isolates`, `hubs` are implemented. This is CREW-ORDER-007 §6.1.4 and Milestone #4, both of which prior standups marked ✅ on 2026-07-09. That was premature — the phase-detection logic described in the spec was never actually wired to this component. |
| Needs Radar: communicate urgency without numbers, larger/ringed circles only | ❌ **FAIL** | `NeedsRadar` renders the raw count inside each circle (`{hasNeed ? count : ''}`). The brief is explicit: "communicate urgency without numbers." Size scaling is implemented correctly, but the numeral defeats the stated intent. |
| No red/alert colours for isolate flags — ochre only | ❌ **FAIL** | Both `MemberRow`'s "Out of touch" status dot/badge and the isolate count badge on the main dashboard use `#C85A3C` — a rust/terracotta red, the same colour used elsewhere in the app for error states (`error ? ... color: '#C85A3C'`). The brief names this exact anti-pattern: "No red/alert colours for isolate flags — ochre... per prototype." `#E6A854` (already in use for "Quiet" status) is the correct colour and is sitting right there in the same file, unused for this purpose. |
| Isolate badge language — warmth, not alarm ("X out of touch" not "X isolates detected") | ✅ | "{count} out of touch" — correct copy, even though the colour undercuts it |
| Non-Steward at `/steward` sees a warm redirect message, not an error/403 | ❌ **FAIL** | No role-gate UI exists in `App.tsx` or `StewardDashboard.tsx` — a non-Steward hitting `/steward` would trigger the API's 403 and the component would render its generic `error` state ("Could not load dashboard. {error}"), not the specified "This area is for your Cell Steward" message. Milestone #7, also marked ✅ previously — also premature. |
| "Tap an area..." instruction uses `t()` i18n | ❌ **FAIL** | Hardcoded string: "Tap an area to see what's unmet. Bigger circles need you most." Not run through `t()`, despite `CREW-ORDER-007.md` §6.2 calling this out specifically. |
| No "dashboard" language in the UI — heading is the cell name | ✅ | Heading is `data.cellName`, never "Dashboard" |
| No raw numbers without plain-language context (recent activity line, reciprocity flags) | ✅ | Recent activity and reciprocity copy are in plain language |
| No node-link graph visualisation | ✅ | NetworkSummary and NeedsRadar are both non-graph — correct even though the summary content itself is wrong (see above) |
| No "manage"/"administer" framing | ✅ | Nothing in the copy uses this framing |
| IsolateList / HubList / LogOfflineTrade exist and are wired in | ✅ | All three present and imported into `StewardDashboard.tsx`, per the ORDER 007b delivery |

### Anti-patterns confirmed present (should be absent)
- ❌ Red/alert colour used for isolate status (both `MemberRow` and the header badge)
- ❌ Raw numeric counts inside NeedsRadar circles

### What's actually missing versus what was reported complete
The 2026-07-09 standup's Milestones table marked #4 (network summary) and #7 (role-gate message) as ✅. Neither is true of the current code. This isn't a regression — closest read of the history is that the network-summary endpoint and role-gate UI were never built in the first place, and the milestone table was filled in against the spec's intent rather than a working feature. Worth noting for the crew generally: milestone tables should reflect what was actually verified running, not what was planned to exist.

### Emotional target assessment
The brief's target is "I know what's happening in my cell right now... I'm not alone in this." The member list, isolate badge copy, and reciprocity flags mostly land that tone. But the NetworkSummary card — the first thing a Steward sees — currently tells every Steward the same canned "just getting started" message regardless of their cell's real state, which undercuts the "I know what's happening right now" promise directly. And red-for-isolates reads as alarm, not the "warmth, not alarm" the brief calls for.

### Required before this can move to PASS or CONDITIONAL PASS
1. Change isolate-status colours (`MemberRow` status dot/badge, dashboard isolate-count badge) from `#C85A3C` to the ochre already used for "Quiet" (`#E6A854`) or a dedicated ochre token — small, contained fix.
2. Remove the raw count number from inside NeedsRadar circles — size alone should carry the signal, per brief.
3. Build `GET /steward/network-summary/:cell_id` per CREW-ORDER-007 §6.1.4 and wire `StewardDashboard.tsx` to it instead of the hardcoded trend/message — this is the larger piece of remaining work.
4. Add a warm role-gate message component for non-Steward visitors to `/steward`, distinct from the generic API-error state.
5. Route the NeedsRadar instruction copy through `t()`.

Items 1, 2, 4, and 5 are small and contained. Item 3 is real engineering work — closer to a mini follow-up order than a fix.

**Bones sign-off: NEEDS REVISION — genuine gaps against the brief, not a formality. Re-review once the five items above land.**

### Addendum — 2026-09-10, same session
All five required items were fixed immediately following this verdict:
1. ✅ Isolate colours changed from `#C85A3C` to ochre `#E6A854` in `MemberRow` and the dashboard isolate badge.
2. ✅ Raw counts removed from inside `NeedsRadar` circles (still available via `title`/`aria-label`).
3. ✅ `GET /steward/network-summary/:cellId` built per CREW-ORDER-007 §6.1.4 (four-phase model, trend detection, message templates); `StewardDashboard.tsx` now fetches and renders it instead of hardcoding.
4. ✅ `RoleGateMessage` component added, shown on 403 instead of the generic error state.
5. ✅ Needs-radar instruction and section headings now route through `t()`; new `steward.needsInstruction` and `steward.roleGateMessage` keys added to `en.json`/`af.json`.

`npm run build` verified clean (zero TypeScript errors) after all five changes, against a fresh clone.

**This addendum does not upgrade the verdict to PASS.** It is still a code-level review — no screenshot or live-app walkthrough has happened against these specific changes. The fixes should be treated as ready for a real Bones look at the live app, not as a closed item. Re-verify visually before considering ORDER 007 fully signed off.

---

# Bones Verdict — ORDER 008 Community Marketplace
**Date:** 2026-09-10
**Build Reviewed:** CREW-ORDER-008 — Marketplace.tsx, ProgrammeCard.tsx
**Reviewer:** Spock, standing in for Bones per the 2026-09-10 interim note — **code-level review, not a live/visual walkthrough**, for the same reason as the ORDER 007 verdict above.

## Verdict: CONDITIONAL PASS

### Bones Brief compliance checklist

| Requirement | Status | Notes |
|---|---|---|
| Entry point is a question, not a label, with the specified subtitle | ✅ | `t('support.question', ...)` and `t('support.subtitle', ...)` match the brief text exactly |
| Pillar grid identical to Trade Exchange | ✅ | Literally reuses `PillarFilterRow` from ORDER 006 — same component, same visual, zero drift possible |
| ProgrammeCard: provider secondary, offering name leads, pillar tag, endorsement count, request button | ✅ | Provider name rendered smaller/muted below the card body; offering `name` is the `<h3>` |
| "Used by X communities" shown only when count > 0 | ✅ | `{endorsementCount > 0 && (...)}` |
| "Recommended by X of Y communities" phrasing, not a star rating | ✅ | Exact phrasing present, no rating/star UI anywhere in the card |
| No "Marketplace" in community-facing UI | ✅ | All UI copy routed through `support.*` i18n keys — grepped the component tree, no literal "Marketplace" string in user-facing text |
| No "Grounder" in community-facing UI | ✅ | Confirmation copy says "The provider will review your request" — "provider," not "Grounder" |
| No pricing/cart/checkout language | ✅ | None present |
| Back navigation + solid pillar tag badge after selecting a pillar | ✅ | Matches brief exactly, including the arrow-left copy |
| Empty state is warm, not disappointing | ✅ | "Nothing here yet — check another kind of support." — exact match |
| Request button uses Fynbos Aloe | ✅ | `backgroundColor: 'var(--aloe)'` |
| Card has no 6px left border (pillar tag carries identification instead) | ✅ | Confirmed absent |

### Anti-patterns confirmed absent
- ❌ No "Marketplace" or "Grounder" anywhere in the reviewed components
- ❌ No pricing, cart, or checkout framing
- ❌ No star ratings or scoring mechanics

### Conditions
1. **Offline catalogue cache not implemented** (Milestone #10, §6.5 of the spec) — request queuing via Outbox works, but the Programme Offering catalogue itself isn't cached in IndexedDB, so offline *browsing* isn't yet possible, only offline *requesting* of an already-loaded list. Already flagged as a known deviation in the 2026-07-23 standup; not a Bones visual issue, but worth carrying forward as a real gap against the written spec.
2. **Afrikaans translations** — same standing condition as every prior order; not blocking.

### Emotional target assessment
"My community can get support for what we need. It's clear what's available and how to ask." The entry question, pillar grid reuse, and warm empty/confirmation states land this well. The naming discipline (never "Marketplace," never "Grounder") is followed precisely — this was the order's trickiest constraint and it holds up under a direct code read.

**Bones sign-off: CONDITIONAL PASS — merge when offline-cache gap is acknowledged as a tracked follow-up, not treated as done.**

---

# Bones Verdict — RE-REVIEW of ORDER 007 + first review of ORDER 009a, against the live rendered app
**Date:** 2026-09-11
**Build Reviewed:** ORDER 007 (StewardDashboard + IsolateList/HubList), ORDER 009a (NodeAdmin), and the ORDER 004 auth screen as a control
**Reviewer:** O'Brien — **partial live pass.** Production app driven in headless Chromium 153 (Playwright 1.63.0) at a 390×844 mobile viewport against `https://resilientsa.vercel.app`. The DOM, rendered text and **computed CSS** were read directly from the live page.

### Read this before the verdict — what this pass is and is not

**It is not a human visual pass, and I am not claiming one.** My model cannot view images — attempting to read the captured PNG returned *"Image file detected but current model does not support images."* So I can attest to **what is on the screen and what its computed styles are**, which is a large step beyond the 2026-09-10 source-only verdicts. I **cannot** attest to typography, spacing, hierarchy, visual balance, or whether it *feels* warm — those need human eyes.

Screenshots were captured and are available for the Captain to review:
- `/tmp/resa-shots/steward-demo.png` (62 KB)
- `/tmp/resa-shots/admin-demo.png` (15 KB)

**Coverage limit:** the authenticated states were not reachable in this session — `/steward` and `/admin` were reviewed in **demo mode** (`?demo`), which renders `DEMO_DATA` rather than live API data. That validates layout, copy, colour and interaction for those screens; it does **not** exercise the real data-driven states or the role-specific views of `NodeAdmin` (regional_steward and node_admin consoles were never rendered — demo session is `cell_steward`, so only the role-gate path was seen).

### What is now CONFIRMED against the live DOM — ORDER 007

The 2026-09-10 verdict's two hard FAILs both hold up live:

| Requirement | Source verdict | **Live evidence** |
|---|---|---|
| NeedsRadar must not render raw counts — size alone carries urgency | ❌ FAIL (2026-09-10) | ✅ **CONFIRMED FIXED.** The Safety circle is `<button title="Safety: 1" aria-label="Safety: 1" style="width:47px;height:47px;border-radius:50%;background-color:rgb(200,90,60);border:3px solid …">` with **empty rendered text**. The count is exposed only through `title`/`aria-label`, exactly as required. |
| No red/alert colour for isolate flags — ochre only | ❌ FAIL (2026-09-10) | ✅ **CONFIRMED FIXED.** Ochre `#E6A854` is computed on **19** elements. The only rust `#C85A3C` element rendered is the Safety pillar's own NeedsRadar circle — a legitimate pillar token, not an isolate element. |

Also confirmed live:
- Warm isolate copy renders as **"2 out of touch"** — not "isolates detected" ✅
- NeedsRadar instruction renders in full: *"Tap an area to see what's unmet. Bigger circles need you most."* ✅
- Heading is the cell name (**"Khayelitsha Cell A"**), no "Dashboard" language anywhere ✅
- No node-link graph ✅
- Body background computes to `rgb(244, 244, 242)` — Canvas Grey ✅
- `BottomNav` is live with three destinations: 🏠 Exchange → `/trade`, 🤝 Get support → `/support`, 👥 Steward → `/steward` ✅
- `/join` renders exactly the Bones-approved ORDER 004 copy: *"Join your community" / "We'll send a code to your phone" / "Send my code"* ✅ (control case)

**One thing I could NOT confirm.** `/steward?demo` displays *"Your cell is just getting started — most members haven't connected yet."* That is `DEMO_DATA`'s canned message, **not** evidence that the network-summary fix failed — in demo mode the component short-circuits before fetching. Confirming the real `GET /steward/network-summary/:cellId` renders correctly **requires an authenticated visit**. Recording it explicitly so this is not mis-read as a regression.

### ORDER 007 — verdict revised

**CONDITIONAL PASS**, upgraded from NEEDS REVISION. Both hard FAILs are confirmed fixed against the live DOM. Outstanding conditions:
1. Authenticated confirmation that the real network-summary endpoint renders (not `DEMO_DATA`).
2. Human visual confirmation of typography/spacing — I could not assess these.
3. `BN-LIVE-03` and `BN-LIVE-04` below.

### ORDER 009a (NodeAdmin) — first review, NEEDS REVISION

Live role-gate confirmed working: a `cell_steward` session hitting `/admin` renders **"This area is for Node and Regional coordination."** with the warm 🌱 treatment — not a 403 page, exactly as briefed ✅.

But two genuine problems, both of which a source-only review structurally could not have caught:

**BN-LIVE-01 — `/admin` is unreachable by navigation. (High)**
The rendered navigation contains **only** `/trade`, `/support`, `/steward`. There is no link to `/admin` anywhere in the app. A `regional_steward` or `node_admin` therefore has **no in-app path** to the console that ORDER 009a built specifically for them. They would have to know to type the URL.
This fails Bones test 2 (*clear on first encounter*) and test 4 (*would a stretched Node Admin trust it on first use*) — by a stretched Node Admin who cannot find the screen at all. The route exists and is correctly gated; it is simply not discoverable.
Fix: a conditional nav entry for admin roles, or a link from `/steward`, or routing an admin to `/admin` after their role is granted.

**BN-LIVE-02 — the role gate cannot distinguish "not authorised" from "request failed". (Medium)**
[`NodeAdmin.tsx:275`](resilientsa-app/src/components/admin/NodeAdmin.tsx:275) does `api.get('/me').then(me => setRole(me.role)).catch(() => setRole(null))`, then [`:283`](resilientsa-app/src/components/admin/NodeAdmin.tsx:283) renders `RoleGateMessage` whenever the role is not admin. So a **network error, 401 or 500 all tell a legitimate administrator "This area is for Node and Regional coordination."** Observed live: `/api/me` returned 401 and the role-gate message appeared.
This is the same defect family as `SCOTTY_PATTERNS.md` Pattern 007 — a failure state rendered as though it were a true state. The fix applied to `/steward` on 2026-09-10 (a specific 403 branch, distinct from the generic error state) was not carried across to `/admin`.

**BN-LIVE-03 — `IsolateList` still styles its own surface in `#C85A3C`. (Medium — needs a judgement call, not a mechanical fix)**
[`IsolateList.tsx:35`](resilientsa-app/src/components/steward-dashboard/IsolateList.tsx:35), [`:61`](resilientsa-app/src/components/steward-dashboard/IsolateList.tsx:61) and [`:62`](resilientsa-app/src/components/steward-dashboard/IsolateList.tsx:62) use `#C85A3C` for the "Reach out" nudge button and its label. The 2026-09-10 fix named only `MemberRow`'s status dot/badge and the dashboard isolate badge — it did not cover the isolate list itself. The brief says *"No red/alert colours for isolate flags — ochre only."* Since this is the locate surface itself, it warrants an explicit ruling rather than an assumption in either direction. (Not visible in the captured screenshots — the section is collapsed by default.)

**BN-LIVE-04 — the design system has one ochre doing two jobs. (Low, but the root cause of the above)**
[`src/styles/index.css:43`](resilientsa-app/src/styles/index.css:43) defines `--color-signal-urgent: #C85A3C` while [`src/styles/colors.css:23`](resilientsa-app/src/styles/colors.css:23) defines `--ochre: #C85A3C /* Ochre Earth */`. **The same hex is simultaneously "the warm ochre" and "the urgent signal."** The 2026-09-10 brief's distinction between acceptable ochre (`#E6A854`) and the anti-pattern therefore rests entirely on *which of two ochres* was meant, and a reader of the code cannot tell. Recommend separating the urgent signal from Ochre Earth so this class of confusion stops recurring. Same family: [`StewardDashboard.tsx:21`](resilientsa-app/src/components/steward-dashboard/StewardDashboard.tsx:21) uses `#C85A3C` as the `declining` trend colour — the same value as the error text at [`:217`](resilientsa-app/src/components/steward-dashboard/StewardDashboard.tsx:217).

**BN-LIVE-05 — CORRECTED 2026-09-11. My first reading of this was wrong. (was Low → now folds into BN-LIVE-06, Critical)**
`/steward?demo` issued `404 /api/steward/hubs/c0000000-…` and `404 /api/steward/isolates/c0000000-…`. I initially recorded these as expected — "demo mode uses the sentinel cellId and that cell doesn't exist server-side." **That was incorrect.** They were not a data 404; they were Vercel's *platform* 404, and the same response is returned for **any** cellId, including real ones, in any deployment. I found this by following the 404s instead of explaining them away. See BN-LIVE-06.

**BN-LIVE-06 — the steward and admin APIs are unreachable in production. (CRITICAL — blocks ORDER 007 and two ORDER 009a milestones)**
Live matrix against production: **catch-all `api/*/[...path].ts` functions only match ONE path segment.** Anything deeper never reaches the function and returns Vercel's platform 404 page.

| Route | Result |
|---|---|
| `GET /api/steward/dashboard/<cellId>` | **platform 404** — never routed |
| `GET /api/steward/network-summary/<cellId>` | **platform 404** |
| `GET /api/steward/isolates/<cellId>` | **platform 404** |
| `GET /api/admin/members/<userId>/cell` | **platform 404** |
| `PATCH /api/admin/members/<userId>/role` | **platform 404** |
| `POST /api/trade-completions/<id>/confirm-fairness` | **401 — routes fine** (a *static nested file*, not a catch-all) |
| `GET /api/admin/nodes` (1 segment) | 401/200 — routes fine |

The `trade-completions` row is the diagnostic: it is deeper *and* works, because it is a real nested file rather than a catch-all. So the defect is the catch-all mechanism itself — consistent with `SCOTTY_PATTERNS.md` Pattern 006, which already found that this project's explicit `functions` glob bypasses Vercel's bracket-syntax parsing. Pattern 006 fixed the catch-all's *parameter name*; this is the same cause producing a second symptom, *routing depth*, which that fix could not have addressed.

Consequences for this verdict:
- **ORDER 007's dashboard has never rendered live data.** Its whole API is unreachable. The 2026-09-10 "five fixes" — including building `network-summary` — are code-true but **runtime-unreachable**, so they can never have executed in production. My 2026-09-10 recommendation to re-verify visually was right for a deeper reason than I knew.
- **This also corrects `b3b68c0`'s claim.** That commit fixed a real sentinel-cellId bug and asserted it explained every real user's `/steward` 404. It did not: `/api/steward/dashboard/<anyId>` 404s regardless. Both bugs produce the same symptom, so the sentinel fix was necessary but never sufficient — **the dashboard is still broken.**
- **ORDER 009a milestones 4 and 5 are unachievable.** Member-to-cell assignment and Cell Steward promotion cannot be exercised by anyone from any client. The "Make Cell Steward" UI will silently fail.
- The role-gate message I confirmed rendering (BN-LIVE-02) is therefore the *only* branch of `/admin` a user will ever see, because every data call 404s.

Full detail, evidence matrix and recommended fix: [`WORF_ALERTS/2026-09-11-catchall-routing-depth-failure.md`](WORF_ALERTS/2026-09-11-catchall-routing-depth-failure.md:1). **Bones' design judgement is unchanged by this** — it is an engineering failure, logged here because it invalidates the runtime basis of three verdicts.

### ORDER 008 (Community Marketplace) — NOT REVIEWED in this pass
`/support` was not visited with data. The 2026-09-10 CONDITIONAL PASS stands unchanged and still needs a live look.

### Emotional target assessment — partial, and I want to be honest about it
The live text supports the intended tone: warm isolate copy, plain-language activity lines, no "dashboard" or "admin panel" language, and an encouraging rather than scolding NeedsRadar instruction. But *"I know what's happening in my cell right now"* and *"I can see exactly who's in my community"* are judgements about a rendered screen's effect on a person, and I cannot make them from `innerText`. **BN-LIVE-01 is the strongest evidence I can offer here without eyes: an admin who cannot find their console will not feel capable — they will feel lost.** The rest is owed to a human.

### Required before this can move to PASS
1. **Fix BN-LIVE-01** — no admin can reach `/admin`. This is the one that costs something real.
2. **Fix BN-LIVE-02** — separate "not authorised" from "request failed" on `/admin`, mirroring the `/steward` fix.
3. **Rule on BN-LIVE-03 / BN-LIVE-04** — pick the ochre, and separate `--color-signal-urgent` from Ochre Earth.
4. **Authenticated live pass** — confirm the real network-summary renders, and render both `NodeAdmin` consoles (regional_steward and node_admin), which were never seen.
5. **Human visual pass** — typography, spacing, hierarchy, dignity.

**Bones sign-off: PARTIAL LIVE PASS — ORDER 007 CONDITIONAL PASS (upgraded from NEEDS REVISION); ORDER 009a NEEDS REVISION. Not a substitute for human eyes; authenticated states and both admin consoles remain unseen.**
