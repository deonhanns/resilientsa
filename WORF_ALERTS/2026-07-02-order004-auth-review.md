# Alert: CREW-ORDER-004 Auth Security Review — CONDITIONAL PASS
**Date:** 2026-07-02
**Severity:** Low — 4/5 checks pass, 1 requires acknowledgment
**Build/Spec Reviewed:** CREW-ORDER-004 authentication flow
**Protocol Violated (if any):** None

## Finding

Worf security review of the ORDER 004 authentication system. Five checks conducted against live running server:

| # | Check | Result |
|---|---|---|
| 1 | Phone number never logged in plaintext | ⚠️ CONDITIONAL — sandbox fallback `console.log` outputs OTP + phone number. This is in a `if (process.env.NODE_ENV !== 'production')` guard and is standard for sandbox development where SMS delivery is restricted. Production (`NODE_ENV=production`) will not log. Acceptable for merge with acknowledgment. |
| 2 | Session tokens stored in IndexedDB only | ✅ `src/lib/session.ts` uses `idb` with `openDB('resilientsa')` — never localStorage. `api.ts` reads token via `getSession()` from IndexedDB. |
| 3 | OTP codes expire server-side after 10 minutes | ✅ `storeCode` sets `expiresAt = new Date(Date.now() + 10 * 60 * 1000)`. `verifyCode` checks `gt(otpCodes.expiresAt, new Date())`. |
| 4 | OTP codes are single-use | ✅ `verifyCode` deletes the OTP immediately after successful verification. Replay impossible. |
| 5 | AT API key in env vars only — never hardcoded | ✅ `AT_API_KEY`, `AT_USERNAME` in Vercel env (production). `.env.local` excluded from git. `.env.example` has placeholder values only. |

### Additional observations
- Phone number encrypted with AES-256-CBC before storage in `users.phone_number` (bytea column)
- Phone hash for OTP lookup uses HMAC-SHA256 — one-way, cannot reverse to phone number
- Session tokens are UUIDv4 — cryptographically random, not sequential
- Session middleware validates expiry server-side on every protected route call
- No PII in API response bodies — only `session_token`, `user_id`, `role`

### Risk acknowledged
The sandbox console.log of OTP codes is a development convenience. In production, this path is guarded by `NODE_ENV !== 'production'`. Sandbox credentials themselves are limited to whitelisted numbers. Risk is Low.

## Captain Notified
☐ No — below threshold for immediate escalation

## Resolution
☑ Resolved — Conditional Pass. Merge with acknowledgment that sandbox OTP logging is development-only and must not ship to production.

**Worf sign-off: CONDITIONAL PASS — merge when sandbox logging condition acknowledged.**
