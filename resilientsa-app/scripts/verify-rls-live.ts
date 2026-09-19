// scripts/verify-rls-live.ts
//
// CREW-ORDER-011 §4.2 — THE APPLICATION-LEVEL GATE (§6 of the approved redesign).
//
// WHY THIS EXISTS, IN ONE SENTENCE
// On 2026-09-14 the app-role rollout broke authentication platform-wide and every
// existing check passed anyway: the build was green, the source was correct, and
// scripts/verify-rls.ts met its own criteria because it tests the DATABASE with the RLS
// context supplied and never touches the running application. This script tests the
// running application, which is the only thing that could have caught it.
//
// IT ASSERTS ALL FIVE THINGS §6 REQUIRES:
//   1. Routing + health — every declared route still reaches its handler.
//   2. Authenticated health — no 5xx on authenticated routes. THIS IS THE INCIDENT'S
//      SIGNATURE. A 500 here is precisely what must never ship again. A 401/403/404 is
//      NOT a failure: the assertion is "the handler ran", not "access was granted".
//   3. The database assertion — cross-node denial (delegated to verify-rls.ts, which
//      also owns §4.3's corrected INCONCLUSIVE-vs-PASS behaviour).
//   4. The identity assertion — the connection under test must report
//      rolbypassrls = false. Testing the privileged identity and calling it a pass is
//      the other way this could lie, so verify-rls.ts refuses to report for such a role.
//   5. Re-runnable, non-zero exit on failure.
//
// REUSES, DOES NOT FORK (§6). Assertions 1 and 3-4 are run by executing the existing
// scripts as child processes rather than copying their logic, so there is exactly one
// implementation of each.
//
// USAGE
//   cd resilientsa-app
//   TEST_SESSION_TOKEN=<a real session token> npx tsx scripts/verify-rls-live.ts https://<deployment>
//
// Without TEST_SESSION_TOKEN the authenticated section reports INCONCLUSIVE and the
// script exits 3 — deliberately NOT 0. A gate that silently skips its most important
// assertion is the same false-confidence trap as a deny-based test passing against an
// empty table. Obtain a token by performing a real OTP login against the deployment
// under test; do not reuse a Production token against a Preview deployment.
//
// Exits 0 = all assertions passed. 1 = a real failure. 2 = could not run. 3 = inconclusive.
import { spawnSync } from 'node:child_process'

const BASE = (process.argv[2] ?? '').replace(/\/$/, '')
if (!BASE) {
  console.error('Usage: npx tsx scripts/verify-rls-live.ts https://<deployment>')
  console.error('(optionally with TEST_SESSION_TOKEN set for the authenticated section)')
  process.exit(2)
}

const TOKEN = process.env.TEST_SESSION_TOKEN ?? ''
const CELL = 'c0000000-0000-0000-0000-000000000001'

function banner(n: string, s: string) {
  console.log(`\n${'─'.repeat(72)}\n  ${n}  ${s}\n${'─'.repeat(72)}`)
}

function runChild(label: string, args: string[]): number {
  console.log(`\n$ npx tsx ${args.join(' ')}`)
  const r = spawnSync('npx', ['tsx', ...args], { stdio: 'inherit' })
  const code = r.status ?? 1
  console.log(`  -> ${label} exit ${code}`)
  return code
}

// ── Authenticated route matrix: the incident's signature ────────────────────────
// Only status >= 500 counts as failure. 401/403/404 all mean "the handler ran and
// answered", which is exactly what is being asserted.
const AUTH_ROUTES: Array<{ method: string; path: string; note: string }> = [
  { method: 'GET', path: '/api/me',                        note: 'session lookup — this 500ed on 2026-09-14' },
  { method: 'GET', path: '/api/gifts-profile/me',          note: 'node-scoped read + user-id policy' },
  { method: 'GET', path: '/api/admin/nodes',               note: 'privileged path (must stay unaffected)' },
  { method: 'GET', path: `/api/steward/dashboard/${CELL}`, note: 'node-scoped; 403 for a non-steward is correct' },
]

