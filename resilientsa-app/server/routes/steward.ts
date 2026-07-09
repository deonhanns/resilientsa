import { Router } from 'express'
import { requireSession, withRLSContext } from '../middleware/session'
import { db } from '../../src/db/client'
import { users } from '../../src/db/schema/public/users'
import { cells } from '../../src/db/schema/public/cells'
import { giftsProfiles } from '../../src/db/schema/public/gifts-profiles'
import { listings } from '../../src/db/schema/public/listings'
import { connectionEvents } from '../../src/db/schema/public/connection-events'
import { tradeCompletions } from '../../src/db/schema/public/trade-completions'
import { networkPhaseSnapshots } from '../../src/db/schema/public/network-phase-snapshots'
import { internalForecasts } from '../../src/db/schema/public/internal-forecasts'
import { eq, and, gte, desc, asc, count, sql } from 'drizzle-orm'

const router = Router()

// All steward routes require cell_steward or node_admin role
function requireSteward(req: any, res: any, next: any) {
  if (req.userRole !== 'cell_steward' && req.userRole !== 'node_admin') {
    res.status(403).json({ error: 'Steward access required' })
    return
  }
  next()
}

router.use(requireSession)
router.use(requireSteward)

// ================================================================
// GET /steward/dashboard/:cellId
// ================================================================
router.get('/dashboard/:cellId', async (req, res) => {
  const r = req as any
  const { cellId } = req.params

  try {
    const result = await withRLSContext(r.nodeId, r.userRole, async () => {
      // Verify the steward belongs to this cell
      const [cell] = await db
        .select({ id: cells.id, name: cells.name, stewardUserId: cells.stewardUserId })
        .from(cells)
        .where(and(eq(cells.id, cellId), eq(cells.nodeId, r.nodeId)))

      if (!cell) {
        return { error: 'Cell not found', status: 404 }
      }

      // Members: ordered by connection recency (isolates first)
      const memberRows = await db
        .select({
          id: users.id,
          displayName: users.displayName,
          role: users.role,
        })
        .from(users)
        .where(and(eq(users.cellId!, cellId), eq(users.nodeId, r.nodeId)))

      // Get connection counts for each member in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const membersWithActivity = await Promise.all(
        memberRows.map(async (m) => {
          const giftsProfile = await db
            .select({
              lovesToDo: giftsProfiles.lovesToDo,
              caresDeeplyAbout: giftsProfiles.caresDeeplyAbout,
            })
            .from(giftsProfiles)
            .where(eq(giftsProfiles.userId, m.id))
            .limit(1)

          const [connCount] = await db
            .select({ count: count() })
            .from(connectionEvents)
            .where(
              and(
                eq(connectionEvents.nodeId, r.nodeId),
                gte(connectionEvents.createdAt, thirtyDaysAgo),
                sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`,
              ),
            )

          return {
            id: m.id,
            displayName: m.displayName,
            role: m.role,
            recentConnections: connCount?.count ?? 0,
            giftsProfile: giftsProfile[0] ?? null,
          }
        }),
      )

      // Sort: isolates (0 connections) first, then ascending
      membersWithActivity.sort((a, b) => a.recentConnections - b.recentConnections)

      // Needs radar: open "need" listings grouped by pillar
      const needsRadarRaw = await db
        .select({
          pillarTag: sql<string>`unnest(${listings.pillarTags})`,
        })
        .from(listings)
        .where(
          and(
            eq(listings.nodeId, r.nodeId),
            eq(listings.cellId, cellId),
            eq(listings.type, 'need'),
            eq(listings.status, 'open'),
          ),
        )

      const needsRadar: Record<string, number> = {}
      for (const row of needsRadarRaw) {
        needsRadar[row.pillarTag] = (needsRadar[row.pillarTag] || 0) + 1
      }

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const [newListingsCount] = await db
        .select({ count: count() })
        .from(listings)
        .where(
          and(
            eq(listings.nodeId, r.nodeId),
            eq(listings.cellId, cellId),
            gte(listings.createdAt, sevenDaysAgo),
          ),
        )

      const [completedTradesCount] = await db
        .select({ count: count() })
        .from(tradeCompletions)
        .where(
          and(
            eq(tradeCompletions.nodeId, r.nodeId),
            gte(tradeCompletions.completedAt, sevenDaysAgo),
          ),
        )

      const [newConnectionsCount] = await db
        .select({ count: count() })
        .from(connectionEvents)
        .where(
          and(
            eq(connectionEvents.nodeId, r.nodeId),
            gte(connectionEvents.createdAt, sevenDaysAgo),
          ),
        )

      // Reciprocity flags: members with imbalanced giving/receiving
      const reciprocityFlags: any[] = []
      for (const m of membersWithActivity) {
        const [offeringCount] = await db
          .select({ count: count() })
          .from(listings)
          .where(
            and(
              eq(listings.userId, m.id),
              eq(listings.type, 'offer'),
              eq(listings.status, 'completed'),
            ),
          )

        const [needingCount] = await db
          .select({ count: count() })
          .from(listings)
          .where(
            and(
              eq(listings.userId, m.id),
              eq(listings.type, 'need'),
              eq(listings.status, 'completed'),
            ),
          )

        const giving = offeringCount?.count ?? 0
        const receiving = needingCount?.count ?? 0
        const total = giving + receiving

        if (total >= 3) {
          if (giving > receiving * 3) {
            reciprocityFlags.push({
              memberId: m.id,
              name: m.displayName,
              direction: 'giving' as const,
              ratio: receiving > 0 ? Math.round((giving / receiving) * 10) / 10 : giving,
            })
          } else if (receiving > giving * 3) {
            reciprocityFlags.push({
              memberId: m.id,
              name: m.displayName,
              direction: 'receiving' as const,
              ratio: giving > 0 ? Math.round((receiving / giving) * 10) / 10 : receiving,
            })
          }
        }
      }

      return {
        cellName: cell.name,
        members: membersWithActivity,
        needsRadar,
        recentActivity: {
          newListings: newListingsCount?.count ?? 0,
          completedTrades: completedTradesCount?.count ?? 0,
          newConnections: newConnectionsCount?.count ?? 0,
        },
        reciprocityFlags,
        status: 200,
      }
    })

    if (result && 'error' in result && result.status === 404) {
      res.status(404).json({ error: result.error })
    } else if (result && 'cellName' in result) {
      res.json(result)
    } else {
      res.status(500).json({ error: 'Dashboard query failed' })
    }
  } catch (err) {
    console.error('Steward dashboard error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ================================================================
// GET /steward/isolates/:cellId
// ================================================================
router.get('/isolates/:cellId', async (req, res) => {
  const r = req as any
  const { cellId } = req.params

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const result = await withRLSContext(r.nodeId, r.userRole, async () => {
      const cellMembers = await db
        .select({ id: users.id, displayName: users.displayName })
        .from(users)
        .where(and(eq(users.cellId!, cellId), eq(users.nodeId, r.nodeId)))

      const isolates: any[] = []

      for (const m of cellMembers) {
        const [connCount] = await db
          .select({ count: count() })
          .from(connectionEvents)
          .where(
            and(
              eq(connectionEvents.nodeId, r.nodeId),
              sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`,
            ),
          )

        const [lastConn] = await db
          .select({ lastActive: connectionEvents.createdAt })
          .from(connectionEvents)
          .where(
            and(
              eq(connectionEvents.nodeId, r.nodeId),
              sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`,
            ),
          )
          .orderBy(desc(connectionEvents.createdAt))
          .limit(1)

        const connectionCount = connCount?.count ?? 0
        const hasRecent = lastConn && lastConn.lastActive >= thirtyDaysAgo

        if (connectionCount === 0 || !hasRecent) {
          const giftsProfile = await db
            .select({
              lovesToDo: giftsProfiles.lovesToDo,
              caresDeeplyAbout: giftsProfiles.caresDeeplyAbout,
            })
            .from(giftsProfiles)
            .where(eq(giftsProfiles.userId, m.id))
            .limit(1)

          const daysSinceLastConnection = lastConn
            ? Math.floor((Date.now() - lastConn.lastActive.getTime()) / (1000 * 60 * 60 * 24))
            : 999

          isolates.push({
            id: m.id,
            displayName: m.displayName,
            lastActive: lastConn?.lastActive?.toISOString() ?? null,
            daysSinceLastConnection,
            giftsProfile: giftsProfile[0] ?? null,
          })
        }
      }

      // Sort: longest-isolated first
      isolates.sort((a, b) => b.daysSinceLastConnection - a.daysSinceLastConnection)

      return {
        isolates,
        count: isolates.length,
        lastChecked: new Date().toISOString(),
      }
    })

    res.json(result)
  } catch (err) {
    console.error('Isolates query error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ================================================================
// GET /steward/hubs/:cellId
// ================================================================
router.get('/hubs/:cellId', async (req, res) => {
  const r = req as any
  const { cellId } = req.params

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const result = await withRLSContext(r.nodeId, r.userRole, async () => {
      const cellMembers = await db
        .select({ id: users.id, displayName: users.displayName, role: users.role })
        .from(users)
        .where(and(eq(users.cellId!, cellId), eq(users.nodeId, r.nodeId)))

      const memberConnections: { id: string; displayName: string; role: string; connectionCount: number }[] = []

      for (const m of cellMembers) {
        const [connCount] = await db
          .select({ count: count() })
          .from(connectionEvents)
          .where(
            and(
              eq(connectionEvents.nodeId, r.nodeId),
              gte(connectionEvents.createdAt, thirtyDaysAgo),
              sql`(${connectionEvents.userAId} = ${m.id} OR ${connectionEvents.userBId} = ${m.id})`,
            ),
          )

        memberConnections.push({
          id: m.id,
          displayName: m.displayName,
          role: m.role,
          connectionCount: connCount?.count ?? 0,
        })
      }

      // Compute median
      const counts = memberConnections.map((m) => m.connectionCount).sort((a, b) => a - b)
      const median =
        counts.length > 0
          ? counts.length % 2 === 0
            ? (counts[counts.length / 2 - 1] + counts[counts.length / 2]) / 2
            : counts[Math.floor(counts.length / 2)]
          : 0

      // Find hubs and steward burnout check
      const stewardsOwnCount = memberConnections.find((m) => m.role === 'cell_steward')?.connectionCount ?? 0
      const burnoutRisk = stewardsOwnCount > median * 2 && median > 0

      const hubs = memberConnections
        .filter((m) => m.connectionCount > median * 2 && m.connectionCount > 0)
        .map((m) => {
          let risk: 'none' | 'attention' | 'concern' = 'none'
          if (m.connectionCount > median * 3) risk = 'concern'
          else if (m.connectionCount > median * 2) risk = 'attention'

          return {
            id: m.id,
            displayName: m.displayName,
            connectionCount: m.connectionCount,
            risk,
          }
        })
        .sort((a, b) => b.connectionCount - a.connectionCount)

      return { hubs, burnoutRisk }
    })

    res.json(result)
  } catch (err) {
    console.error('Hubs query error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ================================================================
// GET /steward/network-summary/:cellId
// ================================================================
router.get('/network-summary/:cellId', async (req, res) => {
  const r = req as any
  const { cellId } = req.params

  try {
    const result = await withRLSContext(r.nodeId, r.userRole, async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

      // Get cell members
      const cellMembers = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.cellId!, cellId), eq(users.nodeId, r.nodeId)))

      const memberIds = cellMembers.map((m) => m.id)

      if (memberIds.length === 0) {
        return {
          phase: 'scattered_fragments',
          trend: 'stable',
          message: 'Your cell has no members yet.',
          stat: '0 members',
          lastUpdated: new Date().toISOString(),
        }
      }

      // Compute per-member connection counts (last 30 days)
      const memberConnCounts: number[] = []
      for (const id of memberIds) {
        const [c] = await db
          .select({ count: count() })
          .from(connectionEvents)
          .where(
            and(
              eq(connectionEvents.nodeId, r.nodeId),
              gte(connectionEvents.createdAt, thirtyDaysAgo),
              sql`(${connectionEvents.userAId} = ${id} OR ${connectionEvents.userBId} = ${id})`,
            ),
          )
        memberConnCounts.push(c?.count ?? 0)
      }

      const sorted = [...memberConnCounts].sort((a, b) => a - b)
      const median =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]

      // Phase detection (June Holley / Krebs & Holley four-phase model)
      const highConnectors = memberConnCounts.filter((c) => c > 5).length
      const multiHubbers = memberConnCounts.filter((c) => c > 3).length
      const lowOrNone = memberConnCounts.filter((c) => c < 2).length

      let phase: string
      if (median < 2 && highConnectors === 0) {
        phase = 'scattered_fragments'
      } else if (highConnectors >= 1 && highConnectors <= 3 && median < 2) {
        phase = 'hub_and_spoke'
      } else if (multiHubbers >= 4 && median > 2) {
        phase = 'multi_hub'
      } else {
        // Check for core-periphery: top quartile dense, bottom quartile sparse
        const topQuartile = sorted[Math.floor(sorted.length * 0.75)]
        const bottomQuartile = sorted[Math.floor(sorted.length * 0.25)]
        if (topQuartile > 5 && bottomQuartile < 2) {
          phase = 'core_periphery'
        } else if (highConnectors > 0) {
          phase = 'hub_and_spoke'
        } else {
          phase = 'scattered_fragments'
        }
      }

      // Trend: compare last 30 days to previous 30 days
      let prevPeriodCount = 0
      for (const id of memberIds) {
        const [c] = await db
          .select({ count: count() })
          .from(connectionEvents)
          .where(
            and(
              eq(connectionEvents.nodeId, r.nodeId),
              gte(connectionEvents.createdAt, sixtyDaysAgo),
              sql`${connectionEvents.createdAt} < ${thirtyDaysAgo}`,
              sql`(${connectionEvents.userAId} = ${id} OR ${connectionEvents.userBId} = ${id})`,
            ),
          )
        prevPeriodCount += c?.count ?? 0
      }

      const currentTotal = memberConnCounts.reduce((sum, c) => sum + c, 0)
      const prevTotal = prevPeriodCount

      let trend: string
      if (prevTotal === 0) {
        trend = 'growing'
      } else {
        const change = (currentTotal - prevTotal) / prevTotal
        if (change > 0.2) trend = 'growing'
        else if (change < -0.2) trend = 'declining'
        else trend = 'stable'
      }

      // Plain-language message
      const phaseMessages: Record<string, Record<string, string>> = {
        scattered_fragments: {
          growing: 'Your cell is just getting started — members are beginning to connect.',
          stable: 'Your community is still in early formation — most members haven\'t connected yet.',
          declining: 'Connections have slowed — a few introductions could restart momentum.',
        },
        hub_and_spoke: {
          growing: 'A few members are connecting everyone — try introducing people who haven\'t met.',
          stable: 'Your network flows through a few key members — consider widening the circle.',
          declining: 'Your key connectors may need support — the network depends on them.',
        },
        multi_hub: {
          growing: 'Your cell\'s connections are growing — the network is distributing itself.',
          stable: 'Your network is dense and well-distributed — connections are making themselves.',
          declining: 'Your network is strong but activity has dipped — a gentle nudge can restore momentum.',
        },
        core_periphery: {
          growing: 'Your network has a strong core and is reaching more members.',
          stable: 'Your network has a connected core — the outer members could use more introductions.',
          declining: 'The edges of your network are thinning — focus on members with fewest connections.',
        },
      }

      const message = phaseMessages[phase]?.[trend] ?? 'Network summary available.'
      const stat = `${currentTotal} connections this month`

      // Persist snapshot
      await db.insert(networkPhaseSnapshots).values({
        nodeId: r.nodeId,
        cellId,
        phase: phase as any,
        metrics: {
          memberCount: memberIds.length,
          connectionCount: currentTotal,
          medianConnections: median,
          isolateCount: memberConnCounts.filter((c) => c === 0).length,
          hubCount: highConnectors,
          trend,
        },
      })

      return {
        phase,
        trend,
        message,
        stat,
        lastUpdated: new Date().toISOString(),
      }
    })

    res.json(result)
  } catch (err) {
    console.error('Network summary error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ================================================================
// POST /steward/log-offline-trade
// ================================================================
router.post('/log-offline-trade', async (req, res) => {
  const r = req as any
  const { cellId, description, pillar, offeringParty, needingParty, date } = req.body

  if (!cellId || !description || !pillar || !offeringParty || !needingParty) {
    res.status(400).json({ error: 'Missing required fields: cellId, description, pillar, offeringParty, needingParty' })
    return
  }

  try {
    const result = await withRLSContext(r.nodeId, r.userRole, async () => {
      // Validate both parties belong to this cell
      const parties = await db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.nodeId, r.nodeId),
            eq(users.cellId!, cellId),
            sql`${users.id} IN (${offeringParty}, ${needingParty})`,
          ),
        )

      if (parties.length !== 2) {
        return { error: 'One or both parties are not members of this cell', status: 400 }
      }

      const tradeDate = date ? new Date(date) : new Date()

      // 1. Create a completed listing
      const [listing] = await db
        .insert(listings)
        .values({
          nodeId: r.nodeId,
          cellId,
          userId: offeringParty,
          type: 'offer',
          pillarTags: [pillar],
          title: description.substring(0, 100),
          description,
          status: 'completed',
          createdAt: tradeDate,
          updatedAt: tradeDate,
        })
        .returning({ id: listings.id })

      // 2. Create a trade completion
      const [completion] = await db
        .insert(tradeCompletions)
        .values({
          nodeId: r.nodeId,
          listingId: listing.id,
          completedAt: tradeDate,
        })
        .returning({ id: tradeCompletions.id })

      // 3. Create bidirectional connection events
      await db.insert(connectionEvents).values([
        {
          nodeId: r.nodeId,
          userAId: offeringParty,
          userBId: needingParty,
          eventType: 'trade_completed',
          createdAt: tradeDate,
        },
        {
          nodeId: r.nodeId,
          userAId: needingParty,
          userBId: offeringParty,
          eventType: 'trade_completed',
          createdAt: tradeDate,
        },
      ])

      return { listingId: listing.id, tradeCompletionId: completion.id, status: 201 }
    })

    if (result && 'error' in result) {
      res.status(result.status ?? 500).json({ error: result.error })
    } else if (result && 'listingId' in result) {
      res.status(201).json({ listingId: result.listingId, tradeCompletionId: result.tradeCompletionId })
    } else {
      res.status(500).json({ error: 'Failed to log offline trade' })
    }
  } catch (err) {
    console.error('Log offline trade error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
