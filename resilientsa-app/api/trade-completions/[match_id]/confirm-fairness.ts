// api/trade-completions/[match_id]/confirm-fairness.ts
// Vercel serverless function — POST /api/trade-completions/:matchId/confirm-fairness
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { db } from '../../_lib/db'
import { matches } from '../../../src/db/schema/public/matches'
import { listings } from '../../../src/db/schema/public/listings'
import { tradeCompletions } from '../../../src/db/schema/public/trade-completions'
import { connectionEvents } from '../../../src/db/schema/public/connection-events'
import { eq, inArray } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const matchId = req.query.match_id as string
  if (!matchId) return res.status(400).json({ error: 'match_id required' })

  const result = await withRLSContext(session.nodeId, session.userRole, async () => {
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1)
    if (!match) return null
    if (match.status === 'completed') return { conflict: true, message: 'Trade already completed' }

    let [completion] = await db.select().from(tradeCompletions)
      .where(eq(tradeCompletions.matchId, matchId)).limit(1)

    if (!completion) {
      ;[completion] = await db.insert(tradeCompletions).values({
        matchId,
        fairnessConfirmedByEachParty: { [session.userId]: true },
      }).returning()
    } else {
      const confirmations = completion.fairnessConfirmedByEachParty as Record<string, boolean>
      confirmations[session.userId] = true
      await db.update(tradeCompletions)
        .set({ fairnessConfirmedByEachParty: confirmations })
        .where(eq(tradeCompletions.id, completion.id))
      completion = { ...completion, fairnessConfirmedByEachParty: confirmations }
    }

    const matchListings = await db.select({ userId: listings.userId })
      .from(listings).where(inArray(listings.id, match.listingIds))
    const allPartyIds = matchListings.map((l) => l.userId)
    const confirmations = completion.fairnessConfirmedByEachParty as Record<string, boolean>
    const allConfirmed = allPartyIds.every((uid) => confirmations[uid])

    if (allConfirmed) {
      await db.update(matches).set({ status: 'completed' }).where(eq(matches.id, matchId))
      await db.update(listings)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(inArray(listings.id, match.listingIds))

      if (allPartyIds.length >= 2) {
        const [a, b] = allPartyIds
        await db.insert(connectionEvents).values([
          { nodeId: session.nodeId, userAId: a, userBId: b, eventType: 'trade_completed' },
          { nodeId: session.nodeId, userAId: b, userBId: a, eventType: 'trade_completed' },
        ])
      }
      return { ...completion, completed: true }
    }

    return completion
  })

  if (!result) return res.status(404).json({ error: 'Match not found' })
  if ('conflict' in result) return res.status(409).json({ error: (result as any).message })
  return res.json(result)
}
