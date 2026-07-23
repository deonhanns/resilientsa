// api/marketplace/offerings/[id]/request.ts
// Vercel serverless function — POST /api/marketplace/offerings/:id/request
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../../../_lib/session'
import { withRLSContext } from '../../../_lib/db-context'
import { db } from '../../../_lib/db'
import { programmeOfferings } from '../../../../src/db/schema/public/programme-offerings'
import { offeringEngagements } from '../../../../src/db/schema/public/offering-engagements'
import { eq, and, sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  // Role gate: only Cell Stewards and Node Admins can request support for their community
  if (session.userRole !== 'cell_steward' && session.userRole !== 'node_admin') {
    return forbidden(res)
  }

  const offeringId = req.query.id as string
  if (!offeringId) return res.status(400).json({ error: 'offering id required' })

  const { requestContext } = req.body

  const result = await withRLSContext(session.nodeId, session.userRole, async () => {
    // Verify offering exists and is active
    const [offering] = await db
      .select({ id: programmeOfferings.id, status: programmeOfferings.status })
      .from(programmeOfferings)
      .where(eq(programmeOfferings.id, offeringId))
      .limit(1)

    if (!offering) return { notFound: true }
    if (offering.status !== 'active') return { inactive: true }

    // Check for existing non-declined engagement from this node
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

    // Create engagement
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
