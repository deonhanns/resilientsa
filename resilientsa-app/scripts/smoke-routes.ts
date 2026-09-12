// scripts/smoke-routes.ts
//
// CREW-ORDER-010 §5 — standing pre-deploy route smoke test.
//
// WHY THIS EXISTS
// The catch-all routing-depth defect (see
// WORF_ALERTS/2026-09-11-catchall-routing-depth-failure.md) made six production
// routes unreachable for weeks while `npm run build`, `tsc -b`, source review and
// every milestone table all reported success. Nothing in the existing process
// could see it, because the failure only exists at runtime: Vercel returns its own
// 404 page and the function is never invoked.
//
// This script hits every declared route live and fails loudly if any of them is a
// PLATFORM 404.
//
// THE DISCRIMINATOR
// A routed handler ALWAYS returns JSON — even its own 404 is `{"error":"Not found"}`.
// Vercel's platform 404 (route never matched, function never invoked) returns an
// HTML page: "The page could not be found / NOT_FOUND". So the test is not the
// status code, it is whether the body parses as JSON — a routed handler always returns
// JSON, even its own 404 is {"error":"Not found"}.
//
// That single rule catches BOTH non-JSON cases: Vercel's platform 404 page, and the
// SPA rewrite answering a bad path with index.html at 200. The second is not
// hypothetical — the first version of this script checked only for status 404, and a
// negative control against a deliberately-bad base URL returned 200 HTML for every
// route and falsely reported 15/15 success. Re-run that control whenever this script
// changes; it must FAIL:
//   npx tsx scripts/smoke-routes.ts https://<host>/nonexistent-prefix
//
// TWO ROUTING RULES THIS DEPLOYMENT OBEYS (both learned the hard way):
//   1. `[...path]` catch-alls match exactly ONE path segment. Never nest a route
//      2+ segments under a catch-all — use a real nested file.
//   2. Catch-alls do NOT match depth 0. A bare `/api/listings` is legitimately a
//      platform 404; the real routes are `/api/listings/<x>`.
//
// An unauthenticated request is expected to return 401/403/405 — all of which mean
// "the handler ran and rejected you", which is exactly what we want to prove. No
// credentials are needed and none should be added: this asserts ROUTING, not
// authorisation, and it must stay runnable by anyone.
//
// USAGE
//   cd resilientsa-app
//   npx tsx scripts/smoke-routes.ts                      # production
//   npx tsx scripts/smoke-routes.ts https://<preview>    # a specific deployment
//
// Exits 0 if every route routed, 1 otherwise.

const BASE = (process.argv[2] ?? 'https://resilientsa.vercel.app').replace(/\/$/, '')

// A cell id and user id that are well-formed and effectively arbitrary: the routes
// reject them with 403/404 AFTER being invoked, which is all this script asserts.
const CELL = 'c0000000-0000-0000-0000-000000000001'
const USER = '70930429-e479-4013-8698-5e9325ef95cb'
const MATCH = '00000000-0000-0000-0000-000000000009'

type Route = { method: string; path: string; note: string; body?: unknown }

const ROUTES: Route[] = [
  // ── The six routes CREW-ORDER-010 fixed. These are the regression guards. ──
  { method: 'GET', path: `/api/steward/dashboard/${CELL}`, note: 'ORDER 007 dashboard (was platform-404)' },
  { method: 'GET', path: `/api/steward/isolates/${CELL}`, note: 'ORDER 007 isolates (was platform-404)' },
  { method: 'GET', path: `/api/steward/hubs/${CELL}`, note: 'ORDER 007 hubs (was platform-404)' },
  { method: 'GET', path: `/api/steward/network-summary/${CELL}`, note: 'ORDER 007 network-summary (was platform-404)' },
  { method: 'PATCH', path: `/api/admin/members/${USER}/cell`, note: 'ORDER 009a milestone 4 (was platform-404)', body: { cellId: CELL } },
  { method: 'PATCH', path: `/api/admin/members/${USER}/role`, note: 'ORDER 009a milestone 5 (was platform-404)', body: { role: 'member' } },

  // ── Routes that already worked: guard against regression from the fix. ──
  { method: 'GET', path: '/api/me', note: 'own session' },
  { method: 'GET', path: '/api/gifts-profile/me', note: 'gifts profile' },
  { method: 'GET', path: '/api/admin/nodes', note: 'ORDER 009a nodes (single-segment catch-all)' },
  { method: 'GET', path: '/api/admin/cells', note: 'ORDER 009a cells' },
  { method: 'GET', path: '/api/admin/members', note: 'ORDER 009a members' },
  { method: 'GET', path: '/api/marketplace/offerings', note: 'ORDER 008 marketplace' },
  { method: 'POST', path: `/api/trade-completions/${MATCH}/confirm-fairness`, note: 'nested non-catch-all precedent', body: {} },
  // NOTE: deliberately `/open`, not bare `/api/listings` — catch-alls do not match
  // depth 0, so the bare path is legitimately a platform 404 and must not be asserted.
  { method: 'GET', path: '/api/listings/open', note: 'ORDER 006 listings' },

  // ── Method handling on a declared path must be the handler's 405, not a platform 404. ──
  { method: 'GET', path: '/api/auth/request-code', note: 'expects the handler 405 (POST-only)' },
]

function reachedHandler(body: string): boolean {
  try {
    JSON.parse(body)
    return true // JSON from any status means a handler ran and answered
  } catch {
    return false // HTML = platform 404, or the SPA rewrite — never a handler
  }
}

async function main() {
  console.log(`\nRoute smoke test against ${BASE}`)
  console.log('Failures are PLATFORM 404s (function never invoked), not status codes.\n')
  console.log('  ' + 'METHOD'.padEnd(7) + 'ROUTE'.padEnd(58) + 'CODE'.padEnd(6) + 'RESULT   NOTE')

  let failures = 0
  for (const route of ROUTES) {
    const init: RequestInit = { method: route.method, headers: { 'Content-Type': 'application/json' } }
    if (route.body !== undefined) init.body = JSON.stringify(route.body)

    let status = 0
    let body = ''
    try {
      const res = await fetch(BASE + route.path, init)
      status = res.status
      body = await res.text()
    } catch (err) {
      console.log('  ' + route.method.padEnd(7) + route.path.padEnd(58) + 'ERR'.padEnd(6) + 'FAIL     network: ' + String(err).slice(0, 60))
      failures++
      continue
    }

    const routed = reachedHandler(body)
    if (!routed) failures++
    console.log(
      '  ' + route.method.padEnd(7) +
      route.path.padEnd(58) +
      String(status).padEnd(6) +
      (routed ? 'routed   ' : 'FAIL     ') +
      route.note
    )
  }

  console.log(`\n${ROUTES.length - failures}/${ROUTES.length} routed.`)
  if (failures > 0) {
    console.error(`\nFAILED: ${failures} route(s) did not return JSON — the handler was never invoked.`)
    console.error('Either a PLATFORM 404 (CREW-ORDER-010: a route nested 2+ segments under a catch-all,')
    console.error('which this deployment cannot match) or the SPA rewrite answering with HTML.')
    console.error('Do NOT deploy.\n')
    process.exit(1)
  }
  console.log('\nOK — every declared route reached its handler.\n')
}

main()
