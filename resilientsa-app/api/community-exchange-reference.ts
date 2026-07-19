// api/community-exchange-reference.ts
// Vercel serverless function — GET /api/community-exchange-reference
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from './_lib/session'
import { withRLSContext } from './_lib/db-context'
import { db } from './_lib/db'
import { listings } from '../src/db/schema/public/listings'
import { eq, and, desc, sql } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const { cell_id, pillar } = req.query

  const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
    const conditions = [eq(listings.nodeId, session.nodeId), eq(listings.status, 'completed')]
    if (cell_id) conditions.push(eq(listings.cellId, cell_id as string))
    if (pillar && pillar !== 'all') {
      conditions.push(sql`${listings.pillarTags} @> ARRAY[${pillar as string}]`)
    }

    const completedListings = await db
      .select({ id: listings.id, title: listings.title, pillarTags: listings.pillarTags })
      .from(listings).where(and(...conditions))
      .orderBy(desc(listings.updatedAt)).limit(20)

    return completedListings.map((l) => ({
      listing_id: l.id,
      pillar_tag: l.pillarTags[0] ?? 'unknown',
      item_description: l.title,
      typical_equivalent: 'Community valued exchange',
      sample_size: 1,
      generated_at: new Date().toISOString(),
    }))
  })

  return res.json(rows)
}
