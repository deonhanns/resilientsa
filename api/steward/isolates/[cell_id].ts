// api/steward/isolates/[cell_id].ts
// Vercel serverless function — GET /api/steward/isolates/:cellId
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { db } from '../../_lib/db'
import { users } from '../../../src/db/schema/public/users'
import { giftsProfiles } from '../../../src/db/schema/public/gifts-profiles'
import { connectionEvents } from '../../../src/db/schema/public/connection-events'
import { eq, and, count, desc, sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)
  if (session.userRole !== 'cell_steward' && session.userRole !== 'node_admin') return forbidden(res)

  const cellId = req.query.cell_id as string
  if (!cellId) return res.status(400).json({ error: 'cell_id required' })

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const cellMembers = await db
        .select({ id: users.id, displayName: users.displayName })
        .from(users).where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))

      const isolates: any[] = []
      for (const m of cellMembers) {
        const [connCount] = await db.select({ count: count() }).from(connectionEvents)
          .where(and(eq(connectionEvents.nodeId, session.nodeId), sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`))

        const [lastConn] = await db.select({ lastActive: connectionEvents.createdAt }).from(connectionEvents)
          .where(and(eq(connectionEvents.nodeId, session.nodeId), sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`))
          .orderBy(desc(connectionEvents.createdAt)).limit(1)

        const connectionCount = connCount?.count ?? 0
        const hasRecent = lastConn?.lastActive != null && lastConn.lastActive >= thirtyDaysAgo

        if (connectionCount === 0 || !hasRecent) {
          const giftsProfile = await db
            .select({ lovesToDo: giftsProfiles.lovesToDo, caresDeeplyAbout: giftsProfiles.caresDeeplyAbout })
            .from(giftsProfiles).where(eq(giftsProfiles.userId, m.id)).limit(1)

          isolates.push({
            id: m.id, displayName: m.displayName,
            lastActive: lastConn?.lastActive?.toISOString() ?? null,
            daysSinceLastConnection: lastConn?.lastActive ? Math.floor((Date.now() - lastConn.lastActive.getTime()) / (1000 * 60 * 60 * 24)) : 999,
            giftsProfile: giftsProfile[0] ?? null,
          })
        }
      }
      isolates.sort((a, b) => b.daysSinceLastConnection - a.daysSinceLastConnection)
      return { isolates, count: isolates.length, lastChecked: new Date().toISOString() }
    })

    return res.json(result)
  } catch (err) {
    console.error('Isolates query error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
