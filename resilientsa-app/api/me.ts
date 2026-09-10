// api/me.ts
// GET /api/me — returns the current session user's own profile.
//
// This endpoint was missing entirely. TradeExchange.tsx has always called
// it to learn the user's cellId, silently 404'd, and permanently showed
// "Your Cell Steward will add you to a cell soon" for every user regardless
// of their actual cell assignment — the message was never wrong data, it
// was an unreachable code path. See SCOTTY_PATTERNS.md Pattern 007.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from './_lib/session'
import { db } from './_lib/db'
import { users } from '../src/db/schema/public/users'
import { eq } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const [user] = await db
    .select({
      id:          users.id,
      displayName: users.displayName,
      role:        users.role,
      nodeId:      users.nodeId,
      cellId:      users.cellId,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  if (!user) return res.status(404).json({ error: 'User not found' })

  return res.json(user)
}
