// api/listings/index.ts
// Vercel serverless function — GET/POST /api/listings
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { db } from '../_lib/db'
import { listings } from '../../src/db/schema/public/listings'
import { users } from '../../src/db/schema/public/users'
import { eq, and, desc, sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  if (req.method === 'GET') {
    const { cell_id, pillar, type, status } = req.query

    const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
      const conditions = [eq(listings.nodeId, session.nodeId)]
      if (cell_id)  conditions.push(eq(listings.cellId, cell_id as string))
      if (status)   conditions.push(eq(listings.status, status as any))
      if (type)     conditions.push(eq(listings.type, type as any))
      if (pillar && pillar !== 'all') {
        conditions.push(sql`${listings.pillarTags} @> ARRAY[${pillar as string}]`)
      }
      return db.select().from(listings).where(and(...conditions)).orderBy(desc(listings.createdAt)).limit(100)
    })

    return res.json(rows)
  }

  if (req.method === 'POST') {
    const { type, pillar_tags, title, description } = req.body
    if (!type || !pillar_tags || !title) {
      return res.status(400).json({ error: 'type, pillar_tags, and title are required' })
    }

    const [user] = await withRLSContext(session.nodeId, session.userRole, () =>
      db.select({ cellId: users.cellId }).from(users).where(eq(users.id, session.userId)).limit(1)
    )

    if (!user?.cellId) {
      return res.status(400).json({ error: 'You must be assigned to a cell before posting a listing' })
    }

    const [listing] = await withRLSContext(session.nodeId, session.userRole, () =>
      db.insert(listings).values({
        nodeId:      session.nodeId,
        cellId:      user.cellId!,
        userId:      session.userId,
        type,
        pillarTags:  pillar_tags,
        title,
        description: description ?? null,
      }).returning()
    )

    return res.status(201).json(listing)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
