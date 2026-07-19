// api/steward/dashboard/[cell_id].ts
// Vercel serverless function — GET /api/steward/dashboard/:cellId
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { db } from '../../_lib/db'
import { users } from '../../../src/db/schema/public/users'
import { cells } from '../../../src/db/schema/public/cells'
import { giftsProfiles } from '../../../src/db/schema/public/gifts-profiles'
import { listings } from '../../../src/db/schema/public/listings'
import { connectionEvents } from '../../../src/db/schema/public/connection-events'
import { tradeCompletions } from '../../../src/db/schema/public/trade-completions'
import { eq, and, gte, count, sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getSession(req)
  if (!session) return unauthorized(res)
  if (session.userRole !== 'cell_steward' && session.userRole !== 'node_admin') return forbidden(res)

  const cellId = req.query.cell_id as string
  if (!cellId) return res.status(400).json({ error: 'cell_id required' })

  try {
    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const [cell] = await db
        .select({ id: cells.id, name: cells.name, stewardUserId: cells.stewardUserId })
        .from(cells).where(and(eq(cells.id, cellId), eq(cells.nodeId, session.nodeId)))

      if (!cell) return { error: 'Cell not found', status: 404 }

      const memberRows = await db
        .select({ id: users.id, displayName: users.displayName, role: users.role })
        .from(users).where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const membersWithActivity = await Promise.all(memberRows.map(async (m) => {
        const giftsProfile = await db
          .select({ lovesToDo: giftsProfiles.lovesToDo, caresDeeplyAbout: giftsProfiles.caresDeeplyAbout })
          .from(giftsProfiles).where(eq(giftsProfiles.userId, m.id)).limit(1)

        const [connCount] = await db
          .select({ count: count() }).from(connectionEvents)
          .where(and(
            eq(connectionEvents.nodeId, session.nodeId),
            gte(connectionEvents.createdAt, thirtyDaysAgo),
            sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`,
          ))

        return {
          id: m.id, displayName: m.displayName, role: m.role,
          recentConnections: connCount?.count ?? 0,
          giftsProfile: giftsProfile[0] ?? null,
        }
      }))

      membersWithActivity.sort((a, b) => a.recentConnections - b.recentConnections)

      const needsRadarRaw = await db
        .select({ pillarTag: sql<string>`unnest(${listings.pillarTags})` })
        .from(listings).where(and(
          eq(listings.nodeId, session.nodeId), eq(listings.cellId, cellId),
          eq(listings.type, 'need'), eq(listings.status, 'open'),
        ))

      const needsRadar: Record<string, number> = {}
      for (const row of needsRadarRaw) {
        needsRadar[row.pillarTag] = (needsRadar[row.pillarTag] || 0) + 1
      }

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const [newListingsCount] = await db.select({ count: count() }).from(listings)
        .where(and(eq(listings.nodeId, session.nodeId), eq(listings.cellId, cellId), gte(listings.createdAt, sevenDaysAgo)))
      const [completedTradesCount] = await db.select({ count: count() }).from(tradeCompletions)
        .where(gte(tradeCompletions.completedAt, sevenDaysAgo))
      const [newConnectionsCount] = await db.select({ count: count() }).from(connectionEvents)
        .where(and(eq(connectionEvents.nodeId, session.nodeId), gte(connectionEvents.createdAt, sevenDaysAgo)))

      const reciprocityFlags: any[] = []
      for (const m of membersWithActivity) {
        const [offeringCount] = await db.select({ count: count() }).from(listings)
          .where(and(eq(listings.userId, m.id), eq(listings.type, 'offer'), eq(listings.status, 'completed')))
        const [needingCount] = await db.select({ count: count() }).from(listings)
          .where(and(eq(listings.userId, m.id), eq(listings.type, 'need'), eq(listings.status, 'completed')))

        const giving = offeringCount?.count ?? 0
        const receiving = needingCount?.count ?? 0
        const total = giving + receiving
        if (total >= 3) {
          if (giving > receiving * 3) {
            reciprocityFlags.push({ memberId: m.id, name: m.displayName, direction: 'giving', ratio: receiving > 0 ? Math.round((giving / receiving) * 10) / 10 : giving })
          } else if (receiving > giving * 3) {
            reciprocityFlags.push({ memberId: m.id, name: m.displayName, direction: 'receiving', ratio: giving > 0 ? Math.round((receiving / giving) * 10) / 10 : receiving })
          }
        }
      }

      return { cellName: cell.name, members: membersWithActivity, needsRadar, recentActivity: { newListings: newListingsCount?.count ?? 0, completedTrades: completedTradesCount?.count ?? 0, newConnections: newConnectionsCount?.count ?? 0 }, reciprocityFlags, status: 200 }
    })

    if (result && 'error' in result) return res.status(result.status ?? 500).json({ error: result.error })
    return res.json(result)
  } catch (err) {
    console.error('Steward dashboard error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
