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

*Patterns are added after each escalation resolution. O'Brien reads before every session.*
