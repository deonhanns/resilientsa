// api/steward.ts
// Consolidated steward routes — handles all /api/steward/* endpoints
// dashboard/:cellId, isolates/:cellId, hubs/:cellId, network-summary/:cellId, log-offline-trade
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from './_lib/session'
import { withRLSContext } from './_lib/db-context'
import { db } from './_lib/db'
import { users } from '../src/db/schema/public/users'
import { cells } from '../src/db/schema/public/cells'
import { giftsProfiles } from '../src/db/schema/public/gifts-profiles'
import { listings } from '../src/db/schema/public/listings'
import { connectionEvents } from '../src/db/schema/public/connection-events'
import { tradeCompletions } from '../src/db/schema/public/trade-completions'
import { networkPhaseSnapshots } from '../src/db/schema/public/network-phase-snapshots'
import { eq, and, gte, desc, asc, count, sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)
  if (session.userRole !== 'cell_steward' && session.userRole !== 'node_admin') return forbidden(res)

  const url = req.url ?? ''
  const parts = url.replace(/^\/api\/steward\/?/, '').split('/').filter(Boolean)

  try {
    // POST /api/steward/log-offline-trade
    if (req.method === 'POST' && url.includes('log-offline-trade')) {
      const { cellId, description, pillar, offeringParty, needingParty, date } = req.body
      if (!cellId || !description || !pillar || !offeringParty || !needingParty) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

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
      return res.status(201).json({ listingId: (result as any).listingId })
    }

    // GET routes need cell_id as query param
    const cellId = req.query.cell_id as string || parts[1]
    if (!cellId) return res.status(400).json({ error: 'cell_id required' })

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // GET /api/steward/dashboard/:cellId
    if (url.includes('/dashboard')) {
      const result = await withRLSContext(session.nodeId, session.userRole, async () => {
        const [cell] = await db.select({ id: cells.id, name: cells.name }).from(cells)
          .where(and(eq(cells.id, cellId), eq(cells.nodeId, session.nodeId)))
        if (!cell) return { error: 'Cell not found', status: 404 }

        const memberRows = await db.select({ id: users.id, displayName: users.displayName, role: users.role })
          .from(users).where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))

        const membersWithActivity = await Promise.all(memberRows.map(async (m) => {
          const giftsProfile = await db.select({ lovesToDo: giftsProfiles.lovesToDo, caresDeeplyAbout: giftsProfiles.caresDeeplyAbout })
            .from(giftsProfiles).where(eq(giftsProfiles.userId, m.id)).limit(1)
          const [connCount] = await db.select({ count: count() }).from(connectionEvents).where(and(
            eq(connectionEvents.nodeId, session.nodeId), gte(connectionEvents.createdAt, thirtyDaysAgo),
            sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`))
          return { id: m.id, displayName: m.displayName, role: m.role, recentConnections: connCount?.count ?? 0, giftsProfile: giftsProfile[0] ?? null }
        }))
        membersWithActivity.sort((a, b) => a.recentConnections - b.recentConnections)

        const needsRadarRaw = await db.select({ pillarTag: sql<string>`unnest(${listings.pillarTags})` }).from(listings)
          .where(and(eq(listings.nodeId, session.nodeId), eq(listings.cellId, cellId), eq(listings.type, 'need'), eq(listings.status, 'open')))
        const needsRadar: Record<string, number> = {}
        for (const row of needsRadarRaw) needsRadar[row.pillarTag] = (needsRadar[row.pillarTag] || 0) + 1

        const [nl] = await db.select({ count: count() }).from(listings).where(and(eq(listings.nodeId, session.nodeId), eq(listings.cellId, cellId), gte(listings.createdAt, sevenDaysAgo)))
        const [ct] = await db.select({ count: count() }).from(tradeCompletions).where(gte(tradeCompletions.completedAt, sevenDaysAgo))
        const [nc] = await db.select({ count: count() }).from(connectionEvents).where(and(eq(connectionEvents.nodeId, session.nodeId), gte(connectionEvents.createdAt, sevenDaysAgo)))

        const reciprocityFlags: any[] = []
        for (const m of membersWithActivity) {
          const [offeringCount] = await db.select({ count: count() }).from(listings).where(and(eq(listings.userId, m.id), eq(listings.type, 'offer'), eq(listings.status, 'completed')))
          const [needingCount] = await db.select({ count: count() }).from(listings).where(and(eq(listings.userId, m.id), eq(listings.type, 'need'), eq(listings.status, 'completed')))
          const giving = offeringCount?.count ?? 0; const receiving = needingCount?.count ?? 0; const total = giving + receiving
          if (total >= 3) {
            if (giving > receiving * 3) reciprocityFlags.push({ memberId: m.id, name: m.displayName, direction: 'giving', ratio: receiving > 0 ? Math.round((giving / receiving) * 10) / 10 : giving })
            else if (receiving > giving * 3) reciprocityFlags.push({ memberId: m.id, name: m.displayName, direction: 'receiving', ratio: giving > 0 ? Math.round((receiving / giving) * 10) / 10 : receiving })
          }
        }
        return { cellName: cell.name, members: membersWithActivity, needsRadar, recentActivity: { newListings: nl?.count ?? 0, completedTrades: ct?.count ?? 0, newConnections: nc?.count ?? 0 }, reciprocityFlags }
      })
      if (result && 'error' in result) return res.status(result.status ?? 500).json({ error: result.error })
      return res.json(result)
    }

    // GET /api/steward/isolates/:cellId
    if (url.includes('/isolates')) {
      const result = await withRLSContext(session.nodeId, session.userRole, async () => {
        const cellMembers = await db.select({ id: users.id, displayName: users.displayName }).from(users)
          .where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))
        const isolates: any[] = []
        for (const m of cellMembers) {
          const [connCount] = await db.select({ count: count() }).from(connectionEvents).where(and(eq(connectionEvents.nodeId, session.nodeId), sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`))
          const [lastConn] = await db.select({ lastActive: connectionEvents.createdAt }).from(connectionEvents).where(and(eq(connectionEvents.nodeId, session.nodeId), sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`)).orderBy(desc(connectionEvents.createdAt)).limit(1)
          const connectionCount = connCount?.count ?? 0
          const hasRecent = lastConn?.lastActive != null && lastConn.lastActive >= thirtyDaysAgo
          if (connectionCount === 0 || !hasRecent) {
            const gp = await db.select({ lovesToDo: giftsProfiles.lovesToDo, caresDeeplyAbout: giftsProfiles.caresDeeplyAbout }).from(giftsProfiles).where(eq(giftsProfiles.userId, m.id)).limit(1)
            isolates.push({ id: m.id, displayName: m.displayName, lastActive: lastConn?.lastActive?.toISOString() ?? null, daysSinceLastConnection: lastConn?.lastActive ? Math.floor((Date.now() - lastConn.lastActive.getTime()) / (1000 * 60 * 60 * 24)) : 999, giftsProfile: gp[0] ?? null })
          }
        }
        isolates.sort((a, b) => b.daysSinceLastConnection - a.daysSinceLastConnection)
        return { isolates, count: isolates.length, lastChecked: new Date().toISOString() }
      })
      return res.json(result)
    }

    // GET /api/steward/hubs/:cellId
    if (url.includes('/hubs')) {
      const result = await withRLSContext(session.nodeId, session.userRole, async () => {
        const cellMembers = await db.select({ id: users.id, displayName: users.displayName, role: users.role }).from(users)
          .where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))
        const memberConnections: { id: string; displayName: string; role: string; connectionCount: number }[] = []
        for (const m of cellMembers) {
          const [connCount] = await db.select({ count: count() }).from(connectionEvents).where(and(eq(connectionEvents.nodeId, session.nodeId), gte(connectionEvents.createdAt, thirtyDaysAgo), sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`))
          memberConnections.push({ id: m.id, displayName: m.displayName, role: m.role ?? 'member', connectionCount: connCount?.count ?? 0 })
        }
        const counts = memberConnections.map((m) => m.connectionCount).sort((a, b) => a - b)
        const median = counts.length > 0 ? (counts.length % 2 === 0 ? (counts[counts.length / 2 - 1] + counts[counts.length / 2]) / 2 : counts[Math.floor(counts.length / 2)]) : 0
        const stewardsOwnCount = memberConnections.find((m) => m.role === 'cell_steward')?.connectionCount ?? 0
        const burnoutRisk = stewardsOwnCount > median * 2 && median > 0
        const hubs = memberConnections.filter((m) => m.connectionCount > median * 2 && m.connectionCount > 0).map((m) => {
          let risk: 'none' | 'attention' | 'concern' = 'none'
          if (m.connectionCount > median * 3) risk = 'concern'; else if (m.connectionCount > median * 2) risk = 'attention'
          return { id: m.id, displayName: m.displayName, connectionCount: m.connectionCount, risk }
        }).sort((a, b) => b.connectionCount - a.connectionCount)
        return { hubs, burnoutRisk }
      })
      return res.json(result)
    }

    // GET /api/steward/network-summary/:cellId
    if (url.includes('/network-summary')) {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      const result = await withRLSContext(session.nodeId, session.userRole, async () => {
        const cellMembers = await db.select({ id: users.id }).from(users).where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))
        const memberIds = cellMembers.map((m) => m.id)
        if (memberIds.length === 0) return { phase: 'scattered_fragments', trend: 'stable', message: 'Your cell has no members yet.', stat: '0 members', lastUpdated: new Date().toISOString() }

        const memberConnCounts: number[] = []
        for (const id of memberIds) {
          const [c] = await db.select({ count: count() }).from(connectionEvents).where(and(eq(connectionEvents.nodeId, session.nodeId), gte(connectionEvents.createdAt, thirtyDaysAgo), sql`(${connectionEvents.userAId} = ${id} OR ${connectionEvents.userBId} = ${id})`))
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
        else { const tq = sorted[Math.floor(sorted.length * 0.75)]; const bq = sorted[Math.floor(sorted.length * 0.25)]; if (tq > 5 && bq < 2) phase = 'core_periphery'; else if (highConnectors > 0) phase = 'hub_and_spoke'; else phase = 'scattered_fragments' }

        let prevPeriodCount = 0
        for (const id of memberIds) { const [c] = await db.select({ count: count() }).from(connectionEvents).where(and(eq(connectionEvents.nodeId, session.nodeId), gte(connectionEvents.createdAt, sixtyDaysAgo), sql`${connectionEvents.createdAt} < ${thirtyDaysAgo}`, sql`(${connectionEvents.userAId} = ${id} OR ${connectionEvents.userBId} = ${id})`)); prevPeriodCount += c?.count ?? 0 }
        const currentTotal = memberConnCounts.reduce((sum, c) => sum + c, 0)
        let trend: string; if (prevPeriodCount === 0) trend = 'growing'; else { const change = (currentTotal - prevPeriodCount) / prevPeriodCount; if (change > 0.2) trend = 'growing'; else if (change < -0.2) trend = 'declining'; else trend = 'stable' }

        const phaseMessages: Record<string, Record<string, string>> = {
          scattered_fragments: { growing: 'Your cell is just getting started — members are beginning to connect.', stable: 'Your community is still in early formation.', declining: 'Connections have slowed — a few introductions could restart momentum.' },
          hub_and_spoke: { growing: 'A few members are connecting everyone — try introducing people who haven\'t met.', stable: 'Your network flows through a few key members.', declining: 'Your key connectors may need support.' },
          multi_hub: { growing: 'Your cell\'s connections are growing — the network is distributing itself.', stable: 'Your network is dense and well-distributed.', declining: 'Your network is strong but activity has dipped.' },
          core_periphery: { growing: 'Your network has a strong core and is reaching more members.', stable: 'Your network has a connected core.', declining: 'The edges of your network are thinning.' },
        }
        const message = phaseMessages[phase]?.[trend] ?? 'Network summary available.'
        await db.insert(networkPhaseSnapshots).values({ nodeId: session.nodeId, cellId, phase: phase as any, metrics: { memberCount: memberIds.length, connectionCount: currentTotal, medianConnections: median, isolateCount: memberConnCounts.filter((c) => c === 0).length, hubCount: highConnectors, trend } })
        return { phase, trend, message, stat: `${currentTotal} connections this month`, lastUpdated: new Date().toISOString() }
      })
      return res.json(result)
    }

    return res.status(404).json({ error: 'Not found' })
  } catch (err) {
    console.error('Steward error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
