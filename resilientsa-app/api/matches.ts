// api/matches.ts
// Consolidated matches routes — GET/POST /api/matches, PATCH /api/matches/:id/confirm, PATCH /api/matches/:id/decline
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from './_lib/session'
import { withRLSContext } from './_lib/db-context'
import { db } from './_lib/db'
import { matches } from '../src/db/schema/public/matches'
import { listings } from '../src/db/schema/public/listings'
import { eq, and, inArray, desc } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)
  const url = req.url ?? ''

  // GET /api/matches
  if (req.method === 'GET' && !url.includes('/confirm') && !url.includes('/decline')) {
    const user_id = req.query.user_id
    const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
      const conditions = []
      if (user_id) conditions.push(eq(matches.facilitatedBySteward, user_id as string))
      return db.select().from(matches).where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(matches.createdAt)).limit(50)
    })
    return res.json(rows)
  }

  // POST /api/matches
  if (req.method === 'POST') {
    if (session.userRole !== 'cell_steward' && session.userRole !== 'node_admin') return forbidden(res)
    const { listing_ids } = req.body
    if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length < 2) {
      return res.status(400).json({ error: 'listing_ids array with at least 2 IDs required' })
    }
    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const existing = await db.select().from(listings)
        .where(and(inArray(listings.id, listing_ids), eq(listings.status, 'open'))).limit(listing_ids.length)
      if (existing.length !== listing_ids.length) return { error: 'One or more listings are not open or do not exist' }
      const [match] = await db.insert(matches).values({
        listingIds: listing_ids, status: 'proposed', facilitatedBySteward: session.userId,
      }).returning()
      await db.update(listings).set({ status: 'matched', updatedAt: new Date() }).where(inArray(listings.id, listing_ids))
      return match
    })
    if ('error' in result) return res.status(400).json(result)
    return res.status(201).json(result)
  }

  // PATCH /api/matches/:id/confirm or /api/matches/:id/decline
  if (req.method === 'PATCH') {
    const parts = url.split('/')
    const matchId = parts[parts.length - 2] // .../matches/:id/confirm → :id is second-to-last
    if (!matchId) return res.status(400).json({ error: 'id required' })

    if (url.endsWith('/confirm')) {
      const result = await withRLSContext(session.nodeId, session.userRole, async () => {
        const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1)
        if (!match) return null
        if (match.status !== 'proposed') return { conflict: true, current: match.status }
        const matchListings = await db.select({ userId: listings.userId }).from(listings).where(inArray(listings.id, match.listingIds))
        if (!matchListings.some((l) => l.userId === session.userId)) return { forbidden: true }
        return db.update(matches).set({ status: 'confirmed' }).where(eq(matches.id, matchId)).returning()
      })
      if (!result) return res.status(404).json({ error: 'Match not found' })
      if ('conflict' in (result as any)) return res.status(409).json({ error: 'Match in wrong state', current: (result as any).current })
      if ('forbidden' in (result as any)) return res.status(403).json({ error: 'Only matched listing owners can confirm' })
      return res.json((result as any)[0])
    }

    if (url.endsWith('/decline')) {
      const result = await withRLSContext(session.nodeId, session.userRole, async () => {
        const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1)
        if (!match) return null
        await db.update(listings).set({ status: 'open', updatedAt: new Date() }).where(inArray(listings.id, match.listingIds))
        return db.update(matches).set({ status: 'declined' }).where(eq(matches.id, matchId)).returning()
      })
      if (!result) return res.status(404).json({ error: 'Match not found' })
      return res.json((result as any)[0])
    }
  }

  return res.status(404).json({ error: 'Not found' })
}
