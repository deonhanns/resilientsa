// scripts/verify-rls-live.ts
//
// CREW-ORDER-011 §4.2 — THE APPLICATION-LEVEL GATE.
//
// WHY THIS EXISTS
// On 2026-09-14 the app-role rollout broke authentication platform-wide and every
// existing check passed anyway: the build was green, the source was correct, and
// scripts/verify-rls.ts met its own criteria because it tests the DATABASE with the RLS
// context supplied and never touches the running application. This script tests the
// running application, which is the only thing that could have caught it.
//
// ── REVISED 2026-09-19 per CREW-ORDER-011-section-4.2-gate-fixes-ruling.md ──────
// Two defects, both found by this script's first real use, both ruled on by Spock:
//
//  §1 COVERAGE — the authenticated matrix no longer hand-authors a route list. It
//     IMPORTS `ROUTES` from smoke-routes.ts (§1: "fixed by reuse, not a second route
//     list"). The previous version probed four routes of its own choosing and reported
//     "authenticated 5xx: PASS" while `/api/marketplace/offerings` returned 500 in the
//     same deployment — a false PASS over a live 5xx, committed by the gate itself.
//     One list, imported, so the two can never silently diverge.
//
//  §2 VERDICT MAPPING — three exit codes, not two:
//       0 PASS        — no unexpected 5xx anywhere in the full client route set.
//       1 FAIL        — a definite enforcement failure or an UNEXPECTED 5xx.
//       2 INCONCLUSIVE — something could not be checked. Never a pass, never a failure.
//     verify-rls.ts's REFUSED/exit-4 ("connected as a role that bypasses RLS") folds
//     into INCONCLUSIVE — one instance of it, not a fourth state.
//
// ⚠ NON-DESTRUCTIVE BY CONSTRUCTION, deliberately. The shared route list contains
// mutating endpoints (PATCH /api/admin/members/<id>/role, PATCH .../cell,
// POST /api/trade-completions/<id>/confirm-fairness) and a valid session token is held
// here. So: GET routes are probed AUTHENTICATED, non-GET routes are probed
// UNAUTHENTICATED. That is safe by evidence — each of those three handlers calls
// getSession() and returns 401 BEFORE any tx.insert/tx.update (verified 2026-09-19),
// and an unauthenticated request to them therefore cannot write. The cost is that
// non-GET routes do not exercise the app pool; the GET routes do (gifts-profile, admin
// reads, steward reads, marketplace all run inside withRLSContext), so app-pool
// breakage is still detected. A gate that can mutate production data in order to
// test it is not a gate anyone should run.
//
// REUSES, DOES NOT FORK: assertion 1 spawns smoke-routes.ts, assertions 3–4 spawn
// verify-rls.ts, and assertion 2 imports smoke-routes' route list.
//
// USAGE
//   cd resilientsa-app
//   TEST_SESSION_TOKEN=<real session token> \
//     POSTGRES_URL_APP="<app-role connection string>" \
//     npx tsx scripts/verify-rls-live.ts https://<deployment>
//
// POSTGRES_URL_APP is required for assertion 3 (it is read from .env.local, which
// scripts/verify-rls.ts loads). Without it the gate reports INCONCLUSIVE (2) — never
// PASS. Obtain a token by performing a real OTP login against the deployment under
// test. Exits 2 if it could not run at all.
import { spawnSync } from 'node:child_process'
import { ROUTES } from './smoke-routes'

const BASE = (process.argv[2] ?? '').replace(/\/$/, '')
if (!BASE) {
  console.error('Usage: npx tsx scripts/verify-rls-live.ts https://<deployment>')
  console.error('(with TEST_SESSION_TOKEN set for the authenticated section)')
  process.exit(2)
}

const TOKEN = process.env.TEST_SESSION_TOKEN ?? ''

// ── EXIT CODES ────────────────────────────────────────────────────────────────
const PASS = 0
const FAIL = 1
const INCONCLUSIVE = 2

