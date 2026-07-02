import { Router } from 'express'
import { requireSession, withRLSContext } from '../middleware/session'
import { db } from '../../src/db/client'
import { giftsProfiles } from '../../src/db/schema/public/gifts-profiles'
import { eq } from 'drizzle-orm'
import { fireComplementaryGiftsNudge } from '../lib/gifts-nudge'

const router = Router()

// GET /gifts-profile/me — returns the authenticated user's gifts profile (or null)
router.get('/me', requireSession, async (req, res) => {
  const r = req as any
  const profile = await withRLSContext(r.nodeId, r.userRole, () =>
    db.select().from(giftsProfiles).where(eq(giftsProfiles.userId, r.userId)).limit(1)
  )
  res.json(profile[0] ?? null)
})

// PUT /gifts-profile/me — creates or updates the authenticated user's gifts profile
router.put('/me', requireSession, async (req, res) => {
  const r = req as any
  const { loves_to_do, naturally_good_at, cares_about, free_text_gifts } = req.body

  const existing = await withRLSContext(r.nodeId, r.userRole, () =>
    db.select().from(giftsProfiles).where(eq(giftsProfiles.userId, r.userId)).limit(1)
  )

  let profile

  if (existing.length > 0) {
    ;[profile] = await withRLSContext(r.nodeId, r.userRole, () =>
      db
        .update(giftsProfiles)
        .set({
          lovesToDo:       loves_to_do,
          naturallyGoodAt: naturally_good_at,
          caresDeeplyAbout: cares_about,
          freeTextGifts:   free_text_gifts,
          updatedAt:       new Date(),
        })
        .where(eq(giftsProfiles.userId, r.userId))
        .returning()
    )
  } else {
    ;[profile] = await withRLSContext(r.nodeId, r.userRole, () =>
      db
        .insert(giftsProfiles)
        .values({
          userId:          r.userId,
          lovesToDo:       loves_to_do,
          naturallyGoodAt: naturally_good_at,
          caresDeeplyAbout: cares_about,
          freeTextGifts:   free_text_gifts,
        })
        .returning()
    )

    // Fire complementary-gifts nudge to Cell Steward on first creation
    fireComplementaryGiftsNudge(r.userId, r.nodeId).catch((err) => {
      console.warn('[gifts-nudge] Non-critical nudge failed:', err.message)
    })
  }

  res.json(profile)
})

export default router
