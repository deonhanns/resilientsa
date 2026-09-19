// scripts/apply-rls-redesign.ts
//
// CREW-ORDER-011 §4.2 rollout steps 1–2 — applies the approved A1 / A2 SQL from
// CREW_ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-draft.md §3, approved in full
// by CREW_ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-approval.md (Spock, 2026-09-18).
//
// WHY A DEDICATED APPLIER
// These are RLS policy statements with no Drizzle representation, so they cannot
// be a generated migration. This mirrors the existing precedent for schema-level
// DDL (scripts/apply-custom-migration.ts applied 0001_custom_setup.sql by hand).
// The SQL lives in scripts/sql/, NOT drizzle/migrations/, because AGENTS.md lists
// drizzle/migrations/ as read-only-for-review.
//
// SAFETY PROPERTIES, each deliberate:
//   * REFUSES to run unless the connection role owns the tables (is the superuser
//     -like owner). DDL on RLS policy is an owner operation; running it as any
//     other role should be an error, not a surprise failure part-way through.
//   * Runs everything in ONE transaction. ALTER/CREATE/DROP POLICY are
//     transactional in PostgreSQL, so this is all-or-nothing — there is no window
//     where some policies are rewritten and others are not.
//   * PRINTS A BEFORE/AFTER SNAPSHOT so "changed nothing behaviourally" is
//     demonstrated rather than asserted. The snapshot includes a contextless
//     read as the current role, which is the concrete proof that the owner still
//     bypasses RLS.
//
// USAGE
//   cd resilientsa-app
//   npx tsx scripts/apply-rls-redesign.ts a1
//   npx tsx scripts/apply-rls-redesign.ts a2
// Exits 0 on success, 1 on failure.
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import pkg from 'pg'
const { Client } = pkg

dotenv.config({ path: '.env.local' })
dotenv.config()

const APPS: Record<string, string> = {
  a1: 'scripts/sql/2026-09-19-order011-4.2-a1-null-tolerant-policies.sql',
  a2: 'scripts/sql/2026-09-19-order011-4.2-a2-new-policies.sql',
  // STEP 1b — A1 revision. Authority:
  // CREW-ORDERS/CREW-ORDER-011-section-4.2-A1-revision-nullif.md (Spock, 2026-09-19).
  // Wraps every uuid-cast current_setting() in nullif(..., '') because on this platform
  // an unset custom GUC arrives as an EMPTY STRING, not NULL — so missing_ok alone did
  // not stop an absent context from raising 22P02 instead of failing closed.
  a1r: 'scripts/sql/2026-09-19-order011-4.2-a1-revision-nullif.sql',
  // STEP 2b — A1 revision, part 2: the 5 policies A2 introduced. Authority:
  // CREW-ORDERS/CREW-ORDER-011-section-4.2-A1-revision-part2.md (Spock, 2026-09-19).
  // A1's arithmetic stopped at its own file's 18 casts; the database held 23. This closes
  // the remaining 5, applying the identical reasoning to app.current_user_id.
  a1r2: 'scripts/sql/2026-09-19-order011-4.2-a1-revision-part2.sql',
}

const which = (process.argv[2] ?? '').toLowerCase()
const file = APPS[which]
if (!file) {
  console.error(`Usage: npx tsx scripts/apply-rls-redesign.ts <${Object.keys(APPS).join('|')}>`)
  process.exit(2)
}
if (!fs.existsSync(file)) {
  console.error(`SQL file not found: ${file}`)
  process.exit(2)
}

const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL
if (!url) {
  console.error('POSTGRES_URL / DATABASE_URL is not set — run from resilientsa-app/ with .env.local present.')
  process.exit(2)
}

