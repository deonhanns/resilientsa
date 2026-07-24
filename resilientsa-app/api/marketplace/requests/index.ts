// api/marketplace/requests/index.ts
// Vercel serverless function — GET /api/marketplace/requests
// Grounder's incoming request inbox
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { getGrounderForUser } from '../../_lib/grounder'
import { db } from '../../_lib/db'
import { offeringEngagements } from '../../../src/db/schema/public/offering-engagements'
import { programmeOfferings } from '../../../src/db/schema/public/programme-offerings'
import { nodes } from '../../../src/db/schema/public/nodes'
import { eq, and, desc, sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)

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
