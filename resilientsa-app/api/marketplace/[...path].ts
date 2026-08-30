// api/marketplace/[...path].ts
// Vercel serverless catch-all — /api/marketplace/*
// Consolidates ORDER 008's 7 marketplace handlers into ONE function to stay
// under the Vercel Hobby 12-function limit (Spock-approved consolidation).
//
// Internal routing (path segments from req.query.path):
//   offerings            -> GET browse | POST create
//   offerings/mine       -> GET mine
//   offerings/:id        -> PATCH edit own offering
//   offerings/:id/request-> POST request (cell_steward/node_admin)
//   requests             -> GET grounder's incoming requests
//   engagements/:id      -> PATCH accept/decline/active/complete (grounder)
//   engagements/:id/endorse -> POST endorsement (node_admin)
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { getGrounderForUser } from '../_lib/grounder'
import { db } from '../_lib/db'
import { programmeOfferings } from '../../src/db/schema/public/programme-offerings'
import { grounders } from '../../src/db/schema/public/grounders'
import { offeringEndorsements } from '../../src/db/schema/public/offering-endorsements'
import { offeringEngagements } from '../../src/db/schema/public/offering-engagements'
import { nodes } from '../../src/db/schema/public/nodes'
import { eq, and, desc, count, sql } from 'drizzle-orm'

type Seg = string
function segments(req: VercelRequest): Seg[] {
  const p = req.query.path
  if (Array.isArray(p)) return p as Seg[]
  if (typeof p === 'string') return [p]
  return []
}

// ---------------------------------------------------------------
// GET /api/marketplace/offerings?pillar=&search=
// POST /api/marketplace/offerings
// ---------------------------------------------------------------
async function offeringsRoot(req: VercelRequest, res: VercelResponse, session: Awaited<ReturnType<typeof getSession>> & { userId: string; userRole: string; nodeId: string }) {
  // GET browse — community-facing, verified grounders only, active offerings
  if (req.method === 'GET') {
    const { pillar, search } = req.query

    const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
      const conditions = [
        eq(programmeOfferings.status, 'active'),
        eq(grounders.verificationStatus, 'verified'),
      ]

      if (pillar && pillar !== 'all') {
        conditions.push(sql`${programmeOfferings.pillarTags} @> ARRAY[${pillar as string}]`)
      }
      if (search) {
        conditions.push(
          sql`(${programmeOfferings.name} ILIKE ${'%' + search + '%'} OR ${programmeOfferings.shortDescription} ILIKE ${'%' + search + '%'})`
        )
      }

      const offerings = await db
        .select({
          id: programmeOfferings.id,
          name: programmeOfferings.name,
          shortDescription: programmeOfferings.shortDescription,
          pillarTags: programmeOfferings.pillarTags,
          providerName: grounders.organisationName,
          providerVerified: sql<boolean>`${grounders.verificationStatus} = 'verified'`,
          status: programmeOfferings.status,
        })
        .from(programmeOfferings)
        .innerJoin(grounders, eq(programmeOfferings.grounderId, grounders.id))
        .where(and(...conditions))
        .orderBy(desc(programmeOfferings.createdAt))
        .limit(50)

      const offeringIds = offerings.map((o) => o.id)
      const endorsementCounts: Record<string, { recommend: number; total: number }> = {}

      if (offeringIds.length > 0) {
        const engagementEndorsements = await db
          .select({
            offeringId: sql<string>`oe.offering_id`,
            recommend: offeringEndorsements.recommend,
          })
          .from(offeringEndorsements)
          .innerJoin(
            sql`offering_engagements oe ON ${offeringEndorsements.engagementId} = oe.id`,
            sql``
          )
          .where(sql`oe.offering_id = ANY(${offeringIds})`)

        for (const row of engagementEndorsements) {
          if (!endorsementCounts[row.offeringId]) {
            endorsementCounts[row.offeringId] = { recommend: 0, total: 0 }
          }
          endorsementCounts[row.offeringId].total++
          if (row.recommend) endorsementCounts[row.offeringId].recommend++
        }
      }

      return offerings.map((o) => ({
        ...o,
        endorsementCount: endorsementCounts[o.id]?.recommend ?? 0,
        totalEndorsements: endorsementCounts[o.id]?.total ?? 0,
      }))
    })

    return res.json({ offerings: rows })
  }

  // POST create — Grounder only
  if (req.method === 'POST') {
    const grounder = await getGrounderForUser(session.userId)
    if (!grounder) {
      return res.status(403).json({ error: 'Only Grounders can create offerings.' })
    }
    if (grounder.verificationStatus !== 'verified') {
      return res.status(403).json({ error: 'Your Grounder account is not yet verified.' })
    }

    const { name, shortDescription, fullDescription, pillarTags, communityRequirements, typicalDuration } = req.body
    if (!name || !pillarTags || !Array.isArray(pillarTags) || pillarTags.length === 0) {
      return res.status(400).json({ error: 'name and pillarTags (array, min 1) are required' })
    }

    const [offering] = await withRLSContext(session.nodeId, session.userRole, () =>
      db.insert(programmeOfferings).values({
        grounderId: grounder.id,
        name,
        shortDescription: shortDescription ?? null,
        fullDescription: fullDescription ?? null,
        pillarTags,
        communityRequirements: communityRequirements ?? null,
        typicalDuration: typicalDuration ?? null,
        status: 'active',
      }).returning()
    )

    return res.status(201).json(offering)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ---------------------------------------------------------------
// GET /api/marketplace/offerings/mine
// ---------------------------------------------------------------
async function offeringsMine(req: VercelRequest, res: VercelResponse, session: { userId: string; userRole: string; nodeId: string }) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const grounder = await getGrounderForUser(session.userId)
  if (!grounder) return res.status(403).json({ error: 'Only Grounders can view their offerings.' })

  const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
    return db
      .select({
        id: programmeOfferings.id,
        name: programmeOfferings.name,
        shortDescription: programmeOfferings.shortDescription,
        pillarTags: programmeOfferings.pillarTags,
        status: programmeOfferings.status,
        createdAt: programmeOfferings.createdAt,
        updatedAt: programmeOfferings.updatedAt,
        engagementCount: count(offeringEngagements.id),
      })
      .from(programmeOfferings)
      .leftJoin(offeringEngagements, eq(programmeOfferings.id, offeringEngagements.offeringId))
      .where(eq(programmeOfferings.grounderId, grounder.id))
      .groupBy(programmeOfferings.id)
      .orderBy(desc(programmeOfferings.createdAt))
  })

  return res.json({ offerings: rows })
}

