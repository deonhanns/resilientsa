# SCOTTY PATTERNS — Engineering Pattern Library
**Mission:** ResilientSA
**Custodian:** Scotty (Chief Engineer, Escalation Only)

---

## Pattern 001 — Vercel Serverless Function Deployment
**Escalation date:** 2026-07-19
**Resolved by:** Spock (runtime) + Scotty (tsconfig) + O'Brien (build)

### Problem
CREW-ORDER-007b converted Express routes to Vercel Serverless Functions in `resilientsa-app/api/`. Three consecutive deploy attempts failed:

1. `"runtime": "@vercel/node"` → Error: "Function Runtimes must have a valid version"
2. `"runtime": "@vercel/node@5"` → Same error (Vercel CLI 56.2.0)
3. `"runtime": "nodejs22.x"` → Same error

### Root Cause
Two-part issue:
1. **Runtime version format:** Vercel CLI 56.2.0 requires full semver: `"@vercel/node@5.8.26"` (including patch version). The `functions` config must be in the **root** `vercel.json` (not `resilientsa-app/vercel.json`) because the root config controls the deployment.

2. **Module resolution:** `@vercel/node@5` uses `moduleResolution: node16` internally, which requires `.js` extensions on all relative imports. Without a custom tsconfig, the Vercel build fails on import resolution.

### Resolution
1. [`resilientsa-app/vercel.json`](resilientsa-app/vercel.json): `"runtime": "@vercel/node@5.8.26"` (Spock)
2. [`resilientsa-app/api/tsconfig.json`](resilientsa-app/api/tsconfig.json): `"module": "CommonJS"`, `"moduleResolution": "node"` (Scotty)

### Key Files
- Root [`vercel.json`](vercel.json) — contains `buildCommand`, `outputDirectory`, `framework`, `rewrites`
- [`resilientsa-app/vercel.json`](resilientsa-app/vercel.json) — contains `functions` config with `runtime: "@vercel/node@5.8.26"`
- [`resilientsa-app/api/tsconfig.json`](resilientsa-app/api/tsconfig.json) — `CommonJS` module resolution for `api/` only

### Do NOT
- Put `functions` config in root `vercel.json` — Vercel CLI 56.2.0 rejects it
- Use bare `@vercel/node` or `@vercel/node@5` — requires full `@vercel/node@5.8.26`
- Use `nodejs22.x` as runtime — doesn't compile TypeScript natively
- Add `.js` extensions to all imports — the `api/tsconfig.json` with CommonJS avoids this

### Verification
- `npm run build` → zero errors (tsc ignores `api/` via `tsconfig.app.json` exclusion)
- Root symlink `api → resilientsa-app/api` for Vercel auto-detection (committed to repo)

---

## Pattern 002 — Runtime Module Type Mismatch (`exports is not defined`)
**Escalation date:** 2026-08-31
**Resolved by:** O'Brien (session ran out of credits immediately after push; verification + doc completed by Spock)

### Problem
Live API routes crashed at runtime with `ReferenceError: exports is not defined`, even though `npm run build` passed with zero errors and the deployment showed `Ready`.

### Root Cause
Pattern 001 fixed **compile-time** module resolution (`api/tsconfig.json` → `CommonJS`). This is a separate concern from **runtime** module interpretation. The root `resilientsa-app/package.json` has `"type": "module"` (needed for the Vite frontend). Node uses the nearest `package.json`'s `"type"` field to decide how to interpret *any* JS file under that directory — including `@vercel/node`'s compiled CommonJS output in `api/`. With no closer override, Node treated the CommonJS output as ESM and threw on the `exports` object CommonJS relies on.

### Resolution
Added [`resilientsa-app/api/package.json`](resilientsa-app/api/package.json):
```json
{ "name": "resilientsa-api", "private": true, "type": "commonjs" }
```
This scopes CommonJS *runtime* interpretation to `api/` only, without touching the root's `"type": "module"` (still required for `vite build`).

### Key Files
- [`resilientsa-app/api/tsconfig.json`](resilientsa-app/api/tsconfig.json) — compile-time: how `tsc`/`@vercel/node` transpiles `api/` TypeScript
- [`resilientsa-app/api/package.json`](resilientsa-app/api/package.json) — **runtime**: how Node interprets the resulting JS in `api/`
- These two must agree. A CommonJS `tsconfig.json` output run under an ESM-scoped `package.json` (or vice versa) will pass the build and still crash live.

### Do NOT
- Assume a passing `npm run build` means the deployed function will run — build success only validates compile-time settings, not the runtime module boundary
- Remove `resilientsa-app/api/package.json` or change its `"type"` without also re-checking `api/tsconfig.json` agrees
- Set `"type": "commonjs"` on the root `resilientsa-app/package.json` to "fix" this — it will break the Vite frontend build

### Verification
- Hit a live API route directly (e.g. `POST /api/auth/request-code`) post-deploy and confirm no `exports is not defined` in the response or Vercel runtime logs
- A `Ready` deployment status is necessary but **not sufficient** evidence the API layer works — always do a live route check after any change touching `api/`'s module config

---

## Pattern 003 — Silent OTP Loss on Vercel (NODE_ENV always 'production')
**Escalation date:** 2026-08-31
**Resolved by:** Spock

