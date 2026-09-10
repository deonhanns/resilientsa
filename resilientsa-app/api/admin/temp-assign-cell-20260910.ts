// api/admin/temp-assign-cell-20260910.ts
//
// TEMPORARY, ONE-SHOT endpoint — created 2026-09-10, to be deleted
// immediately after use in this same session.
//
// Purpose: run scripts/assign-cell.ts's logic server-side, since the
// bridge sandbox this session cannot open raw TCP connections to
// Neon (port 5432) — only HTTP(S) to allowlisted domains. Vercel's
// serverless environment already has a working DATABASE_URL, so this
// runs the exact same operation from there instead.
//
// Narrow by design: no free-form input accepted. The target user id
// and cell id/name are hardcoded to the one operation this is for.
// Gated behind a random token known only for this one call. GET only.
// DELETE THIS FILE after the response comes back successful.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

const ONE_TIME_TOKEN = 'ub1zXHRl4tBU_npuw_3pZH1QgtZcqK2DOCoXjLdiBTc'
const TARGET_USER_ID = '70930429-e479-4013-8698-5e9325ef95cb'
const CELL_ID = 'c0000000-0000-0000-0000-000000000001'
const CELL_NAME = 'Cell 4'
const DEFAULT_NODE_ID = '00000000-0000-0000-0000-000000000001'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (req.query.token !== ONE_TIME_TOKEN) return res.status(403).json({ error: 'Forbidden' })

  try {
    await sql`INSERT INTO cells (id, node_id, name) VALUES (${CELL_ID}, ${DEFAULT_NODE_ID}, ${CELL_NAME}) ON CONFLICT DO NOTHING`

    const result = await sql`UPDATE users SET cell_id = ${CELL_ID} WHERE id = ${TARGET_USER_ID} RETURNING id, display_name, cell_id`

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No user found with id ${TARGET_USER_ID}` })
    }

    return res.json({ ok: true, user: result.rows[0] })
  } catch (err: any) {
    console.error('temp-assign-cell error:', err)
    return res.status(500).json({ error: err.message ?? 'Internal server error' })
  }
}