// ---------------------------------------------------------------
// PATCH /api/marketplace/offerings/:id
// ---------------------------------------------------------------
async function offeringsById(req: VercelRequest, res: VercelResponse, id: string, session: { userId: string; userRole: string; nodeId: string }) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const grounder = await getGrounderForUser(session.userId)
  if (!grounder) return res.status(403).json({ error: 'Only Grounders can edit offerings.' })

  const { name, shortDescription, fullDescription, pillarTags, communityRequirements, typicalDuration, status } = req.body

  const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
    const [existing] = await db
      .select()
      .from(programmeOfferings)
      .where(and(eq(programmeOfferings.id, id), eq(programmeOfferings.grounderId, grounder.id)))
      .limit(1)

    if (!existing) return null

    return db.update(programmeOfferings).set({
      ...(name !== undefined ? { name } : {}),
      ...(shortDescription !== undefined ? { shortDescription } : {}),
      ...(fullDescription !== undefined ? { fullDescription } : {}),
      ...(pillarTags !== undefined ? { pillarTags } : {}),
      ...(communityRequirements !== undefined ? { communityRequirements } : {}),
      ...(typicalDuration !== undefined ? { typicalDuration } : {}),
      ...(status !== undefined ? { status } : {}),
      updatedAt: new Date(),
    }).where(eq(programmeOfferings.id, id)).returning()
  })

  if (!rows) return res.status(404).json({ error: 'Offering not found or not yours' })
  return res.json(rows[0])
}

