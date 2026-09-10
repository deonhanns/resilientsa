// api/admin/temp-009a-bootstrap-20260910.ts
//
// TEMPORARY, ONE-SHOT endpoint — created 2026-09-10, to be deleted
// immediately after use in this same session. Same pattern as
// temp-assign-cell-20260910.ts earlier today.
//
// Does two things, in order, both required for CREW-ORDER-009a to be
// usable at all:
// 1. Applies migration 0004_nodes_created_by.sql (additive: ADD COLUMN +
//    a guarded ADD CONSTRAINT via DO block).
// 2. Grants the platform's first-ever regional_steward role, to the
//    hardcoded target user id below. No route can do this normally —
//    nobody holds an authorizing role yet (see CREW-ORDER-009a §6.5).
//
// Narrow by design: no free-form input, hardcoded target, random token
// gate, GET only. DELETE THIS FILE after a successful response.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

const ONE_TIME_TOKEN = 'pjoaLR0_KxRZCF8HrnMCCX5yE4OfDSuvif-y7Qbn-bk'
const TARGET_USER_ID = '70930429-e479-4013-8698-5e9325ef95cb'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (req.query.token !== ONE_TIME_TOKEN) return res.status(403).json({ error: 'Forbidden' })

  try {
    await sql`ALTER TABLE nodes ADD COLUMN IF NOT EXISTS created_by uuid`
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'nodes_created_by_users_id_fk'
        ) THEN
          ALTER TABLE nodes ADD CONSTRAINT nodes_created_by_users_id_fk
            FOREIGN KEY (created_by) REFERENCES users(id);
        END IF;
      END $$;
    `

    const result = await sql`
      UPDATE users SET role = 'regional_steward'
      WHERE id = ${TARGET_USER_ID}
      RETURNING id, display_name, role
    `

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No user found with id ${TARGET_USER_ID}` })
    }

    return res.json({ ok: true, migrationApplied: true, user: result.rows[0] })
  } catch (err: any) {
    console.error('temp-009a-bootstrap error:', err)
    return res.status(500).json({ error: err.message ?? 'Internal server error' })
  }
}
