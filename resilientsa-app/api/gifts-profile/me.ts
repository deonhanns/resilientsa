// api/gifts-profile/me.ts
// Vercel serverless function — GET/PUT /api/gifts-profile/me
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { db } from '../_lib/db'
import { giftsProfiles } from '../../src/db/schema/public/gifts-profiles'
import { eq } from 'drizzle-orm'
import { fireComplementaryGiftsNudge } from '../_lib/gifts-nudge'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  if (req.method === 'GET') {
    const profile = await withRLSContext(session.nodeId, session.userRole, () =>
      db.select().from(giftsProfiles).where(eq(giftsProfiles.userId, session.userId)).limit(1)
    )
    return res.json(profile[0] ?? null)
  }

  if (req.method === 'PUT') {
    const { loves_to_do, naturally_good_at, cares_about, free_text_gifts } = req.body

    const existing = await withRLSContext(session.nodeId, session.userRole, () =>
      db.select().from(giftsProfiles).where(eq(giftsProfiles.userId, session.userId)).limit(1)
    )

    let profile

    if (existing.length > 0) {
      ;[profile] = await withRLSContext(session.nodeId, session.userRole, () =>
        db
          .update(giftsProfiles)
          .set({
            lovesToDo:       loves_to_do,
            naturallyGoodAt: naturally_good_at,
            caresDeeplyAbout: cares_about,
            freeTextGifts:   free_text_gifts,
            updatedAt:       new Date(),
          })
          .where(eq(giftsProfiles.userId, session.userId))
          .returning()
      )
    } else {
      ;[profile] = await withRLSContext(session.nodeId, session.userRole, () =>
        db
          .insert(giftsProfiles)
          .values({
            userId:          session.userId,
            lovesToDo:       loves_to_do,
            naturallyGoodAt: naturally_good_at,
            caresDeeplyAbout: cares_about,
            freeTextGifts:   free_text_gifts,
          })
          .returning()
      )

      fireComplementaryGiftsNudge(session.userId, session.nodeId).catch((err) => {
        console.warn('[gifts-nudge] Non-critical nudge failed:', err.message)
      })
    }

    return res.json(profile)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