// ---------------------------------------------------------------
// POST /api/marketplace/offerings/:id/request
// ---------------------------------------------------------------
async function offeringsRequest(req: VercelRequest, res: VercelResponse, offeringId: string, session: { userId: string; userRole: string; nodeId: string }) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Role gate: only Cell Stewards and Node Admins can request support for their community
  if (session.userRole !== 'cell_steward' && session.userRole !== 'node_admin') {
    return forbidden(res)
  }

  const { requestContext } = req.body

  const result = await withRLSContext(session.nodeId, session.userRole, async () => {
    const [offering] = await db
      .select({ id: programmeOfferings.id, status: programmeOfferings.status })
      .from(programmeOfferings)
      .where(eq(programmeOfferings.id, offeringId))
      .limit(1)

    if (!offering) return { notFound: true }
    if (offering.status !== 'active') return { inactive: true }

    const [existing] = await db
      .select({ id: offeringEngagements.id })
      .from(offeringEngagements)
      .where(
        and(
          eq(offeringEngagements.offeringId, offeringId),
          eq(offeringEngagements.nodeId, session.nodeId),
          sql`${offeringEngagements.status} != 'declined'`
        )
      )
      .limit(1)

    if (existing) return { conflict: true }

    const [engagement] = await db.insert(offeringEngagements).values({
      offeringId,
      nodeId: session.nodeId,
      status: 'requested',
      requestContext: requestContext ?? null,
    }).returning()

    return { engagement }
  })

  if ('notFound' in result) return res.status(404).json({ error: 'Offering not found' })
  if ('inactive' in result) return res.status(400).json({ error: 'This offering is no longer active' })
  if ('conflict' in result) return res.status(409).json({ error: 'Your community has already requested this support.' })
  return res.status(201).json({ engagementId: (result as any).engagement.id, status: 'requested' })
}

// ---------------------------------------------------------------
// GET /api/marketplace/requests
// ---------------------------------------------------------------
async function requestsRoot(req: VercelRequest, res: VercelResponse, session: { userId: string; userRole: string; nodeId: string }) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const grounder = await getGrounderForUser(session.userId)
  if (!grounder) return res.status(403).json({ error: 'Only Grounders can view requests.' })

  const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
    return db
      .select({
        id: offeringEngagements.id,
        offeringId: offeringEngagements.offeringId,
        offeringName: programmeOfferings.name,
        nodeId: offeringEngagements.nodeId,
        nodeName: nodes.name,
        requestContext: offeringEngagements.requestContext,
        requestedAt: offeringEngagements.requestedAt,
        status: offeringEngagements.status,
        startedAt: offeringEngagements.startedAt,
        completedAt: offeringEngagements.completedAt,
      })
      .from(offeringEngagements)
      .innerJoin(programmeOfferings, eq(offeringEngagements.offeringId, programmeOfferings.id))
      .innerJoin(nodes, eq(offeringEngagements.nodeId, nodes.id))
      .where(
        and(
          eq(programmeOfferings.grounderId, grounder.id),
          sql`${offeringEngagements.status} != 'declined'`
        )
      )
      .orderBy(desc(offeringEngagements.requestedAt))
  })

  return res.json({ requests: rows })
}

// ---------------------------------------------------------------
// PATCH /api/marketplace/engagements/:id
// ---------------------------------------------------------------
const VALID_TRANSITIONS: Record<string, string[]> = {
  requested: ['accepted', 'declined'],
  accepted: ['active', 'declined', 'completed'],
  active: ['completed'],
  completed: [],
  declined: [],
}

