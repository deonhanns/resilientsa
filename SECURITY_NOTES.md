# SECURITY NOTES — Accepted Risks Register
**Mission:** ResilientSA
**Custodian:** O'Brien (entries), Worf (review)
**Created:** 2026-09-11
**Companion documents:** [`WORF_ALERTS/`](WORF_ALERTS/README.md) (findings — things to *fix*), [`SCOTTY_PATTERNS.md`](SCOTTY_PATTERNS.md) (engineering patterns), [`OBRIEN_STANDUP.md`](OBRIEN_STANDUP.md) (session detail)

---

## PURPOSE — and what this file is NOT

`WORF_ALERTS/` records **findings**: things that are wrong and should be fixed. This file records **accepted risks**: things that are known, understood, assessed, and deliberately *not* being fixed right now.

The distinction matters. A finding that gets silently dropped becomes an unlogged vulnerability. A risk that gets "fixed" by someone following a tool's advice without understanding it can become a worse problem than the one it replaced. **Every entry here carries an explicit revisit trigger and an explicit "do not do this" line.**

**This file is NOT a place to park something unresolved.** Accepted risks must have been assessed. If the exposure is unknown, it belongs in `WORF_ALERTS/` as an open finding, not here. In particular: **CRIT-001** (RLS enabled but not enforced) is **not** accepted — it is an open Critical finding in [`WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md`](WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md:1) and is with Spock for a Crew Order.

---

## Accepted Risks

### AR-001 — SMTP/SMS SDK transitive dependencies carry unresolvable high advisories

| | |
|---|---|
| **Date accepted** | 2026-09-11 |
| **Accepted by** | Captain (sequencing decision 2026-09-11; does not jump the queue) |
| **Assessed by** | O'Brien |
| **Severity if realised** | High |
| **Status** | ACCEPTED — open-ended, revisit triggers below |

**What it is.** `africastalking@0.7.9` is a genuine runtime dependency, imported at [`api/_lib/at.ts:14`](resilientsa-app/api/_lib/at.ts:14) and [`server/lib/at.ts:9`](resilientsa-app/server/lib/at.ts:9). It brings in `axios@1.13.5` (30+ high advisories — SSRF via `NO_PROXY`, prototype-pollution gadgets, header/CRLF injection, credential leak across redirects), `lodash@4.17.23` and `joi@18.0.2`. Per `SCOTTY_PATTERNS.md` Pattern 005 the *constructor* is deferred into `getClient()`, but the **import itself** executes at module load — so this code is in the process for the function that handles phone numbers.

**Exposure assessment — why this is accepted rather than fixed.**
- `axios` is **never imported directly** by our code. It is reachable only through the SDK. (Verified: `grep -rn "from 'axios'" api server src` returns nothing.)
- The advisories of this family require attacker control of one of: a request URL, proxy configuration, or a merged config object. The SDK posts to a fixed AT base URL with a fixed request shape.
- The only user-controlled value entering this path is the **phone number** from `POST /api/auth/request-code`. It is not a URL, a header, or a config key.
- Therefore: **no exploit path identified** in the current codebase. That is a judgement about *this* usage, not a claim that the advisories are invalid.

**Why not fixed:** the only remedy `npm audit` offers is a **breaking downgrade** — `africastalking@0.7.9 → 0.7.4`. Downgrading a working SMS integration on the eve of real-member onboarding, to mitigate a non-identified exploit path, is a poor trade. Captain decision 2026-09-11: the finding does not take precedence over the role-escalation review.

**⚠ DO NOT run `npm audit fix --force` anywhere in this repository.** Its proposed resolution for the `@vercel/node` chain is `@vercel/node@5.8.26 → 4.0.0`, a **major-version downgrade** that would very likely re-break deployment. See [`SCOTTY_PATTERNS.md` Pattern 001](SCOTTY_PATTERNS.md:7): the runtime string must be exactly `@vercel/node@5.8.26`, and Vercel CLI 56.2.0 rejects other forms. This warning is repeated here deliberately because this file is the thing someone will read before running that command.

**Revisit triggers — any one of these:**
1. `africastalking` publishes a release that resolves its transitive advisories — check on each release.
2. **The usage pattern in `api/_lib/at.ts` changes** — specifically, if user-controlled data starts flowing into anything other than the message body and recipient number (e.g. a configurable endpoint, a per-request base URL, proxy settings, or a request template). That is the change that would turn this from accepted to actionable.
3. Any new direct use of `axios` in first-party code.
4. Real community-member PII starts flowing through the SMS path *and* the AT sender-ID is live — at that point re-assess, since the consequence of a header-injection or credential-leak class issue rises sharply.

