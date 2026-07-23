// api/marketplace/engagements/[id]/endorse.ts
// Vercel serverless function — POST /api/marketplace/engagements/:id/endorse
// Node Admin endorses after engagement completion
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../../../_lib/session'
import { withRLSContext } from '../../../_lib/db-context'
import { db } from '../../../_lib/db'
import { offeringEngagements } from '../../../../src/db/schema/public/offering-engagements'
import { offeringEndorsements } from '../../../../src/db/schema/public/offering-endorsements'
import { eq, and } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  // Role gate: only Node Admins can endorse
  if (session.userRole !== 'node_admin') {
    return forbidden(res)
  }

  const engagementId = req.query.id as string
  if (!engagementId) return res.status(400).json({ error: 'engagement id required' })

  const { recommend, note, visibility } = req.body
  if (typeof recommend !== 'boolean') {
    return res.status(400).json({ error: 'recommend (boolean) is required' })
  }

  const result = await withRLSContext(session.nodeId, session.userRole, async () => {
    // Verify engagement exists, is completed, and belongs to this node
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

    // Check for existing endorsement (one per engagement per node)
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
