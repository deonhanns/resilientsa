// api/marketplace/offerings/index.ts
// Vercel serverless function — GET/POST /api/marketplace/offerings
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { db } from '../../_lib/db'
import { programmeOfferings } from '../../../src/db/schema/public/programme-offerings'
import { grounders } from '../../../src/db/schema/public/grounders'
import { offeringEndorsements } from '../../../src/db/schema/public/offering-endorsements'
import { eq, and, desc, sql } from 'drizzle-orm'

// TODO: Schema gap — grounders table needs a user_id column to link a session user to their grounder record.
// When user_id is added, replace this with: db.select().from(grounders).where(eq(grounders.userId, userId)).limit(1)
async function getGrounderForUser(_userId: string): Promise<typeof grounders.$inferSelect | null> {
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  // GET /api/marketplace/offerings?pillar=&search=
  // Community-facing browse — only verified grounders, active offerings
  if (req.method === 'GET') {
    const { pillar, search } = req.query

    const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
      // Build conditions
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

      // Fetch endorsement counts per offering
      const offeringIds = offerings.map((o) => o.id)
      const endorsementCounts: Record<string, { recommend: number; total: number }> = {}

      if (offeringIds.length > 0) {
        // Get endorsements via engagements for these offerings
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

  // POST /api/marketplace/offerings — Grounder creates a new offering
  if (req.method === 'POST') {
    const grounder = await getGrounderForUser(session.userId)
    if (!grounder) {
      return res.status(403).json({ error: 'Only verified Grounders can create offerings. Schema gap: grounders table needs user_id FK.' })
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
