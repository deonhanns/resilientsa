import { Router } from 'express'
import { requireSession, withRLSContext } from '../middleware/session'
import { db } from '../../src/db/client'
import { listings } from '../../src/db/schema/public/listings'
import { matches } from '../../src/db/schema/public/matches'
import { tradeCompletions } from '../../src/db/schema/public/trade-completions'
import { connectionEvents } from '../../src/db/schema/public/connection-events'
import { communityExchangeReference } from '../../src/db/schema/public/community-exchange-reference'
import { users } from '../../src/db/schema/public/users'
import { eq, and, inArray, desc, sql } from 'drizzle-orm'

const router = Router()

// ================================================================
// LISTINGS CRUD
// ================================================================

// GET /listings — filtered by cell, pillar, type, status
router.get('/listings', requireSession, async (req, res) => {
  const r = req as any
  const { cell_id, pillar, type, status } = req.query

  const rows = await withRLSContext(r.nodeId, r.userRole, async () => {
    const conditions = [eq(listings.nodeId, r.nodeId)]

    if (cell_id)  conditions.push(eq(listings.cellId, cell_id as string))
    if (status)   conditions.push(eq(listings.status, status as string))
    if (type)     conditions.push(eq(listings.type, type as string))
    if (pillar && pillar !== 'all') {
      conditions.push(sql`${listings.pillarTags} @> ARRAY[${pillar as string}]`)
    }

    return db
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt))
      .limit(100)
  })

  res.json(rows)
})

// POST /listings — node_id + cell_id from session, never from body
router.post('/listings', requireSession, async (req, res) => {
  const r = req as any
  const { type, pillar_tags, title, description } = req.body

  if (!type || !pillar_tags || !title) {
    res.status(400).json({ error: 'type, pillar_tags, and title are required' })
    return
  }

  // Look up user's cell for node_id/cell_id injection
  const [user] = await withRLSContext(r.nodeId, r.userRole, () =>
    db.select({ cellId: users.cellId }).from(users).where(eq(users.id, r.userId)).limit(1)
  )

  if (!user?.cellId) {
    res.status(400).json({ error: 'You must be assigned to a cell before posting a listing' })
    return
  }

  const [listing] = await withRLSContext(r.nodeId, r.userRole, () =>
    db
      .insert(listings)
      .values({
        nodeId:      r.nodeId,
        cellId:      user.cellId!,
        userId:      r.userId,
        type,
        pillarTags:  pillar_tags,
        title,
        description: description ?? null,
      })
      .returning()
  )

  res.status(201).json(listing)
})

// PATCH /listings/:id — update listing; 409 conflict on status mismatch
router.patch('/listings/:id', requireSession, async (req, res) => {
  const r = req as any
  const { title, description, status, expected_status } = req.body

  const rows = await withRLSContext(r.nodeId, r.userRole, async () => {
    const [existing] = await db
      .select()
      .from(listings)
      .where(and(eq(listings.id, req.params.id), eq(listings.userId, r.userId)))
      .limit(1)

    if (!existing) return null

    // Conflict detection for status transitions
    if (expected_status && existing.status !== expected_status) {
      return { conflict: true, current: existing.status }
    }

    return db
      .update(listings)
      .set({
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, req.params.id))
      .returning()
  })

  if (!rows) { res.status(404).json({ error: 'Listing not found' }); return }
  if ('conflict' in rows && rows.conflict) {
    res.status(409).json({ error: 'Status conflict', current_status: (rows as any).current })
    return
  }

  res.json(rows[0])
})

// DELETE /listings/:id — soft delete → status: withdrawn
router.delete('/listings/:id', requireSession, async (req, res) => {
  const r = req as any

  const rows = await withRLSContext(r.nodeId, r.userRole, () =>
    db
      .update(listings)
      .set({ status: 'withdrawn', updatedAt: new Date() })
      .where(and(eq(listings.id, req.params.id), eq(listings.userId, r.userId)))
      .returning()
  )

  if (rows.length === 0) {
    res.status(404).json({ error: 'Listing not found or not yours' })
    return
  }

  res.json(rows[0])
})

