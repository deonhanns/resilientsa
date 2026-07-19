// api/steward/hubs/[cell_id].ts
// Vercel serverless function — GET /api/steward/hubs/:cellId
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { db } from '../../_lib/db'
import { users } from '../../../src/db/schema/public/users'
import { connectionEvents } from '../../../src/db/schema/public/connection-events'
import { eq, and, gte, count, sql } from 'drizzle-orm'

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
        .select({ id: users.id, displayName: users.displayName, role: users.role })
        .from(users).where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))

      const memberConnections: { id: string; displayName: string; role: string; connectionCount: number }[] = []
      for (const m of cellMembers) {
        const [connCount] = await db.select({ count: count() }).from(connectionEvents)
          .where(and(eq(connectionEvents.nodeId, session.nodeId), gte(connectionEvents.createdAt, thirtyDaysAgo), sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`))
        memberConnections.push({ id: m.id, displayName: m.displayName, role: m.role ?? 'member', connectionCount: connCount?.count ?? 0 })
      }

      const counts = memberConnections.map((m) => m.connectionCount).sort((a, b) => a - b)
      const median = counts.length > 0 ? (counts.length % 2 === 0 ? (counts[counts.length / 2 - 1] + counts[counts.length / 2]) / 2 : counts[Math.floor(counts.length / 2)]) : 0

      const stewardsOwnCount = memberConnections.find((m) => m.role === 'cell_steward')?.connectionCount ?? 0
      const burnoutRisk = stewardsOwnCount > median * 2 && median > 0

      const hubs = memberConnections
        .filter((m) => m.connectionCount > median * 2 && m.connectionCount > 0)
        .map((m) => { let risk: 'none' | 'attention' | 'concern' = 'none'; if (m.connectionCount > median * 3) risk = 'concern'; else if (m.connectionCount > median * 2) risk = 'attention'; return { id: m.id, displayName: m.displayName, connectionCount: m.connectionCount, risk } })
        .sort((a, b) => b.connectionCount - a.connectionCount)

      return { hubs, burnoutRisk }
    })

    return res.json(result)
  } catch (err) {
    console.error('Hubs query error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
