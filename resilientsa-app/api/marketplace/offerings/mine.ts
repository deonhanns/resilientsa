// api/marketplace/offerings/mine.ts
// Vercel serverless function — GET /api/marketplace/offerings/mine
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { getGrounderForUser } from '../../_lib/grounder'
import { db } from '../../_lib/db'
import { programmeOfferings } from '../../../src/db/schema/public/programme-offerings'
import { offeringEngagements } from '../../../src/db/schema/public/offering-engagements'
import { eq, desc, count } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)

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