// ================================================================
// MATCHES
// ================================================================

// GET /matches?user_id=
router.get('/matches', requireSession, async (req, res) => {
  const r = req as any
  const { user_id } = req.query

  const rows = await withRLSContext(r.nodeId, r.userRole, async () => {
    const conditions = []
    if (user_id) conditions.push(eq(matches.facilitatedBySteward, user_id as string))

    return db
      .select()
      .from(matches)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(matches.createdAt))
      .limit(50)
  })

  res.json(rows)
})

// POST /matches — Steward or Node Admin only
router.post('/matches', requireSession, async (req, res) => {
  const r = req as any

  if (r.userRole !== 'cell_steward' && r.userRole !== 'node_admin') {
    res.status(403).json({ error: 'Only Cell Stewards and Node Admins can create matches' })
    return
  }

  const { listing_ids } = req.body
  if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length < 2) {
    res.status(400).json({ error: 'listing_ids array with at least 2 IDs required' })
    return
  }

  // Verify all listings exist and are open, transition to matched
  const result = await withRLSContext(r.nodeId, r.userRole, async () => {
    const existing = await db
      .select()
      .from(listings)
      .where(and(inArray(listings.id, listing_ids), eq(listings.status, 'open')))
      .limit(listing_ids.length)

    if (existing.length !== listing_ids.length) {
      return { error: 'One or more listings are not open or do not exist' }
    }

    const [match] = await db
      .insert(matches)
      .values({
        listingIds:            listing_ids,
        status:                'proposed',
        facilitatedBySteward:  r.userId,
      })
      .returning()

    // Transition listings to matched
    await db
      .update(listings)
      .set({ status: 'matched', updatedAt: new Date() })
      .where(inArray(listings.id, listing_ids))

    return match
  })

  if ('error' in result) {
    res.status(400).json(result)
    return
  }

  res.status(201).json(result)
})

// PATCH /matches/:id/confirm — either party confirms
router.patch('/matches/:id/confirm', requireSession, async (req, res) => {
  const r = req as any

  const result = await withRLSContext(r.nodeId, r.userRole, async () => {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, req.params.id))
      .limit(1)

    if (!match) return null
    if (match.status !== 'proposed') {
      return { conflict: true, current: match.status }
    }

    // Verify this user is one of the listing owners
    const matchListings = await db
      .select({ userId: listings.userId })
      .from(listings)
      .where(inArray(listings.id, match.listingIds))

    if (!matchListings.some((l) => l.userId === r.userId)) {
      return { forbidden: true }
    }

    // For MVP, we'll mark as confirmed when any party confirms
    // Full both-party confirmation is tracked in TradeCompletion
    return db
      .update(matches)
      .set({ status: 'confirmed' })
      .where(eq(matches.id, req.params.id))
      .returning()
  })

  if (!result) { res.status(404).json({ error: 'Match not found' }); return }
  if ('conflict' in result) {
    res.status(409).json({ error: 'Match in wrong state', current: (result as any).current })
    return
  }
  if ('forbidden' in result) {
    res.status(403).json({ error: 'Only matched listing owners can confirm' })
    return
  }

  res.json(result[0])
})

// PATCH /matches/:id/decline
router.patch('/matches/:id/decline', requireSession, async (req, res) => {
  const r = req as any

  const result = await withRLSContext(r.nodeId, r.userRole, async () => {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, req.params.id))
      .limit(1)

    if (!match) return null

    // Revert listings to open
    await db
      .update(listings)
      .set({ status: 'open', updatedAt: new Date() })
      .where(inArray(listings.id, match.listingIds))

    return db
      .update(matches)
      .set({ status: 'declined' })
      .where(eq(matches.id, req.params.id))
      .returning()
  })

  if (!result) { res.status(404).json({ error: 'Match not found' }); return }
  res.json(result[0])
})

