// api/_lib/db-context.ts
// Wraps database operations in a transaction that sets RLS context variables.
// Required for row-level security enforcement — every data route must use this.
//
// CREW-ORDER-011 §4.1: the transaction handle `tx` is now PASSED INTO `fn`.
//
// Previously `fn` took no arguments and every caller's closure queried the
// module-level `db` instead. The set_config() calls below are transaction-local
// (that is what the `true` is_local argument means), so they were applied to a
// transaction that ran none of the queries. RLS therefore never saw a node or
// role context at all.
//
// Closures MUST use the `tx` they are handed, not the module-level `db`:
//   await withRLSContext(nodeId, role, async (tx) => tx.select()...)
//
// A helper called from inside such a closure must also accept `tx` and use it —
// otherwise that route looks fixed while still running uncontexted.
//
// ⚠ CRIT-001 — CONFIRMED LIVE 2026-09-13, and NECESSARY BUT NOT SUFFICIENT:
// the application connects as `neondb_owner`, which owns every RLS-bearing table,
// and no table has FORCE ROW LEVEL SECURITY. PostgreSQL exempts a table's owner
// from RLS, so RLS is bypassed independently of this fix. Fixing this alone will
// NOT start enforcing RLS. See
// WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md §3.
import { db } from './db'
import { sql } from 'drizzle-orm'

/** The transaction handle type, exported so route helpers can accept and thread it. */
export type RlsTx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function withRLSContext<T>(
  nodeId: string,
  role: string,
  fn: (tx: RlsTx) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_node_id', ${nodeId}, true)`)
    await tx.execute(sql`SELECT set_config('app.current_role', ${role}, true)`)
    return fn(tx)
  })
}

export { sql }
