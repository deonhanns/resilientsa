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

*Patterns are added after each escalation resolution. O'Brien reads before every session.*
