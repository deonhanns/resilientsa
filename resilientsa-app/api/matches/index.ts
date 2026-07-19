// api/matches/index.ts
// Vercel serverless function — GET/POST /api/matches
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { db } from '../_lib/db'
import { matches } from '../../src/db/schema/public/matches'
import { listings } from '../../src/db/schema/public/listings'
import { eq, and, inArray, desc } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  if (req.method === 'GET') {
    const { user_id } = req.query
    const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
      const conditions = []
      if (user_id) conditions.push(eq(matches.facilitatedBySteward, user_id as string))
      return db.select().from(matches)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(matches.createdAt)).limit(50)
    })
    return res.json(rows)
  }

  if (req.method === 'POST') {
    if (session.userRole !== 'cell_steward' && session.userRole !== 'node_admin') {
      return forbidden(res)
    }

    const { listing_ids } = req.body
    if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length < 2) {
      return res.status(400).json({ error: 'listing_ids array with at least 2 IDs required' })
    }

    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const existing = await db.select().from(listings)
        .where(and(inArray(listings.id, listing_ids), eq(listings.status, 'open')))
        .limit(listing_ids.length)

      if (existing.length !== listing_ids.length) {
        return { error: 'One or more listings are not open or do not exist' }
      }

      const [match] = await db.insert(matches).values({
        listingIds: listing_ids,
        status: 'proposed',
        facilitatedBySteward: session.userId,
      }).returning()

      await db.update(listings)
        .set({ status: 'matched', updatedAt: new Date() })
        .where(inArray(listings.id, listing_ids))

      return match
    })

    if ('error' in result) return res.status(400).json(result)
    return res.status(201).json(result)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
