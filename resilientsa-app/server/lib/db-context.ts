// server/lib/db-context.ts
// Wraps database operations in a transaction that sets RLS context variables.
// Required for row-level security enforcement — every data route must use this.
import { db } from '../../src/db/client'
import { sql } from 'drizzle-orm'

export async function withRLSContext<T>(
  nodeId: string,
  role: string,
  fn: () => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_node_id', ${nodeId}, true)`)
    await tx.execute(sql`SELECT set_config('app.current_role', ${role}, true)`)
    return fn()
  })
}

// Re-export for convenience — routes can destructure { withRLSContext } from here
export { sql }
