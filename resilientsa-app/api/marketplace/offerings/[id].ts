// api/marketplace/offerings/[id].ts
// Vercel serverless function — PATCH /api/marketplace/offerings/:id
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../../_lib/session'
import { withRLSContext } from '../../_lib/db-context'
import { getGrounderForUser } from '../../_lib/grounder'
import { db } from '../../_lib/db'
import { programmeOfferings } from '../../../src/db/schema/public/programme-offerings'
import { eq, and } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const id = req.query.id as string
  if (!id) return res.status(400).json({ error: 'id required' })

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
