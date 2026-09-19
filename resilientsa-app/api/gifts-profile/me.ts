// api/gifts-profile/me.ts
// Vercel serverless function — GET/PUT /api/gifts-profile/me
//
// CREW-ORDER-011 §4.1: every query now runs through the `tx` handed in by
// withRLSContext instead of the module-level `db`, so the transaction-local
// set_config() RLS variables actually apply to them. Logic unchanged.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { withAppConnection } from '../_lib/with-app-connection'
import { giftsProfiles } from '../../src/db/schema/public/gifts-profiles'
import { eq } from 'drizzle-orm'
import { fireComplementaryGiftsNudge } from '../_lib/gifts-nudge'

export default withAppConnection(async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  if (req.method === 'GET') {
    const profile = await withRLSContext(session.nodeId, session.userRole, session.userId, (tx) =>
      tx.select().from(giftsProfiles).where(eq(giftsProfiles.userId, session.userId)).limit(1)
    )
    return res.json(profile[0] ?? null)
  }

  if (req.method === 'PUT') {
    const { loves_to_do, naturally_good_at, cares_about, free_text_gifts } = req.body

    const existing = await withRLSContext(session.nodeId, session.userRole, session.userId, (tx) =>
      tx.select().from(giftsProfiles).where(eq(giftsProfiles.userId, session.userId)).limit(1)
    )

    let profile

    if (existing.length > 0) {
      ;[profile] = await withRLSContext(session.nodeId, session.userRole, session.userId, (tx) =>
        tx
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
      ;[profile] = await withRLSContext(session.nodeId, session.userRole, session.userId, (tx) =>
        tx
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
})
