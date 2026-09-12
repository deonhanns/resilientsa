// api/steward/[op]/[cellId].ts
// Vercel serverless function — GET /api/steward/:op/:cellId
//
// CREW-ORDER-010 Path B. Extracted from `api/steward/[...path].ts`, whose catch-all
// only ever matched ONE path segment, so every 2-segment steward route returned
// Vercel's platform 404 and was unreachable in production. See
// WORF_ALERTS/2026-09-11-catchall-routing-depth-failure.md.
//
// A genuinely nested file routes correctly at any depth (the working precedent is
// api/trade-completions/[match_id]/confirm-fairness.ts). One dynamic `[op]` file
// serves all four steward routes instead of four separate files — which keeps the
// function count unchanged rather than pushing it over the Hobby limit.
//
//   dashboard/:cellId        -> GET /api/steward/dashboard/:cellId
//   isolates/:cellId         -> GET /api/steward/isolates/:cellId
//   hubs/:cellId             -> GET /api/steward/hubs/:cellId
//   network-summary/:cellId  -> GET /api/steward/network-summary/:cellId
//
// Logic is ported verbatim from the catch-all. No behavioural change.
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
import { eq, and, gte, count, desc, sql } from 'drizzle-orm'

type SessionCtx = { userId: string; userRole: string; nodeId: string }

const DEMO_SENTINEL_CELL_ID = 'c0000000-0000-0000-0000-000000000000'

function isStewardOrAdmin(role: string): boolean {
  return role === 'cell_steward' || role === 'node_admin'
}

// GET /api/steward/dashboard/:cellId
async function dashboard(req: VercelRequest, res: VercelResponse, cellId: string, session: SessionCtx) {
  // Guard against placeholder/invalid cell IDs
  if (cellId === DEMO_SENTINEL_CELL_ID) {
    return res.json({
      cellName: 'Demo Cell',
      members: [],
      needsRadar: {},
      recentActivity: { newListings: 0, completedTrades: 0, newConnections: 0 },
      reciprocityFlags: [],
    })
  }

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

// GET /api/steward/isolates/:cellId
async function isolates(req: VercelRequest, res: VercelResponse, cellId: string, session: SessionCtx) {
  if (cellId === DEMO_SENTINEL_CELL_ID) {
    return res.json({ isolates: [], count: 0, lastChecked: new Date().toISOString() })
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const cellMembers = await db
        .select({ id: users.id, displayName: users.displayName })
        .from(users).where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))

      const isolatesArr: any[] = []
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

          isolatesArr.push({
            id: m.id, displayName: m.displayName,
            lastActive: lastConn?.lastActive?.toISOString() ?? null,
            daysSinceLastConnection: lastConn?.lastActive ? Math.floor((Date.now() - lastConn.lastActive.getTime()) / (1000 * 60 * 60 * 24)) : 999,
            giftsProfile: giftsProfile[0] ?? null,
          })
        }
      }
      isolatesArr.sort((a, b) => b.daysSinceLastConnection - a.daysSinceLastConnection)
      return { isolates: isolatesArr, count: isolatesArr.length, lastChecked: new Date().toISOString() }
    })

    return res.json(result)
  } catch (err) {
    console.error('Isolates query error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/steward/hubs/:cellId
async function hubs(req: VercelRequest, res: VercelResponse, cellId: string, session: SessionCtx) {
  if (cellId === DEMO_SENTINEL_CELL_ID) {
    return res.json({ hubs: [], burnoutRisk: false })
  }

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

      const hubsArr = memberConnections
        .filter((m) => m.connectionCount > median * 2 && m.connectionCount > 0)
        .map((m) => { let risk: 'none' | 'attention' | 'concern' = 'none'; if (m.connectionCount > median * 3) risk = 'concern'; else if (m.connectionCount > median * 2) risk = 'attention'; return { id: m.id, displayName: m.displayName, connectionCount: m.connectionCount, risk } })
        .sort((a, b) => b.connectionCount - a.connectionCount)

      return { hubs: hubsArr, burnoutRisk }
    })

    return res.json(result)
  } catch (err) {
    console.error('Hubs query error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Sum of connection events touching any member in `memberIds`, within
// [since, until). Deliberately follows the same per-member N+1 loop
// pattern already established in dashboard()/isolates()/hubs() above,
// rather than introducing a new query shape for this one route.
async function countConnectionsInWindow(
  nodeId: string,
  memberIds: string[],
  since: Date,
  until?: Date,
): Promise<number> {
  let total = 0
  for (const id of memberIds) {
    const conditions = [
      eq(connectionEvents.nodeId, nodeId),
      gte(connectionEvents.createdAt, since),
      sql`(${connectionEvents.userAId} = ${id} OR ${connectionEvents.userBId} = ${id})`,
    ]
    if (until) conditions.push(sql`${connectionEvents.createdAt} < ${until}`)
    const [c] = await db.select({ count: count() }).from(connectionEvents).where(and(...conditions))
    total += c?.count ?? 0
  }
  return total
}

type Phase = 'scattered' | 'hub-and-spoke' | 'multi-hub' | 'core-periphery'
type Trend = 'growing' | 'stable' | 'declining'

// Four-phase topology model per CREW-ORDER-007 §6.1.4 (June Holley / Krebs & Holley).
function determinePhase(memberConnCounts: number[]): Phase {
  const sorted = [...memberConnCounts].sort((a, b) => a - b)
  const n = sorted.length
  const median = n > 0
    ? (n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)])
    : 0
  const over5 = sorted.filter((c) => c > 5).length
  const over3 = sorted.filter((c) => c > 3).length

  // core-periphery: top quartile all > 5, bottom quartile all < 2
  if (n >= 4) {
    const q = Math.floor(n / 4)
    const topQuartile = sorted.slice(n - q)
    const bottomQuartile = sorted.slice(0, q)
    if (topQuartile.length > 0 && topQuartile.every((c) => c > 5)
      && bottomQuartile.length > 0 && bottomQuartile.every((c) => c < 2)) {
      return 'core-periphery'
    }
  }

  if (over3 >= 4 && median > 2) return 'multi-hub'
  if (over5 >= 1 && over5 <= 3) return 'hub-and-spoke'
  return 'scattered'
}