**Re-assessment when triggered:** re-run `npm audit --omit=dev` and `npm ls axios lodash joi`, then either fix by SDK upgrade or re-document.

---

### AR-002 — `react-router` RSC-mode CSRF advisory, precondition absent

| | |
|---|---|
| **Date accepted** | 2026-09-11 |
| **Assessed by** | O'Brien |
| **Severity if realised** | High (in the abstract) → **not applicable as used** |
| **Status** | ACCEPTED — revisit trigger below |

**What it is.** `react-router-dom@7.18.1` → `react-router` is flagged high for *"RSC Mode CSRF Bypass Allows Action Execution Before 400 Response"*. `react-router-dom` is a direct dependency and ships to the browser.

**Exposure assessment.** The advisory requires React Router **framework/RSC mode**. This application uses **declarative mode only** — verified by inspection: [`src/App.tsx:104`](resilientsa-app/src/App.tsx:104) renders `<BrowserRouter><Routes><Route>`; imports across the app are `BrowserRouter`, `Routes`, `Route`, `Navigate`, `useSearchParams`, `useNavigate`, `NavLink`, `useLocation`. A repository-wide grep found **no** `createBrowserRouter`, `RouterProvider`, `@react-router`, or `unstable_RSC`. The precondition is absent, so the advisory does not apply to the current architecture.

**Why not fixed:** a non-breaking fix *is* available (`npm audit` reports `fixAvailable: true`), so this is not blocked on anything — it just isn't urgent. Bundling it with the next dependency-approval request is the right time.

**Revisit trigger:** adopting React Router framework mode, RSC, `createBrowserRouter`/`RouterProvider` data APIs, or any server-side rendering. At that moment this becomes live and must be fixed *before* the change ships.

---

### AR-003 — Vercel build-tooling subtree audited as production dependencies

| | |
|---|---|
| **Date accepted** | 2026-09-11 |
| **Assessed by** | O'Brien |
| **Severity if realised** | Low |
| **Status** | ACCEPTED — structural, revisit trigger below |

**What it is.** `@vercel/node` is declared in `dependencies`, not `devDependencies`. That pulls its whole build-tooling subtree (`@vercel/build-utils`, `@vercel/static-config`, `@vercel/python-analysis`, `undici`, `path-to-regexp`, `minimatch`, `tar`, `smol-toml`, `js-yaml`, `brace-expansion`) into the **production** audit as non-dev packages. This is the reason `npm audit --omit=dev` returns the same count as the full audit — all 15 high findings are "production" by declaration.

**Exposure assessment.** These packages execute in **Vercel's build pipeline**, not in the request path serving user data. `undici`'s HTTP-smuggling/header-injection family and `path-to-regexp`'s backtracking ReDoS are real advisories, but they are not reached by our handlers. Declared-production is not the same as runtime-reachable, and this entry exists so nobody repeats my own initial mis-classification in either direction.

**Why not fixed:** no non-breaking fix exists; the only remedy is the `@vercel/node@4.0.0` downgrade covered by the AR-001 warning.

**Revisit trigger:** moving `@vercel/node` to `devDependencies` (which would need verification against Vercel's build resolution), or any change that causes these packages to be reachable from a request handler.

---

## Counting convention — why the numbers differ

Recorded 2026-09-11 after reconciling an apparent 27-vs-19 contradiction.

| Tool | What it counts | Value |
|---|---|---|
| `npm audit` / `npm audit --omit=dev` | unique **vulnerable packages** (advisory × package) | **19** (4 moderate, 15 high, 0 critical) |
| `npm install` summary | **physical instances on disk**, including nested duplicates | 27 at the time, ~25 once settled |

Both figures described something real; they were not measuring the same thing. `brace-expansion` exists at three versions in the tree, `minimatch` at three, `path-to-regexp` and `qs` at two each — each duplicate instance is a separate on-disk node for the install-time summary, but a single entry for `npm audit`. **Quote 19.** Anything that quotes the install-time number as though it were an advisory count will overstate the position.

*Reproduce:* `npm audit --omit=dev` for the authoritative count; `npm audit --json` for the per-package attribution and `fixAvailable` flags.

---

## Revision history

| Date | Change |
|---|---|
| 2026-09-11 | File created. AR-001, AR-002, AR-003 registered; counting convention recorded. |

*Accepted risks are reviewed whenever a revisit trigger fires. Entries are never deleted — a risk that is fixed or expires is marked RESOLVED with a date, so the record of the decision survives.*
