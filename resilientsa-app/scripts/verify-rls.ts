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
// ⚠ EXPECTED TO FAIL UNTIL CREW-ORDER-011 §4.2 LANDS. §4.2 is a schema / connection-role
// change and is Spock's, per Rule #3. See
// WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md §3.
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
//   npx tsx scripts/verify-rls.ts
// Exits 0 = RLS enforced. 1 = RLS not enforced. 3 = inconclusive (no data to probe).
import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env.local' })
dotenv.config()

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
if (!url) {
  console.error('\nDATABASE_URL / POSTGRES_URL is not set — cannot exercise RLS.')
  console.error('Run from resilientsa-app/ with .env.local present, or export DATABASE_URL.\n')
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

  // ── Baseline: is there any data to hide? Literal queries only, no dynamic SQL. ──
  const baseline = num(rowsOf(await sql`SELECT count(*)::int AS n FROM users`))
  console.log(`baseline: contextless count of users = ${baseline}`)

  if (baseline === 0) {
    console.error('\nINCONCLUSIVE — "users" is empty, so a zero-row result cannot distinguish')
    console.error('"RLS denied the read" from "there was nothing to read". This is exactly the false')
    console.error('PASS an earlier version of this script produced against coop_pii.founding_members.')
    console.error('Create at least one user, then re-run.\n')
    process.exit(3)
  }

  // ── The assertion: same read, RLS context pointed at a node that does not exist ──
  const txRes: any = await sql.transaction([
    sql`SELECT set_config('app.current_node_id', ${NO_SUCH_NODE}, true)`,
    sql`SELECT set_config('app.current_role', 'node_admin', true)`,
    sql`SELECT count(*)::int AS n FROM users`,
  ])
  const contexted = num(rowsOf(txRes?.[2]))

  console.log(`probe:    count of users with context = NON-EXISTENT node = ${contexted}`)
  console.log(`expected: 0   (baseline is ${baseline}, so there IS data to hide)`)

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

  if (Number.isNaN(contexted)) {
    console.error('Could not read the probe count — response shape unexpected.\n')
    process.exit(2)
  }

  if (contexted === 0) {
    console.log(`✅ PASS — a users read under a non-matching node context returned 0 of ${baseline} rows.`)
    console.log('   RLS is being ENFORCED for this connection.\n')
    process.exit(0)
  }

  console.error(`❌ FAIL — ${contexted} of ${baseline} users rows were visible under a node context that`)
  console.error('   matches NO node. RLS is ENABLED but NOT ENFORCED for this connection.')
  if (ownsSomething) console.error(`   Cause: we connect as "${who}", which OWNS the table.`)
  if (!anyForced) console.error('   Cause: no table has FORCE ROW LEVEL SECURITY.')
  console.error('   Required: CREW-ORDER-011 §4.2 — a dedicated non-owner application role, and/or')
  console.error("   FORCE ROW LEVEL SECURITY. That change is Spock's, per Rule #3.")
  console.error('   Do NOT enter real community-member PII until this passes.\n')
  process.exit(1)
}

main().catch((err) => {
  console.error('\nverify-rls failed to run:', err?.message ?? err, '\n')
  process.exit(2)
})