// ================================================================
// TRADE COMPLETIONS + FAIRNESS
// ================================================================

// POST /trade-completions/:matchId/confirm-fairness
router.post('/trade-completions/:matchId/confirm-fairness', requireSession, async (req, res) => {
  const r = req as any

  const result = await withRLSContext(r.nodeId, r.userRole, async () => {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, req.params.matchId))
      .limit(1)

    if (!match) return null
    if (match.status === 'completed') {
      return { conflict: true, message: 'Trade already completed' }
    }

    // Get the existing trade completion or create one
    let [completion] = await db
      .select()
      .from(tradeCompletions)
      .where(eq(tradeCompletions.matchId, req.params.matchId))
      .limit(1)

    if (!completion) {
      ;[completion] = await db
        .insert(tradeCompletions)
        .values({
          matchId: req.params.matchId,
          fairnessConfirmedByEachParty: { [r.userId]: true },
        })
        .returning()
    } else {
      const confirmations = completion.fairnessConfirmedByEachParty as Record<string, boolean>
      confirmations[r.userId] = true

      await db
        .update(tradeCompletions)
        .set({ fairnessConfirmedByEachParty: confirmations })
        .where(eq(tradeCompletions.id, completion.id))

      completion = { ...completion, fairnessConfirmedByEachParty: confirmations }
    }

    // Check if both parties confirmed
    const matchListings = await db
      .select({ userId: listings.userId })
      .from(listings)
      .where(inArray(listings.id, match.listingIds))

    const allPartyIds = matchListings.map((l) => l.userId)
    const confirmations = completion.fairnessConfirmedByEachParty as Record<string, boolean>
    const allConfirmed = allPartyIds.every((uid) => confirmations[uid])

    if (allConfirmed) {
      // Mark match as completed
      await db
        .update(matches)
        .set({ status: 'completed' })
        .where(eq(matches.id, req.params.matchId))

      // Mark listings as completed
      await db
        .update(listings)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(inArray(listings.id, match.listingIds))

      // Write ConnectionEvent rows (undirected graph, one per direction)
      if (allPartyIds.length >= 2) {
        const [a, b] = allPartyIds
        await db.insert(connectionEvents).values([
          { nodeId: r.nodeId, userAId: a, userBId: b, eventType: 'trade_completed' },
          { nodeId: r.nodeId, userAId: b, userBId: a, eventType: 'trade_completed' },
        ])
      }

      return { ...completion, completed: true }
    }

    return completion
  })

  if (!result) { res.status(404).json({ error: 'Match not found' }); return }
  if ('conflict' in result) {
    res.status(409).json({ error: (result as any).message })
    return
  }

  res.json(result)
})

// ================================================================
// COMMUNITY EXCHANGE REFERENCE
// ================================================================

// GET /community-exchange-reference?cell_id=&pillar=
router.get('/community-exchange-reference', requireSession, async (req, res) => {
  const r = req as any
  const { cell_id, pillar } = req.query

  const rows = await withRLSContext(r.nodeId, r.userRole, async () => {
    // Get completed trades for this node/cell/pillar
    const conditions = [eq(listings.nodeId, r.nodeId), eq(listings.status, 'completed')]
    if (cell_id) conditions.push(eq(listings.cellId, cell_id as string))
    if (pillar && pillar !== 'all') {
      conditions.push(sql`${listings.pillarTags} @> ARRAY[${pillar as string}]`)
    }

    const completedListings = await db
      .select({ id: listings.id, title: listings.title, pillarTags: listings.pillarTags })
      .from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.updatedAt))
      .limit(20)

    return completedListings.map((l) => ({
      listing_id:    l.id,
      pillar_tag:    l.pillarTags[0] ?? 'unknown',
      item_description: l.title,
      typical_equivalent: 'Community valued exchange',
      sample_size:   1,
      generated_at:  new Date().toISOString(),
    }))
  })

  res.json(rows)
})

export default router
