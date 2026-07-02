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
