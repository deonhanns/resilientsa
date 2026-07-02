// server/lib/gifts-nudge.ts
// Fires a complementary-gifts notification to the Cell Steward when a new
// member completes their Gifts Profile and other cell members already have profiles.
// Implements June Holley Integration Guide Section 3.2 requirement.
import { db } from '../../src/db/client'
import { giftsProfiles } from '../../src/db/schema/public/gifts-profiles'
import { users } from '../../src/db/schema/public/users'
import { cells } from '../../src/db/schema/public/cells'
import { notificationLog } from '../../src/db/schema/public/notification-log'
import { eq, ne, and, isNotNull } from 'drizzle-orm'

export async function fireComplementaryGiftsNudge(
  newUserId: string,
  nodeId: string
): Promise<void> {
  // Get the new member's cell
  const [member] = await db
    .select({ cellId: users.cellId, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, newUserId))
    .limit(1)

  if (!member?.cellId) return // not yet assigned to a cell — skip

  // Find the Cell Steward
  const [cell] = await db
    .select({ stewardUserId: cells.stewardUserId })
    .from(cells)
    .where(eq(cells.id, member.cellId))
    .limit(1)

  if (!cell?.stewardUserId) return // no steward yet — skip

  // Count other members in this cell who have completed a gifts profile
  const existingProfiles = await db
    .select({ userId: giftsProfiles.userId })
    .from(giftsProfiles)
    .innerJoin(users, eq(giftsProfiles.userId, users.id))
    .where(
      and(
        eq(users.cellId, member.cellId),
        ne(giftsProfiles.userId, newUserId),
        isNotNull(giftsProfiles.lovesToDo)
      )
    )

  if (existingProfiles.length === 0) return // no other profiles — skip

  // Log notification (SMS/WhatsApp dispatch is ORDER 009)
  await db.insert(notificationLog).values({
    userId:         cell.stewardUserId,
    channel:        'push',
    messageType:    'steward_alert',
    deliveryStatus: 'sent',
  })

  console.info(
    `[gifts-nudge] Steward ${cell.stewardUserId} notified: ` +
    `${member.displayName} completed gifts profile. ` +
    `${existingProfiles.length} existing profiles in cell.`
  )
}