type Snap = {
  role: string
  bypassrls: boolean | null
  policyTotal: number
  gucNoMissingOk: number
  gucWithMissingOk: number
  /** Policy expressions that cast current_setting to uuid with NO nullif guard (`::uuid`). */
  uuidCastNoNullif: number
  /**
   * Same, but written as `cast(... as uuid)`. Checked separately so a sixth pocket
   * cannot hide behind different syntax — the ruling asked for the WHOLE set, not just
   * the two rounds of casts we happen to have found.
   */
  castAsUuidNoNullif: number
  roleOnlyPolicies: number
  zeroPolicyTables: string[]
  usersRows: number
  listingsRows: number
}

async function snapshot(c: InstanceType<typeof Client>): Promise<Snap> {
  const meta = await c.query(`SELECT current_user AS role,
      (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user) AS bypassrls`)
  const pol = await c.query(`
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE expr LIKE '%current_setting%' AND expr NOT LIKE '%current_setting% true%')::int AS guc_no_missing_ok,
      count(*) FILTER (WHERE expr LIKE '%current_setting% true%')::int AS guc_with_missing_ok,
      -- ILIKE, not LIKE: PostgreSQL normalises the function name to upper case in
      -- pg_get_expr output ("NULLIF(...)"), so a case-sensitive pattern silently
      -- reported 0 matches and produced a FALSE FAILURE on the first a1r run.
      count(*) FILTER (WHERE expr LIKE '%::uuid%' AND expr NOT ILIKE '%nullif(%')::int AS uuid_cast_no_nullif,
      count(*) FILTER (WHERE expr ILIKE '%as uuid%' AND expr NOT ILIKE '%nullif(%')::int AS cast_as_uuid_no_nullif
    FROM (
      SELECT coalesce(pg_get_expr(p.polqual, p.polrelid), '') || ' ' ||
             coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') AS expr
      FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname IN ('public','coop_pii')
    ) t`)
  const zero = await c.query(`
    SELECT n.nspname||'.'||c.relname AS t
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind='r' AND c.relrowsecurity AND n.nspname IN ('public','coop_pii')
      AND NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid)
    ORDER BY 1`)
  // Contextless reads as the CURRENT role. For the owner with BYPASSRLS these must
  // return the full row counts both before and after — that is the behavioural
  // no-op proof. If RLS were somehow being enforced for this role, these would
  // drop to 0 (or raise) and the assertion below would fail loudly.
  const u = await c.query(`SELECT count(*)::int AS n FROM public.users`)
  const l = await c.query(`SELECT count(*)::int AS n FROM public.listings`)
  return {
    role: meta.rows[0].role,
    bypassrls: meta.rows[0].bypassrls,
    policyTotal: pol.rows[0].total,
    gucNoMissingOk: pol.rows[0].guc_no_missing_ok,
    gucWithMissingOk: pol.rows[0].guc_with_missing_ok,
    uuidCastNoNullif: pol.rows[0].uuid_cast_no_nullif,
    castAsUuidNoNullif: pol.rows[0].cast_as_uuid_no_nullif,
    roleOnlyPolicies: 0,
    zeroPolicyTables: zero.rows.map((r: any) => r.t),
    usersRows: u.rows[0].n,
    listingsRows: l.rows[0].n,
  }
}

function show(label: string, s: Snap) {
  console.log(`\n--- ${label} ---`)
  console.log(`  role                       : ${s.role}  (bypassrls=${s.bypassrls})`)
  console.log(`  total policies             : ${s.policyTotal}`)
  console.log(`  GUC policies WITHOUT missing_ok : ${s.gucNoMissingOk}`)
  console.log(`  GUC policies WITH missing_ok    : ${s.gucWithMissingOk}`)
  console.log(`  uuid casts WITHOUT nullif guard : ${s.uuidCastNoNullif}  (::uuid form)`)
  console.log(`  cast-as-uuid WITHOUT nullif     : ${s.castAsUuidNoNullif}  (cast(... as uuid) form)`)
  console.log(`  RLS-enabled, ZERO policies : ${s.zeroPolicyTables.length}${s.zeroPolicyTables.length ? ' -> ' + s.zeroPolicyTables.join(', ') : ' -> (none)'}`)
  console.log(`  contextless count users    : ${s.usersRows}`)
  console.log(`  contextless count listings : ${s.listingsRows}`)
}