### Problem
`api/auth/[...path].ts`'s SMS-send fallback logged the OTP to console only `if (process.env.NODE_ENV !== 'production')`. This is dead code on Vercel: both Production **and** Preview deployments get `NODE_ENV=production` set automatically by the platform. With Africa's Talking credentials not yet configured, `sms.send()` throws, is caught, and the OTP vanishes with no way for anyone — Captain or crew — to retrieve it. The endpoint still returns `200 { message: 'Code sent' }`, so the failure is invisible.

### Resolution
Replaced the `NODE_ENV` check with an explicit opt-in: `OTP_DEBUG_LOG === 'true'`. Set this Vercel env var during pre-pilot testing to make failed-send OTPs visible in Vercel → Runtime Logs.

### Do NOT
- Rely on `NODE_ENV` to distinguish "real" deploys from testing on Vercel — it doesn't, there
- Leave `OTP_DEBUG_LOG=true` set once real Africa's Talking credentials are live and real community members are requesting codes — an OTP in logs is a live, if short-lived, credential. Unset it once `AT_API_KEY`/`AT_USERNAME` are populated and confirmed working.

---

## Pattern 004 — Module Type Boundary Doesn't Stop at `api/` (ERR_REQUIRE_ESM)
**Escalation date:** 2026-09-06
**Resolved by:** Spock

### Problem
After Pattern 002's fix (`api/package.json`), the next deploy crashed differently: `Error [ERR_REQUIRE_ESM]: require() of ES Module /var/task/resilientsa-app/src/db/index.js from /var/task/resilientsa-app/api/_lib/db.js not supported.`

### Root Cause
`api/package.json` scopes CommonJS runtime interpretation to the `api/` directory tree only. But `api/_lib/db.ts` imports from `../../src/db/index` — a **sibling** directory, not a descendant of `api/`. Node resolves a required file's module type from the nearest `package.json` to *that file's own location*, not the importing file's. For `src/db/index.js`, that nearest ancestor is the root `resilientsa-app/package.json` (`"type": "module"`) — `api/package.json` never enters into it. Same disease as Pattern 002, one directory over.

### Resolution
Added [`resilientsa-app/src/package.json`](resilientsa-app/src/package.json) with `"type": "commonjs"`, mirroring the `api/` fix for the `src/` tree. Verified every `api/` file's cross-boundary import (`grep` for `from '\.\./\.\./`) resolves to either `api/_lib/*` (covered by `api/package.json`) or `src/db/*` (covered by this new file) — no other sibling directories are reached from `api/`.

### Do NOT
- Assume fixing the module-type boundary once (Pattern 002) covers every directory the API code imports from — check **every** cross-boundary import path, not just the first one that crashes
- Add `"type": "commonjs"` to the root `resilientsa-app/package.json` instead — breaks the Vite frontend build, which needs `"type": "module"`

### Verification
- `grep -rhoE "from ['\"]\.\./\.\./[a-zA-Z0-9_/.-]+['\"]" api --include="*.ts"` — confirm every result resolves under a directory that has its own `"type": "commonjs"` `package.json`, at any depth

---

## Pattern 005 — Crash-at-Import from Eager Third-Party Client Construction
**Escalation date:** 2026-09-06
**Resolved by:** Spock

### Problem
After Patterns 002–004 fixed the module-resolution crashes, the next deploy crashed with a *different* error at the same point: `[ValidationError]: "username" is required` — before any request logic ran, and before `requestCode`'s own `try/catch` around `sms.send()` ever executed.

### Root Cause
`api/_lib/at.ts` (and its twin `server/lib/at.ts`) called `AfricasTalking({ apiKey, username })` at **module top level** — executed once, at import time, the moment Vercel loads the function. The `africastalking` SDK validates its config synchronously in the constructor and **throws** if either field is `undefined`. With `AT_API_KEY`/`AT_USERNAME` not yet configured (pre-pilot), this threw during import, killing the entire serverless function process before the handler — and its already-correct `try/catch` fallback to `OTP_DEBUG_LOG` — ever got a chance to run.

**Lesson:** a `try/catch` around the *call site* doesn't help if the *import* itself throws. Any third-party client that validates config eagerly at construction must be constructed lazily, inside a function, not at module scope — otherwise its failure mode is invisible to every caller, no matter how carefully they wrap their own call.

### Resolution
Changed `sms` from an eagerly-constructed client to a lazily-constructed one: the `AfricasTalking(...)` call now happens inside `getClient()`, called only when `sms.send()` is actually invoked. Missing credentials now throw *inside* the caller's existing `try/catch` in `requestCode`, which already falls back to `OTP_DEBUG_LOG` (Pattern 003) — no behavioural change needed at the call site.

### Do NOT
- Construct any third-party SDK client (SMS, payment, email, etc.) at module top level in `api/` or `server/lib/` if its config might be legitimately absent (e.g. pre-pilot, feature-flagged, environment-specific) — always defer construction into the function that uses it
- Assume a passing local `npm run build` or even a `Ready` Vercel deployment proves the function *runs* — this class of bug only surfaces when the function is actually invoked with real (or missing) env vars, which build-time checks can't see

### Verification
- With `AT_API_KEY`/`AT_USERNAME` unset, hit `POST /api/auth/request-code` and confirm `OTP_DEBUG_LOG` fires (visible in Vercel Runtime Logs) instead of a process crash
- Once real AT credentials are added, confirm `sms.send()` still succeeds through the lazy path (no regression)

---

*Patterns are added after each escalation resolution. O'Brien reads before every session.*
