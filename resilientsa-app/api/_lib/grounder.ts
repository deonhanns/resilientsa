// api/_lib/grounder.ts
// Shared helper: resolve a session user's grounder record via grounders.user_id
import { db } from './db'
import { grounders } from '../../src/db/schema/public/grounders'
import { eq } from 'drizzle-orm'

export async function getGrounderForUser(userId: string): Promise<typeof grounders.$inferSelect | null> {
  const [grounder] = await db
    .select()
    .from(grounders)
    .where(eq(grounders.userId, userId))
    .limit(1)
  return grounder ?? null
}