async function main() {
  const sqlText = fs.readFileSync(file, 'utf-8')
  const statements = sqlText
    .split('\n')
    .filter((l) => !l.trim().startsWith('--'))
    .join('\n')
  console.log(`\nApplying ${path.basename(file)}  (${which.toUpperCase()})\n`)

  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await c.connect()
  try {
    const before = await snapshot(c)
    if (before.bypassrls !== true) {
      console.error(`\nREFUSING TO RUN: connected as "${before.role}" with bypassrls=${before.bypassrls}.`)
      console.error('This DDL is an owner operation and must be run as the table-owning role.')
      process.exit(1)
    }
    show('BEFORE', before)

    await c.query('BEGIN')
    try {
      await c.query(statements)
      await c.query('COMMIT')
      console.log('\n  transaction committed')
    } catch (e: any) {
      await c.query('ROLLBACK')
      console.error(`\n  ROLLED BACK — statement failed: ${e.message}`)
      process.exit(1)
    }

    const after = await snapshot(c)
    show('AFTER', after)

    // ---- assertions -------------------------------------------------
    const problems: string[] = []
    if (after.bypassrls !== before.bypassrls) problems.push('connection role bypassrls changed')
    if (after.usersRows !== before.usersRows)
      problems.push(`users row count changed ${before.usersRows} -> ${after.usersRows} (owner should still bypass RLS)`)
    if (after.listingsRows !== before.listingsRows)
      problems.push(`listings row count changed ${before.listingsRows} -> ${after.listingsRows}`)

    if (which === 'a1') {
      if (after.gucNoMissingOk !== 0) problems.push(`${after.gucNoMissingOk} GUC policies still lack missing_ok`)
      if (after.policyTotal !== before.policyTotal)
        problems.push(`policy count changed ${before.policyTotal} -> ${after.policyTotal} (A1 must only ALTER, never add/drop)`)
      if (after.zeroPolicyTables.length !== before.zeroPolicyTables.length)
        problems.push('the zero-policy table set changed (A1 must not affect it)')
    }
    if (which === 'a1r' || which === 'a1r2') {
      // The ruling's requirement, verbatim: zero unguarded uuid casts on any custom GUC,
      // across EVERY policy in both schemas — not merely the ones this round touched.
      if (after.uuidCastNoNullif !== 0)
        problems.push(`${after.uuidCastNoNullif} policy expression(s) still cast to uuid with no nullif guard`)
      if (after.castAsUuidNoNullif !== 0)
        problems.push(`${after.castAsUuidNoNullif} policy expression(s) use cast(... as uuid) with no nullif guard`)
      if (which === 'a1r' && after.policyTotal !== before.policyTotal)
        problems.push(`policy count changed ${before.policyTotal} -> ${after.policyTotal} (a1r must only ALTER, never add/drop)`)
      if (after.zeroPolicyTables.length !== before.zeroPolicyTables.length)
        problems.push('the zero-policy table set changed')
    }
    if (which === 'a2') {
      if (after.zeroPolicyTables.length !== 0)
        problems.push(`still ${after.zeroPolicyTables.length} table(s) with RLS and no policy: ${after.zeroPolicyTables.join(', ')}`)
      if (after.policyTotal <= before.policyTotal) problems.push('no policies were added')
    }

    console.log('\n=== ASSERTIONS ===')
    if (problems.length === 0) {
      console.log(`  ALL PASS — ${which.toUpperCase()} applied, behaviour unchanged for the current role.`)
      process.exit(0)
    }
    for (const p of problems) console.error(`  FAIL — ${p}`)
    process.exit(1)
  } finally {
    await c.end().catch(() => {})
  }
}

main().catch((e) => {
  console.error('FATAL', e.message)
  process.exit(1)
})
