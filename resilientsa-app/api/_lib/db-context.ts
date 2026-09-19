// api/_lib/db-context.ts
//
// Wraps node-scoped database work in a transaction that sets the RLS context
// variables. Every node-scoped data route must use this.
//
// ── CREW-ORDER-011 §4.1 (2026-09-13) ─────────────────────────────────────────
// The transaction handle `tx` is PASSED INTO `fn`. Previously `fn` took no
// arguments and every caller's closure queried the module-level `db` instead; the
// set_config() calls below are transaction-local, so the context was applied to a
// transaction that ran none of the queries, and RLS never saw it.
//
// ── CREW-ORDER-011 §4.2 (2026-09-19) ─────────────────────────────────────────
// Two changes, both from the approved redesign (§2 of
// CREW_ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-draft.md):
//
//  1. This now runs on the APPLICATION pool (`getDbApp`, POSTGRES_URL_APP), not the
//     privileged one. That is what makes the work above actually matter: §4.1 was
//     necessary but not sufficient, because the privileged connection carries
//     BYPASSRLS and therefore never evaluates a policy. Fixing the threading without
//     changing the connection identity changed nothing.
//
//  2. A THIRD variable, `app.current_user_id`. Not optional: gifts_profiles,
//     grounders and programme_offerings have no `node_id` column at all, so
//     ownership is the only boundary that can be expressed for them.
//
// Closures MUST use the `tx` they are handed, not a module-level client:
//   await withRLSContext(nodeId, role, userId, async (tx) => tx.select()...)
//
// A helper called from inside such a closure must also accept `tx` and use it —
// otherwise that route looks fixed while still running uncontexted.
//
// If POSTGRES_URL_APP is unset, getDbApp() throws AppConnectionUnavailableError and
// the route answers 503. That is deliberate: fail closed, never silently enforce
// nothing.
import { sql } from 'drizzle-orm'
import { getDbApp } from './db-app'

/** The transaction handle type, exported so route helpers can accept and thread it. */
export type RlsTx = Parameters<Parameters<ReturnType<typeof getDbApp>['transaction']>[0]>[0]

export async function withRLSContext<T>(
  nodeId: string,
  role: string,
  userId: string,
  fn: (tx: RlsTx) => Promise<T>,
): Promise<T> {
  const appDb = getDbApp()
  return appDb.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_node_id', ${nodeId}, true)`)
    await tx.execute(sql`SELECT set_config('app.current_role', ${role}, true)`)
    await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`)
    return fn(tx)
  })
}

export { sql }