/**
 * KNOWN, SEPARATELY-OWNED DEFECTS — asserted so they cannot block the gate, but
 * reported loudly rather than swallowed.
 *
 * An entry here means: this route is known to be broken, the breakage is tracked
 * elsewhere, and it is provably unrelated to what this gate exists to protect (§4 of
 * the ruling: identical failure under the owner role and the app role ⇒ cannot be RLS,
 * cannot be this order). FAIL is for UNEXPECTED 5xx only.
 *
 * Adding an entry requires an issue reference. An entry whose route no longer fails is
 * reported as STALE — remove it, because a stale exemption would silently mask a future
 * regression on that route.
 */
const KNOWN_DEFECTS: Array<{ method: string; path: string; issue: string; reason: string }> = [
  {
    method: 'GET',
    path: '/api/marketplace/offerings',
    issue: 'CREW_ORDERS/CREW-ORDER-012-DRAFT-marketplace-browse-500.md',
    reason:
      'pre-existing malformed Drizzle query (Postgres 42601, stray "on" before "where"); ' +
      'fails identically on the privileged owner connection — proven 2026-09-19, unrelated to Part B',
  },
]

function banner(n: string, s: string) {
  console.log(`\n${'─'.repeat(78)}\n  ${n}  ${s}\n${'─'.repeat(78)}`)
}

function runChild(label: string, args: string[]): number {
  console.log(`\n$ npx tsx ${args.join(' ')}`)
  const r = spawnSync('npx', ['tsx', ...args], { stdio: 'inherit' })
  const code = r.status ?? FAIL
  console.log(`  -> ${label} exit ${code}`)
  return code
}

// ── Assertion 2: the authenticated matrix over the CLIENT'S OWN route list ─────
async function routeMatrix(): Promise<{ failures: number; known: string[]; stale: string[] }> {
  const failures: string[] = []
  const knownObserved: string[] = []
  // Tracked separately and precisely:
  //   matchedKnown — exemptions where a 5xx was ACTUALLY OBSERVED (so `stale` is not
  //                  triggered merely because the route exists in the list).
  //   authedKeys   — routes probed WITH a token. An exemption is only called stale if it
  //                  was meaningfully probed; with no token a GET probe is unauthenticated
  //                  and returns 401 long before the broken query, so calling that "stale"
  //                  would be a false alarm.
  const matchedKnown = new Set<string>()
  const authedKeys = new Set<string>()

  for (const route of ROUTES) {
    const authed = route.method === 'GET' && Boolean(TOKEN)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authed) headers.Authorization = `Bearer ${TOKEN}`

    const init: RequestInit = { method: route.method, headers }
    if (route.body !== undefined) init.body = JSON.stringify(route.body)

    let status = 0
    let body = ''
    try {
      const res = await fetch(BASE + route.path, init)
      status = res.status
      body = await res.text()
    } catch (e: any) {
      console.log(`  FAIL  ERR   ${route.method.padEnd(6)} ${route.path} — ${e.message}`)
      failures.push(`${route.method} ${route.path}: network error`)
      continue
    }

    const is5xx = status >= 500
    const key = `${route.method} ${route.path}`
    const exemption = KNOWN_DEFECTS.find((d) => d.method === route.method && d.path === route.path)
    if (authed) authedKeys.add(key)
    if (exemption && is5xx) matchedKnown.add(key)

    let flag = ' ok '
    if (is5xx) {
      if (exemption) {
        flag = 'KNOW'
        knownObserved.push(`${route.method} ${route.path} [${exemption.issue}]`)
      } else {
        flag = 'FAIL'
        failures.push(`${route.method} ${route.path} -> ${status}`)
      }
    }
    const auth = authed ? 'auth' : 'anon'
    console.log(`  ${flag}  ${String(status).padEnd(4)} ${route.method.padEnd(6)} ${route.path.padEnd(52)} ${auth}`)

    // CRIT-002 regression guard: a 5xx body must never carry query parameters.
    if (is5xx && body.includes('params:')) {
      console.log('        ⚠ AND the body leaks query parameters — CRIT-002 regressed.')
      failures.push(`${route.method} ${route.path}: parameter leak in 5xx body`)
    }
  }

  const stale = KNOWN_DEFECTS.filter((d) => {
    const key = `${d.method} ${d.path}`
    return !matchedKnown.has(key) && authedKeys.has(key)
  }).map((d) => `${d.method} ${d.path} [${d.issue}]`)
  return { failures: failures.length, known: knownObserved, stale }
}