async function authenticatedSection(): Promise<number> {
  if (!TOKEN) {
    console.log('\n  TEST_SESSION_TOKEN not set — the authenticated section CANNOT run.')
    console.log('  Treating as INCONCLUSIVE, not PASS: without it this gate cannot see the')
    console.log('  failure mode it exists for (an authenticated 500).\n')
    return 3
  }
  let failures = 0
  for (const r of AUTH_ROUTES) {
    try {
      const res = await fetch(`${BASE}${r.path}`, {
        method: r.method,
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
      const bad = res.status >= 500
      console.log(`  ${bad ? 'FAIL' : ' ok '}  ${String(res.status).padEnd(4)} ${r.method} ${r.path.padEnd(38)} ${r.note}`)
      if (bad) failures++
    } catch (e: any) {
      console.log(`  FAIL  ERR  ${r.method} ${r.path.padEnd(38)} ${e.message}`)
      failures++
    }
  }

  // The login write path — the exact request that 500ed and leaked the OTP on
  // 2026-09-14. Writes one otp_codes row for a throwaway number (no SMS is sent while
  // AT creds are absent; it is logged under OTP_DEBUG_LOG). Unauthenticated by design.
  try {
    const res = await fetch(`${BASE}/api/auth/request-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: '+27820000099' }),
    })
    const body = await res.text()
    const bad = res.status >= 500
    console.log(`  ${bad ? 'FAIL' : ' ok '}  ${String(res.status).padEnd(4)} POST /api/auth/request-code${' '.repeat(20)} login write path`)
    if (bad) {
      failures++
      console.log(`        body: ${body.slice(0, 160)}`)
      if (body.includes('params:')) {
        console.log('        ⚠ AND the body leaks query parameters — that is CRIT-002 regressed.')
      }
    }
  } catch (e: any) {
    console.log(`  FAIL  ERR  POST /api/auth/request-code — ${e.message}`)
    failures++
  }
  return failures === 0 ? 0 : 1
}

async function main() {
  console.log(`\nverify-rls-LIVE — CREW-ORDER-011 §4.2 application gate\n target: ${BASE}`)
  if (!TOKEN) console.log(' authenticated section: WILL BE INCONCLUSIVE (no TEST_SESSION_TOKEN)')

  // ── 1. Routing + health (reuses smoke-routes.ts) ──
  banner('1/3', 'routing + health — every declared route reaches its handler')
  const routing = runChild('smoke-routes', ['scripts/smoke-routes.ts', BASE])

  // ── 2. Authenticated health — the incident's signature ──
  banner('2/3', 'authenticated health — no 5xx (the 2026-09-14 signature)')
  const auth = await authenticatedSection()

  // ── 3+4. Database enforcement + connection identity (reuses verify-rls.ts) ──
  banner('3/3', 'database enforcement + connection identity — must be a NON-bypassing role')
  console.log('  (runs locally against POSTGRES_URL_APP; it tests the database, and its')
  console.log('   exit 4 REFUSED means the connection bypasses RLS and proved nothing)')
  const dbCheck = runChild('verify-rls', ['scripts/verify-rls.ts'])

  // ── Verdict ──
  banner('VERDICT', 'CREW-ORDER-011 §4.2 gate')
  console.log(`  routing/health (smoke-routes) : ${routing === 0 ? 'PASS' : 'FAIL (exit ' + routing + ')'}`)
  console.log(`  authenticated 5xx check       : ${auth === 0 ? 'PASS' : auth === 3 ? 'INCONCLUSIVE' : 'FAIL'}`)
  console.log(`  DB enforcement + identity     : ${dbCheck === 0 ? 'PASS' : dbCheck === 4 ? 'REFUSED — wrong connection identity' : 'FAIL (exit ' + dbCheck + ')'}`)
  console.log()

  if (routing === 0 && auth === 0 && dbCheck === 0) {
    console.log('  ✅ ALL PASS — safe to proceed to the next rollout step.\n')
    process.exit(0)
  }
  if (auth === 3) {
    console.log('  ⚠ INCONCLUSIVE — the authenticated assertion did not run. Not a pass.')
    console.log('    Set TEST_SESSION_TOKEN and re-run before trusting this gate.\n')
    process.exit(3)
  }
  console.log('  ❌ FAIL — do NOT proceed. Per §5, unset POSTGRES_URL_APP and redeploy to roll back.\n')
  process.exit(1)
}

main().catch((e) => {
  console.error('\nverify-rls-live failed to run:', e?.message ?? e, '\n')
  process.exit(2)
})