function pickMessage(phase: Phase, trend: Trend, weekConnections: number): string {
  if (trend === 'growing') {
    return `Your cell's connections are growing — ${weekConnections} new connection${weekConnections === 1 ? '' : 's'} this week.`
  }
  if (phase === 'scattered') {
    return "Your cell is just getting started — most members haven't connected yet."
  }
  if (phase === 'hub-and-spoke') {
    return "A few members are connecting everyone — try introducing people who haven't met."
  }
  // multi-hub or core-periphery, not growing
  return 'Your network is dense and distributed — the connections are making themselves.'
}

// GET /api/steward/network-summary/:cellId
async function networkSummary(req: VercelRequest, res: VercelResponse, cellId: string, session: SessionCtx) {
  if (cellId === DEMO_SENTINEL_CELL_ID) {
    return res.json({
      phase: 'scattered', trend: 'stable',
      message: "Your cell is just getting started — most members haven't connected yet.",
      stat: '0 connections this month', lastUpdated: new Date().toISOString(),
    })
  }

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const [cell] = await db.select({ id: cells.id }).from(cells)
        .where(and(eq(cells.id, cellId), eq(cells.nodeId, session.nodeId)))
      if (!cell) return { error: 'Cell not found', status: 404 as const }

      const cellMembers = await db.select({ id: users.id }).from(users)
        .where(and(eq(users.cellId!, cellId), eq(users.nodeId, session.nodeId)))
      const memberIds = cellMembers.map((m) => m.id)

      if (memberIds.length === 0) {
        return {
          phase: 'scattered' as Phase, trend: 'stable' as Trend,
          message: "Your cell is just getting started — most members haven't connected yet.",
          stat: '0 connections this month', lastUpdated: now.toISOString(),
        }
      }

      // Per-member 30-day counts, for phase determination
      const memberConnCounts: number[] = []
      for (const id of memberIds) {
        const c = await countConnectionsInWindow(session.nodeId, [id], thirtyDaysAgo)
        memberConnCounts.push(c)
      }
      const phase = determinePhase(memberConnCounts)

      const currentPeriod = await countConnectionsInWindow(session.nodeId, memberIds, thirtyDaysAgo)
      const previousPeriod = await countConnectionsInWindow(session.nodeId, memberIds, sixtyDaysAgo, thirtyDaysAgo)
      const weekConnections = await countConnectionsInWindow(session.nodeId, memberIds, sevenDaysAgo)

      let trend: Trend = 'stable'
      if (previousPeriod === 0) {
        trend = currentPeriod > 0 ? 'growing' : 'stable'
      } else {
        const pctChange = (currentPeriod - previousPeriod) / previousPeriod
        if (pctChange > 0.2) trend = 'growing'
        else if (pctChange < -0.2) trend = 'declining'
      }

      return {
        phase, trend,
        message: pickMessage(phase, trend, weekConnections),
        stat: `${currentPeriod} connection${currentPeriod === 1 ? '' : 's'} this month`,
        lastUpdated: now.toISOString(),
      }
    })

    if (result && 'error' in result) return res.status(result.status ?? 500).json({ error: result.error })
    return res.json(result)
  } catch (err) {
    console.error('Network summary error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getSession(req)
  if (!session) return unauthorized(res)
  if (!isStewardOrAdmin(session.userRole)) return forbidden(res)

  const ctx = session as SessionCtx
  const op = req.query.op as string
  const cellId = req.query.cellId as string

  if (!op || !cellId) return res.status(404).json({ error: 'Not found' })

  if (op === 'dashboard') return dashboard(req, res, cellId, ctx)
  if (op === 'isolates') return isolates(req, res, cellId, ctx)
  if (op === 'hubs') return hubs(req, res, cellId, ctx)
  if (op === 'network-summary') return networkSummary(req, res, cellId, ctx)

  return res.status(404).json({ error: 'Not found' })
}
