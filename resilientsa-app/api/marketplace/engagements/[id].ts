// api/marketplace/engagements/[id].ts
// Vercel serverless function — PATCH /api/marketplace/engagements/:id
// Grounder accepts, declines, or marks an engagement as completed
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { getGrounderForUser } from '../../_lib/grounder'
import { db } from '../../_lib/db'
import { offeringEngagements } from '../../../src/db/schema/public/offering-engagements'
import { programmeOfferings } from '../../../src/db/schema/public/programme-offerings'
import { eq, and } from 'drizzle-orm'

const VALID_TRANSITIONS: Record<string, string[]> = {
  requested: ['accepted', 'declined'],
  accepted: ['active', 'declined', 'completed'],
  active: ['completed'],
  completed: [],
  declined: [],
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const engagementId = req.query.id as string
  if (!engagementId) return res.status(400).json({ error: 'id required' })

  const grounder = await getGrounderForUser(session.userId)
  if (!grounder) return res.status(403).json({ error: 'Only Grounders can manage engagements.' })

  const { status: newStatus } = req.body
  if (!newStatus || !['accepted', 'declined', 'active', 'completed'].includes(newStatus)) {
    return res.status(400).json({ error: 'Valid status required: accepted, declined, active, completed' })
  }

  const result = await withRLSContext(session.nodeId, session.userRole, async () => {
    // Verify the engagement's offering belongs to this grounder
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

    // Validate state transition
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
