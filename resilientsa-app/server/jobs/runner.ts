// server/jobs/runner.ts
// Nightly batch jobs: NetworkPhaseSnapshot + InternalForecast computation
// Run with: npx tsx server/jobs/runner.ts

import { db } from '../../src/db/client'
import { cells } from '../../src/db/schema/public/cells'
import { users } from '../../src/db/schema/public/users'
import { connectionEvents } from '../../src/db/schema/public/connection-events'
import { listings } from '../../src/db/schema/public/listings'
import { networkPhaseSnapshots } from '../../src/db/schema/public/network-phase-snapshots'
import { internalForecasts } from '../../src/db/schema/public/internal-forecasts'
import { eq, and, gte, count, sql } from 'drizzle-orm'

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000

async function runNightlyJobs() {
  console.log('[Jobs] Starting nightly batch...')

  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS)
  const fourteenDaysAgo = new Date(Date.now() - FOURTEEN_DAYS)
  const twentyEightDaysAgo = new Date(Date.now() - FOURTEEN_DAYS * 2)

  const allCells = await db.select().from(cells)

  for (const cell of allCells) {
    console.log(`[Jobs] Processing cell: ${cell.id} (${cell.name})`)

    // Get cell members
    const cellMembers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.cellId!, cell.id), eq(users.nodeId, cell.nodeId)))

    const memberIds = cellMembers.map((m) => m.id)

    if (memberIds.length === 0) continue

    // ─── NetworkPhaseSnapshot ───
    const memberConnCounts: number[] = []
    for (const id of memberIds) {
      const [c] = await db
        .select({ count: count() })
        .from(connectionEvents)
        .where(
          and(
            eq(connectionEvents.nodeId, cell.nodeId),
            gte(connectionEvents.createdAt, thirtyDaysAgo),
            sql`(${connectionEvents.userAId} = ${id} OR ${connectionEvents.userBId} = ${id})`,
          ),
        )
      memberConnCounts.push(c?.count ?? 0)
    }

    const sorted = [...memberConnCounts].sort((a, b) => a - b)
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

    const highConnectors = memberConnCounts.filter((c) => c > 5).length
    const multiHubbers = memberConnCounts.filter((c) => c > 3).length

    let phase: string
    if (median < 2 && highConnectors === 0) {
      phase = 'scattered_fragments'
    } else if (highConnectors >= 1 && highConnectors <= 3 && median < 2) {
      phase = 'hub_and_spoke'
    } else if (multiHubbers >= 4 && median > 2) {
      phase = 'multi_hub'
    } else {
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

    const totalConnections = memberConnCounts.reduce((sum, c) => sum + c, 0)

    await db.insert(networkPhaseSnapshots).values({
      nodeId: cell.nodeId,
      cellId: cell.id,
      phase: phase as any,
      metrics: {
        memberCount: memberIds.length,
        connectionCount: totalConnections,
        medianConnections: median,
        isolateCount: memberConnCounts.filter((c) => c === 0).length,
        hubCount: highConnectors,
        computedAt: new Date().toISOString(),
      },
    })

    console.log(`  Network phase: ${phase} (${totalConnections} connections, ${memberIds.length} members)`)

    // ─── InternalForecast ───
    // Per-cell forecast: listing trends + connection velocity
    const [recentListings] = await db
      .select({ count: count() })
      .from(listings)
      .where(
        and(
          eq(listings.nodeId, cell.nodeId),
          gte(listings.createdAt, fourteenDaysAgo),
        ),
      )

    const [prevListings] = await db
      .select({ count: count() })
      .from(listings)
      .where(
        and(
          eq(listings.nodeId, cell.nodeId),
          gte(listings.createdAt, twentyEightDaysAgo),
          sql`${listings.createdAt} < ${fourteenDaysAgo}`,
        ),
      )

    const recentCount = recentListings?.count ?? 0
    const prevCount = prevListings?.count ?? 0

    // Offer/need ratio
    const [recentOffers] = await db
      .select({ count: count() })
      .from(listings)
      .where(
        and(
          eq(listings.nodeId, cell.nodeId),
          eq(listings.type, 'offer'),
          gte(listings.createdAt, fourteenDaysAgo),
        ),
      )

    const [recentNeeds] = await db
      .select({ count: count() })
      .from(listings)
      .where(
        and(
          eq(listings.nodeId, cell.nodeId),
          eq(listings.type, 'need'),
          gte(listings.createdAt, fourteenDaysAgo),
        ),
      )

    const offerCount = recentOffers?.count ?? 0
    const needCount = recentNeeds?.count ?? 0

    // Forecast determination
    let forecast: string
    let signalsSummary: string

    const listingChange = prevCount > 0 ? (recentCount - prevCount) / prevCount : 0
    const totalInteractions = recentCount + (totalConnections)

    if (needCount > offerCount * 2 && needCount > 5) {
      forecast = 'needs_attention'
      signalsSummary = 'More people are asking for things than offering — this may signal growing strain.'
    } else if (listingChange < -0.3 && recentCount > 0) {
      forecast = 'declining'
      signalsSummary = 'Listing activity has dropped significantly in the last 2 weeks.'
    } else if (listingChange > 0.3) {
      forecast = 'improving'
      signalsSummary = 'Listing activity is increasing — the network is activating.'
    } else if (totalInteractions === 0) {
      forecast = 'needs_attention'
      signalsSummary = 'No activity detected — the cell may need a Steward introduction push.'
    } else {
      forecast = 'stable'
      signalsSummary = 'Activity levels are holding steady.'
    }

    let confidence: string
    if (totalInteractions > 100) confidence = 'high'
    else if (totalInteractions > 50) confidence = 'medium'
    else confidence = 'low'

    await db.insert(internalForecasts).values({
      nodeId: cell.nodeId,
      cellId: cell.id,
      pillarTag: 'all',
      forecastType: 'needs_radar_trajectory',
      confidence: confidence as any,
      projectedWindowStart: new Date(),
      projectedWindowEnd: new Date(Date.now() + THIRTY_DAYS),
      basis: {
        forecast,
        signalsSummary,
        listingCount: recentCount,
        previousListingCount: prevCount,
        offerCount,
        needCount,
        connectionCount: totalConnections,
        computedAt: new Date().toISOString(),
      },
    })

    console.log(`  Forecast: ${forecast} (confidence: ${confidence}) — ${signalsSummary}`)
  }

  console.log('[Jobs] Nightly batch complete.')
  process.exit(0)
}

runNightlyJobs().catch((err) => {
  console.error('[Jobs] Fatal error:', err)
  process.exit(1)
})
