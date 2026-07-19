// api/matches/[id]/decline.ts
// Vercel serverless function — PATCH /api/matches/:id/decline
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

    await db.update(listings)
      .set({ status: 'open', updatedAt: new Date() })
      .where(inArray(listings.id, match.listingIds))

    return db.update(matches).set({ status: 'declined' })
      .where(eq(matches.id, matchId)).returning()
  })

  if (!result) return res.status(404).json({ error: 'Match not found' })
  return res.json((result as any)[0])
}
