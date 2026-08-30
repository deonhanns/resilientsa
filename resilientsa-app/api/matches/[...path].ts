// api/matches/[...path].ts
// Vercel serverless catch-all — /api/matches/*
// Consolidates ORDER 006's 3 match handlers into ONE function (function-count
// consolidation to stay under the Vercel Hobby 12-function limit, Spock-approved).
//
// Internal routing (path segments from req.query.path):
//   (empty)        -> GET/POST /api/matches
//   :id/confirm    -> PATCH /api/matches/:id/confirm
//   :id/decline    -> PATCH /api/matches/:id/decline
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { db } from '../_lib/db'
import { matches } from '../../src/db/schema/public/matches'
import { listings } from '../../src/db/schema/public/listings'
import { eq, and, inArray, desc } from 'drizzle-orm'

type SessionCtx = { userId: string; userRole: string; nodeId: string }

function segments(req: VercelRequest): string[] {
  const p = req.query.path
  if (Array.isArray(p)) return p as string[]
  if (typeof p === 'string') return [p]
  return []
}

// GET/POST /api/matches
async function matchesRoot(req: VercelRequest, res: VercelResponse, session: SessionCtx) {
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

// PATCH /api/matches/:id/confirm
async function matchConfirm(req: VercelRequest, res: VercelResponse, matchId: string, session: SessionCtx) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const result = await withRLSContext(session.nodeId, session.userRole, async () => {
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1)
    if (!match) return null
    if (match.status !== 'proposed') return { conflict: true, current: match.status }

    const matchListings = await db.select({ userId: listings.userId })
      .from(listings).where(inArray(listings.id, match.listingIds))

    if (!matchListings.some((l) => l.userId === session.userId)) {
      return { forbidden: true }
    }

    return db.update(matches).set({ status: 'confirmed' })
      .where(eq(matches.id, matchId)).returning()
  })

  if (!result) return res.status(404).json({ error: 'Match not found' })
  if ('conflict' in (result as any)) return res.status(409).json({ error: 'Match in wrong state', current: (result as any).current })
  if ('forbidden' in (result as any)) return res.status(403).json({ error: 'Only matched listing owners can confirm' })
  return res.json((result as any)[0])
}

// PATCH /api/matches/:id/decline
async function matchDecline(req: VercelRequest, res: VercelResponse, matchId: string, session: SessionCtx) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const result = await withRLSContext(session.nodeId, session.userRole, async () => {
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1)
    if (!match) return null

    await db.update(listings)
      .set({ status: 'open', updatedAt: new Date() })
      .where(inArray(listings.id, match.listingIds))

    return db.update(matches).set({ status: 'declined' })
      .where(eq(matches.id, matchId)).returning()
  })

  if (!result) return res.status(404).json({ error: 'Match not found' })
  return res.json((result as any)[0])
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)
  const ctx = session as SessionCtx

  const seg = segments(req)
  const [p0, p1] = seg

  if (!p0) return matchesRoot(req, res, ctx)
  if (p1 === 'confirm') return matchConfirm(req, res, p0, ctx)
  if (p1 === 'decline') return matchDecline(req, res, p0, ctx)

  return res.status(404).json({ error: 'Not found' })
}