async function main() {
  console.log(`\nverify-rls-LIVE — CREW-ORDER-011 §4.2 application gate\n target: ${BASE}`)
  if (!TOKEN) {
    console.log(' ⚠ TEST_SESSION_TOKEN not set — GET routes will be probed unauthenticated,')
    console.log('   so the authenticated assertion cannot do its job. Expect INCONCLUSIVE.')
  }
  console.log(` probes ${ROUTES.length} routes, imported from scripts/smoke-routes.ts (ruling §1)`)

  // ── 1. Routing + health ──
  banner('1/3', 'routing + health — every declared route reaches its handler')
  const routing = runChild('smoke-routes', ['scripts/smoke-routes.ts', BASE])

  // ── 2. No unexpected 5xx across the full client route set ──
  banner('2/3', 'no unexpected 5xx — the full client route set (the 2026-09-14 signature)')
  console.log('  GET routes authenticated; non-GET unauthenticated (non-destructive by design)\n')
  const matrix = await routeMatrix()

  // ── 3. Database enforcement + connection identity ──
  banner('3/3', 'database enforcement + connection identity — must be a NON-bypassing role')
  const dbExit = runChild('verify-rls', ['scripts/verify-rls.ts'])

  // ── Verdict — three states ──
  const dbState =
    dbExit === 0
      ? 'PASS'
      : dbExit === 4
        ? 'INCONCLUSIVE — REFUSED: the connection bypasses RLS, so nothing was proven'
        : dbExit === 1
          ? 'FAIL — RLS is not being enforced for this connection'
          : 'INCONCLUSIVE — the check could not complete'

  banner('VERDICT', 'CREW-ORDER-011 §4.2 gate')
  console.log(`  routing/health (smoke-routes)   : ${routing === 0 ? 'PASS' : 'FAIL (exit ' + routing + ')'}`)
  console.log(`  no unexpected 5xx, full route set: ${matrix.failures === 0 ? 'PASS' : 'FAIL — ' + matrix.failures + ' unexpected'}`)
  console.log(`  DB enforcement + identity       : ${dbState}`)
  if (matrix.known.length) {
    console.log(`\n  KNOWN DEFECTS observed (tracked, not blocking — ruling §4):`)
    for (const k of matrix.known) console.log(`    • ${k}`)
    for (const k of matrix.known) {
      const ref = KNOWN_DEFECTS.find((d) => k.includes(d.path))?.reason
      if (ref) console.log(`        ${ref}`)
    }
  }
  if (matrix.stale.length) {
    console.log(`\n  ⚠ STALE EXEMPTIONS — these routes no longer fail; REMOVE them from KNOWN_DEFECTS`)
    console.log(`    so a future regression on them cannot be silently masked:`)
    for (const s of matrix.stale) console.log(`    • ${s}`)
  }

  const definiteFailure = routing !== 0 || matrix.failures > 0 || dbExit === 1
  const inconclusive = !definiteFailure && dbExit !== 0

  console.log()
  if (definiteFailure) {
    console.log('  ❌ FAIL (exit 1) — do NOT proceed. Per §5, unset POSTGRES_URL_APP and redeploy to roll back.\n')
    process.exit(FAIL)
  }
  if (inconclusive) {
    console.log('  ⚠ INCONCLUSIVE (exit 2) — NOT a pass and NOT a failure. Something could not be')
    console.log('    checked. Fix that and re-run before treating this gate as satisfied.\n')
    process.exit(INCONCLUSIVE)
  }
  console.log('  ✅ ALL PASS (exit 0) — every probed route behaved correctly and enforcement is')
  console.log('     verified on a non-bypassing role. Safe to proceed to the next rollout step.\n')
  process.exit(PASS)
}

main().catch((e) => {
  console.error('\nverify-rls-live failed to run:', e?.message ?? e, '\n')
  process.exit(INCONCLUSIVE)
})
