// api/steward/log-offline-trade.ts
// Vercel serverless function — POST /api/steward/log-offline-trade
// Deviation from CREW-ORDER-007 spec: TradeCompletion is not created because
// the schema requires matchId (NOT NULL) and manual offline trades have no match.
// ConnectionEvent rows serve the same network-health purpose.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { db } from '../_lib/db'
import { users } from '../../src/db/schema/public/users'
import { listings } from '../../src/db/schema/public/listings'
import { connectionEvents } from '../../src/db/schema/public/connection-events'
import { eq, and, sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)
  if (session.userRole !== 'cell_steward' && session.userRole !== 'node_admin') return forbidden(res)

  const { cellId, description, pillar, offeringParty, needingParty, date } = req.body
  if (!cellId || !description || !pillar || !offeringParty || !needingParty) {
    return res.status(400).json({ error: 'Missing required fields: cellId, description, pillar, offeringParty, needingParty' })
  }

  try {
    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const parties = await db.select({ id: users.id }).from(users)
        .where(and(eq(users.nodeId, session.nodeId), eq(users.cellId!, cellId), sql`${users.id} IN (${offeringParty}, ${needingParty})`))
      if (parties.length !== 2) return { error: 'One or both parties are not members of this cell', status: 400 }

      const tradeDate = date ? new Date(date) : new Date()

      const [listing] = await db.insert(listings).values({
        nodeId: session.nodeId, cellId, userId: offeringParty, type: 'offer',
        pillarTags: [pillar], title: description.substring(0, 100), description,
        status: 'completed', createdAt: tradeDate, updatedAt: tradeDate,
      }).returning({ id: listings.id })

      await db.insert(connectionEvents).values([
        { nodeId: session.nodeId, userAId: offeringParty, userBId: needingParty, eventType: 'trade_completed', createdAt: tradeDate },
        { nodeId: session.nodeId, userAId: needingParty, userBId: offeringParty, eventType: 'trade_completed', createdAt: tradeDate },
      ])

      return { listingId: listing.id, status: 201 }
    })

    if (result && 'error' in result) return res.status(result.status ?? 500).json({ error: result.error })
    if (result && 'listingId' in result) return res.status(201).json({ listingId: result.listingId })
    return res.status(500).json({ error: 'Failed to log offline trade' })
  } catch (err) {
    console.error('Log offline trade error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
