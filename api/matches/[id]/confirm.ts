// api/matches/[id]/confirm.ts
// Vercel serverless function — PATCH /api/matches/:id/confirm
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { db } from '../../_lib/db'
import { matches } from '../../../src/db/schema/public/matches'
import { listings } from '../../../src/db/schema/public/listings'
import { eq, inArray } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const matchId = req.query.id as string
  if (!matchId) return res.status(400).json({ error: 'id required' })

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