async function engagementsById(req: VercelRequest, res: VercelResponse, engagementId: string, session: { userId: string; userRole: string; nodeId: string }) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const grounder = await getGrounderForUser(session.userId)
  if (!grounder) return res.status(403).json({ error: 'Only Grounders can manage engagements.' })

  const { status: newStatus } = req.body
  if (!newStatus || !['accepted', 'declined', 'active', 'completed'].includes(newStatus)) {
    return res.status(400).json({ error: 'Valid status required: accepted, declined, active, completed' })
  }

  const result = await withRLSContext(session.nodeId, session.userRole, async () => {
    const [engagement] = await db
      .select({
        id: offeringEngagements.id,
        status: offeringEngagements.status,
        offeringId: offeringEngagements.offeringId,
      })
      .from(offeringEngagements)
      .where(eq(offeringEngagements.id, engagementId))
      .limit(1)

    if (!engagement) return { notFound: true }

    const [offering] = await db
      .select({ grounderId: programmeOfferings.grounderId })
      .from(programmeOfferings)
      .where(eq(programmeOfferings.id, engagement.offeringId))
      .limit(1)

    if (!offering || offering.grounderId !== grounder.id) {
      return { forbidden: true }
    }

    const currentStatus = engagement.status ?? 'requested'
    const allowed = VALID_TRANSITIONS[currentStatus]
    if (!allowed || !allowed.includes(newStatus)) {
      return { invalidTransition: true, current: currentStatus }
    }

    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'accepted' || newStatus === 'active') {
      updates.startedAt = new Date()
    }
    if (newStatus === 'completed') {
      updates.completedAt = new Date()
    }

    return db.update(offeringEngagements)
      .set(updates)
      .where(eq(offeringEngagements.id, engagementId))
      .returning()
  })

  if ('notFound' in result) return res.status(404).json({ error: 'Engagement not found' })
  if ('forbidden' in result) return res.status(403).json({ error: 'This engagement does not belong to your offerings' })
  if ('invalidTransition' in result) {
    return res.status(409).json({
      error: `Cannot transition from ${(result as any).current} to ${newStatus}`,
      current_status: (result as any).current,
    })
  }
  return res.json((result as any)[0])
}

// ---------------------------------------------------------------
// POST /api/marketplace/engagements/:id/endorse
// ---------------------------------------------------------------
async function engagementsEndorse(req: VercelRequest, res: VercelResponse, engagementId: string, session: { userId: string; userRole: string; nodeId: string }) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Role gate: only Node Admins can endorse
  if (session.userRole !== 'node_admin') {
    return forbidden(res)
  }

  const { recommend, note, visibility } = req.body
  if (typeof recommend !== 'boolean') {
    return res.status(400).json({ error: 'recommend (boolean) is required' })
  }

  const result = await withRLSContext(session.nodeId, session.userRole, async () => {
    const [engagement] = await db
      .select({
        id: offeringEngagements.id,
        status: offeringEngagements.status,
        nodeId: offeringEngagements.nodeId,
      })
      .from(offeringEngagements)
      .where(eq(offeringEngagements.id, engagementId))
      .limit(1)

    if (!engagement) return { notFound: true }
    if (engagement.nodeId !== session.nodeId) return { forbidden: true }
    if (engagement.status !== 'completed') {
      return { notCompleted: true, current: engagement.status }
    }

    const [existing] = await db
      .select({ id: offeringEndorsements.id })
      .from(offeringEndorsements)
      .where(
        and(
          eq(offeringEndorsements.engagementId, engagementId),
          eq(offeringEndorsements.nodeId, session.nodeId)
        )
      )
      .limit(1)

    if (existing) return { conflict: true }

    const [endorsement] = await db.insert(offeringEndorsements).values({
      engagementId,
      nodeId: session.nodeId,
      recommend,
      note: note ?? null,
      visibility: visibility ?? 'attributed',
    }).returning()

    return { endorsement }
  })

  if ('notFound' in result) return res.status(404).json({ error: 'Engagement not found' })
  if ('forbidden' in result) return res.status(403).json({ error: 'This engagement does not belong to your node' })
  if ('notCompleted' in result) {
    return res.status(400).json({
      error: `Engagement must be completed before endorsing. Current status: ${(result as any).current}`,
    })
  }
  if ('conflict' in result) return res.status(409).json({ error: 'You have already endorsed this engagement' })
  return res.status(201).json((result as any).endorsement)
}

// ---------------------------------------------------------------
// Router
// ---------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)
  const ctx = session as { userId: string; userRole: string; nodeId: string }

  const seg = segments(req)
  const [p0, p1, p2] = seg

  if (p0 === 'offerings') {
    if (!p1) return offeringsRoot(req, res, ctx)
    if (p1 === 'mine') return offeringsMine(req, res, ctx)
    if (p2 === 'request') return offeringsRequest(req, res, p1, ctx)
    return offeringsById(req, res, p1, ctx)
  }

  if (p0 === 'requests') return requestsRoot(req, res, ctx)

  if (p0 === 'engagements') {
    if (!p1) return res.status(400).json({ error: 'engagement id required' })
    if (p2 === 'endorse') return engagementsEndorse(req, res, p1, ctx)
    return engagementsById(req, res, p1, ctx)
  }

  return res.status(404).json({ error: 'Not found' })
}
