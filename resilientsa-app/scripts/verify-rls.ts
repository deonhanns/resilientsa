// scripts/verify-rls.ts
//
// CREW-ORDER-011 §4.3 — a real RLS-exercising test.
//
// WHY THIS EXISTS
// Every RLS policy in this schema has been inert since ORDER 003 (2026-07-02) and
// nothing detected it, because a schema-level guarantee that is never exercised by a
// test is indistinguishable from one that works. Build, typecheck and source review
// cannot see this class of failure; only a live query can.
//
// THE TRAP THIS TEST IS BUILT TO AVOID
// A first version pointed the RLS context at a non-existent node and counted
// `coop_pii.founding_members`, got 0, and reported PASS. That was a FALSE PASS — the
// table is EMPTY pre-pilot, so 0 rows proves nothing about enforcement. It would have
// "verified" RLS on the strength of having no data to protect.
// So this version probes a table known to be NON-EMPTY (`users`, which is RLS-bearing
// via a node_isolation policy on node_id), and treats an empty probe as INCONCLUSIVE
// rather than as a pass.
//
// WHAT IT ASSERTS
// With the RLS context pointed at a node id that matches no row, a table that definitely
// holds rows must return ZERO of them.
//   - RLS enforced -> 0 rows, because no policy can be satisfied
//   - RLS inert    -> all rows come back, because the connection is the table owner
//
// ⚠ NECESSARY BUT NOT SUFFICIENT — CREW-ORDER-011 §4.2 update, 2026-09-19.
// This exercises the DATABASE with the RLS context supplied. It does not exercise the
// running application, and a PASS here says nothing about whether the app can serve a
// request: on 2026-09-14 this script's criteria would have been met while login was
// impossible platform-wide. scripts/verify-rls-live.ts is the application-level gate and
// is the one §4.2's rollout requires before Production.
//
// It also no longer prefers DATABASE_URL (which the application never used —
// @vercel/postgres resolves POSTGRES_URL), and it REFUSES to report a result for a role
// that carries BYPASSRLS, because such a run proves nothing in either direction.
// See WORF_ALERTS/2026-09-14-live-incident-order011-section42-app-role-breakage.md.
//
// WHY A TRANSACTION
// `set_config(..., true)` is transaction-local, and the Neon HTTP driver issues one
// request per query — so the settings and the read must be in ONE transaction or the
// context is not in scope for the read. That is the same reason the application wraps
// its queries in `db.transaction`, and the same reason the original bug was invisible:
// the settings were applied to a transaction that ran none of the queries.
//
// USAGE
//   cd resilientsa-app
//   npx tsx scripts/verify-rls.ts                    # uses POSTGRES_URL_APP
//   npx tsx scripts/verify-rls.ts "postgres://..."   # or an explicit connection string
// Exits 0 = RLS enforced. 1 = RLS not enforced. 2 = could not run. 3 = inconclusive
// (no data to probe). 4 = REFUSED — the role bypasses RLS, so nothing was proven.
import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env.local' })
dotenv.config()

// Resolution order, deliberately: POSTGRES_URL_APP first (the non-owner role the
// application is supposed to run as, and the only one that can demonstrate anything),
// then an explicit argument, and only then POSTGRES_URL — the table owner, whose result
// is refused below rather than reported as a misleading FAIL.
const url = process.env.POSTGRES_URL_APP ?? process.argv[2] ?? process.env.POSTGRES_URL
if (!url) {
  console.error('\nNo connection string available — set POSTGRES_URL_APP, pass one as an')
  console.error('argument, or run from resilientsa-app/ with .env.local present.\n')
  process.exit(2)
}

const sql = neon(url)

/** A well-formed uuid matching no node, so no node_isolation policy can be satisfied. */
const NO_SUCH_NODE = '00000000-0000-0000-0000-0000000000ff'

/** Neon's driver returns either an array of rows or { rows } depending on call shape. */
function rowsOf(result: any): any[] {
  if (Array.isArray(result)) return result
  if (result && Array.isArray(result.rows)) return result.rows
  return []
}

function num(rows: any[]): number {
  return Number(rows[0]?.n ?? NaN)
}

