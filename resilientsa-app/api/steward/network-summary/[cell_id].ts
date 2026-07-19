// api/steward/network-summary/[cell_id].ts
// Vercel serverless function — GET /api/steward/network-summary/:cellId
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { db } from '../../_lib/db'
import { users } from '../../../src/db/schema/public/users'
import { connectionEvents } from '../../../src/db/schema/public/connection-events'
import { networkPhaseSnapshots } from '../../../src/db/schema/public/network-phase-snapshots'
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
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const cellMembers = await db.select({ id: users.id }).from(users)
        .where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))
      const memberIds = cellMembers.map((m) => m.id)

      if (memberIds.length === 0) {
        return { phase: 'scattered_fragments', trend: 'stable', message: 'Your cell has no members yet.', stat: '0 members', lastUpdated: new Date().toISOString() }
      }

      const memberConnCounts: number[] = []
      for (const id of memberIds) {
        const [c] = await db.select({ count: count() }).from(connectionEvents)
          .where(and(eq(connectionEvents.nodeId, session.nodeId), gte(connectionEvents.createdAt, thirtyDaysAgo), sql`(${connectionEvents.userAId} = ${id} OR ${connectionEvents.userBId} = ${id})`))
        memberConnCounts.push(c?.count ?? 0)
      }

      const sorted = [...memberConnCounts].sort((a, b) => a - b)
      const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)]
      const highConnectors = memberConnCounts.filter((c) => c > 5).length
      const multiHubbers = memberConnCounts.filter((c) => c > 3).length

      let phase: string
      if (median < 2 && highConnectors === 0) phase = 'scattered_fragments'
      else if (highConnectors >= 1 && highConnectors <= 3 && median < 2) phase = 'hub_and_spoke'
      else if (multiHubbers >= 4 && median > 2) phase = 'multi_hub'
      else {
        const topQuartile = sorted[Math.floor(sorted.length * 0.75)]
        const bottomQuartile = sorted[Math.floor(sorted.length * 0.25)]
        if (topQuartile > 5 && bottomQuartile < 2) phase = 'core_periphery'
        else if (highConnectors > 0) phase = 'hub_and_spoke'
        else phase = 'scattered_fragments'
      }

      let prevPeriodCount = 0
      for (const id of memberIds) {
        const [c] = await db.select({ count: count() }).from(connectionEvents)
          .where(and(eq(connectionEvents.nodeId, session.nodeId), gte(connectionEvents.createdAt, sixtyDaysAgo), sql`${connectionEvents.createdAt} < ${thirtyDaysAgo}`, sql`(${connectionEvents.userAId} = ${id} OR ${connectionEvents.userBId} = ${id})`))
        prevPeriodCount += c?.count ?? 0
      }

      const currentTotal = memberConnCounts.reduce((sum, c) => sum + c, 0)
      let trend: string
      if (prevPeriodCount === 0) trend = 'growing'
      else { const change = (currentTotal - prevPeriodCount) / prevPeriodCount; if (change > 0.2) trend = 'growing'; else if (change < -0.2) trend = 'declining'; else trend = 'stable' }

      const phaseMessages: Record<string, Record<string, string>> = {
        scattered_fragments: { growing: 'Your cell is just getting started — members are beginning to connect.', stable: 'Your community is still in early formation — most members haven\'t connected yet.', declining: 'Connections have slowed — a few introductions could restart momentum.' },
        hub_and_spoke: { growing: 'A few members are connecting everyone — try introducing people who haven\'t met.', stable: 'Your network flows through a few key members — consider widening the circle.', declining: 'Your key connectors may need support — the network depends on them.' },
        multi_hub: { growing: 'Your cell\'s connections are growing — the network is distributing itself.', stable: 'Your network is dense and well-distributed — connections are making themselves.', declining: 'Your network is strong but activity has dipped — a gentle nudge can restore momentum.' },
        core_periphery: { growing: 'Your network has a strong core and is reaching more members.', stable: 'Your network has a connected core — the outer members could use more introductions.', declining: 'The edges of your network are thinning — focus on members with fewest connections.' },
      }

      const message = phaseMessages[phase]?.[trend] ?? 'Network summary available.'
      const stat = `${currentTotal} connections this month`

      await db.insert(networkPhaseSnapshots).values({
        nodeId: session.nodeId, cellId, phase: phase as any,
        metrics: { memberCount: memberIds.length, connectionCount: currentTotal, medianConnections: median, isolateCount: memberConnCounts.filter((c) => c === 0).length, hubCount: highConnectors, trend },
      })

      return { phase, trend, message, stat, lastUpdated: new Date().toISOString() }
    })

    return res.json(result)
  } catch (err) {
    console.error('Network summary error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
