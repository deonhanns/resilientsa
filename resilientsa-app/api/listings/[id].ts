// api/listings/[id].ts
// Vercel serverless function — PATCH/DELETE /api/listings/:id
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { db } from '../_lib/db'
import { listings } from '../../src/db/schema/public/listings'
import { eq, and } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const id = req.query.id as string
  if (!id) return res.status(400).json({ error: 'id required' })

  if (req.method === 'PATCH') {
    const { title, description, status, expected_status } = req.body

    const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
      const [existing] = await db
        .select().from(listings)
        .where(and(eq(listings.id, id), eq(listings.userId, session.userId)))
        .limit(1)

      if (!existing) return null
      if (expected_status && existing.status !== expected_status) {
        return { conflict: true, current: existing.status }
      }

      return db.update(listings).set({
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
        updatedAt: new Date(),
      }).where(eq(listings.id, id)).returning()
    })

    if (!rows) return res.status(404).json({ error: 'Listing not found' })
    if (!Array.isArray(rows)) {
      if ('conflict' in rows) {
        return res.status(409).json({ error: 'Status conflict', current_status: (rows as any).current })
      }
      return res.status(500).json({ error: 'Unexpected response' })
    }
    return res.json(rows[0])
  }

  if (req.method === 'DELETE') {
    const rows = await withRLSContext(session.nodeId, session.userRole, () =>
      db.update(listings)
        .set({ status: 'withdrawn', updatedAt: new Date() })
        .where(and(eq(listings.id, id), eq(listings.userId, session.userId)))
        .returning()
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Listing not found or not yours' })
    return res.json(rows[0])
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
