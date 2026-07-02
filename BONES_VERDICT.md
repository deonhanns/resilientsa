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