async function main() {
  console.log('\nRLS enforcement check — CREW-ORDER-011 §4.3\n')

  const roleRows = rowsOf(await sql`
    SELECT current_user AS role, rolsuper, rolbypassrls
    FROM pg_roles WHERE rolname = current_user
  `)
  const who = roleRows[0]?.role ?? '(unknown)'
  console.log(`connection role : ${who}   (superuser=${roleRows[0]?.rolsuper}, bypassrls=${roleRows[0]?.rolbypassrls})`)

  // §6 assertion 4 — the identity assertion. A BYPASSRLS role never evaluates a policy,
  // so a FAIL for the owner would be as misleading as a PASS would be. Refuse instead.
  if (roleRows[0]?.rolbypassrls !== false) {
    console.error(`\nREFUSED — connected as "${who}", with rolbypassrls=${roleRows[0]?.rolbypassrls}.`)
    console.error('PostgreSQL does not evaluate row security policies for such a role, so this')
    console.error('run cannot demonstrate whether enforcement works, in either direction.')
    console.error('Test the application role instead, e.g.:')
    console.error('  POSTGRES_URL_APP="postgres://resilientsa_app:<pw>@<same-host>/<db>" \\')
    console.error('    npx tsx scripts/verify-rls.ts')
    console.error('Exit 4 is deliberately distinct from FAIL (1): nothing was proven here.\n')
    process.exit(4)
  }

  const tableRows = rowsOf(await sql`
    SELECT relname, relrowsecurity, relforcerowsecurity, relowner::regrole::text AS owner_role
    FROM pg_class
    WHERE relname IN ('users','cells','nodes','listings','founding_members','cooperatives')
    ORDER BY relname
  `)
  const ownsSomething = tableRows.some((t) => t.owner_role === who)
  const anyForced = tableRows.some((t) => t.relforcerowsecurity)

  console.log('table posture   :')
  for (const t of tableRows) {
    const flag = t.owner_role === who ? '   <-- we own this, so RLS is bypassed for us' : ''
    console.log(`  ${String(t.relname).padEnd(17)} enabled=${String(t.relrowsecurity).padEnd(5)} forced=${String(t.relforcerowsecurity).padEnd(5)} owner=${t.owner_role}${flag}`)
  }
  console.log()

  // ── Assertion 3, REWRITTEN 2026-09-19 per the first A1-revision ruling ──────────
  //
  // The old baseline assumed THIS CONNECTION BYPASSES RLS, so a contextless count was
  // the "there is data to hide" reference. That assumption is false by design now: the
  // whole point of the application role is that it does NOT bypass. Under it the
  // contextless count is correctly 0, which cannot distinguish "denied" from "nothing
  // there" — so the script reported INCONCLUSIVE and could never PASS.
  //
  // Two-sided instead, which is STRONGER than the old one-directional test:
  //   1. VISIBILITY — with a real, known-good context the rows must be VISIBLE.
  //   2. DENIAL     — with a fabricated context the same read must return NOTHING.
  //   3. CONTEXTLESS — must now return 0 WITHOUT raising: that is precisely what the
  //      nullif guards exist for, so a raise here means a guard is missing somewhere.
  const REAL_NODE = process.env.RLS_TEST_NODE_ID ?? '00000000-0000-0000-0000-000000000001'
  const REAL_USER = process.env.RLS_TEST_USER_ID ?? '00000000-0000-0000-0000-0000000000aa'

  const visTx: any = await sql.transaction([
    sql`SELECT set_config('app.current_node_id', ${REAL_NODE}, true)`,
    sql`SELECT set_config('app.current_role', 'member', true)`,
    sql`SELECT set_config('app.current_user_id', ${REAL_USER}, true)`,
    sql`SELECT count(*)::int AS n FROM users`,
  ])
  const visible = num(rowsOf(visTx?.[3]))

  const denTx: any = await sql.transaction([
    sql`SELECT set_config('app.current_node_id', ${NO_SUCH_NODE}, true)`,
    sql`SELECT set_config('app.current_role', 'member', true)`,
    sql`SELECT set_config('app.current_user_id', ${REAL_USER}, true)`,
    sql`SELECT count(*)::int AS n FROM users`,
  ])
  const denied = num(rowsOf(denTx?.[3]))

  let contextless: number | null = null
  let contextlessError: string | null = null
  try {
    contextless = num(rowsOf(await sql`SELECT count(*)::int AS n FROM users`))
  } catch (e: any) {
    contextlessError = `${e?.code ?? ''} ${e?.message ?? e}`.trim()
  }

  console.log(`visibility : count(users) with a REAL context (node ${REAL_NODE.slice(0, 8)}…) = ${visible}`)
  console.log(`denial     : count(users) with a FABRICATED context                        = ${denied}`)
  console.log(
    `contextless: count(users) with no context at all                         = ${
      contextlessError ? `RAISED ${contextlessError}` : contextless
    }`,
  )

  // ── coop_pii reporting — explicitly flagged when it cannot prove anything ──
  const fm = num(rowsOf(await sql`SELECT count(*)::int AS n FROM coop_pii.founding_members`))
  const co = num(rowsOf(await sql`SELECT count(*)::int AS n FROM coop_pii.cooperatives`))
  console.log(`\n  coop_pii.founding_members  rows = ${fm}${fm === 0 ? '   (empty — cannot prove enforcement here yet)' : ''}`)
  console.log(`  coop_pii.cooperatives      rows = ${co}${co === 0 ? '   (empty — cannot prove enforcement here yet)' : ''}`)

  if (co > 0 || fm > 0) {
    const txRes2: any = await sql.transaction([
      sql`SELECT set_config('app.current_node_id', ${NO_SUCH_NODE}, true)`,
      sql`SELECT set_config('app.current_role', 'node_admin', true)`,
      sql`SELECT count(*)::int AS n FROM coop_pii.cooperatives`,
    ])
    console.log(`  probe: coop_pii.cooperatives under the same non-matching context = ${num(rowsOf(txRes2?.[2]))}`)
  }
  console.log()

  if (Number.isNaN(visible) || Number.isNaN(denied)) {
    console.error('Could not read a probe count — response shape unexpected.\n')
    process.exit(2)
  }

  // A RAISE on the contextless read means an unguarded uuid cast is present: exactly the
  // defect the A1 revisions removed. Treat it as a failure, never as a pass.
  if (contextlessError) {
    console.error(`❌ FAIL — a contextless read RAISED (${contextlessError}).`)
    console.error('   With every uuid cast nullif-guarded this must return 0 rows, not raise 22P02.')
    console.error('   An unguarded cast on a custom GUC is present. See the A1-revision rulings.\n')
    process.exit(1)
  }

  if (contextless !== null && contextless > 0) {
    console.error(`❌ FAIL — ${contextless} users rows were visible with NO context set at all.`)
    console.error('   A non-bypassing role must see nothing without a context.\n')
    process.exit(1)
  }

  if (visible === 0) {
    console.error('\nINCONCLUSIVE — the REAL context saw 0 users, so a zero result under the')
    console.error('fabricated context cannot distinguish "RLS denied the read" from "there was')
    console.error('nothing to read in that node". Point RLS_TEST_NODE_ID at a node that has')
    console.error('members, then re-run. (Exit 3 is deliberately not a pass.)\n')
    process.exit(3)
  }

  if (denied > 0) {
    console.error(`❌ FAIL — ${denied} users rows were visible under a node context that matches NO node.`)
    console.error('   RLS is ENABLED but NOT ENFORCED for this connection.')
    // Reachable only for a role without BYPASSRLS (that case exits 4 above). An owner
    // without BYPASSRLS is still exempt from its own policies unless FORCE RLS is set.
    if (ownsSomething) console.error(`   Cause: we connect as "${who}", which OWNS the table.`)
    if (!anyForced) console.error('   Cause: no table has FORCE ROW LEVEL SECURITY.')
    console.error('   Do NOT enter real community-member PII until this passes.\n')
    process.exit(1)
  }

  console.log('✅ PASS — two-sided enforcement proved for this connection:')
  console.log(`   • real context      : ${visible} users row(s) visible   (visibility)`)
  console.log('   • fabricated context: 0                        (denial)')
  console.log('   • contextless       : 0, without raising       (fail-closed, not fail-loud)')
  console.log('   RLS is being ENFORCED for this connection.\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('\nverify-rls failed to run:', err?.message ?? err, '\n')
  process.exit(2)
})
