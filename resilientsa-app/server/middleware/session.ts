import { Request, Response, NextFunction } from 'express'
import { db } from '../../src/db/client'
import { sessionTokens } from '../../src/db/schema/public/session-tokens'
import { users } from '../../src/db/schema/public/users'
import { eq, and, gt } from 'drizzle-orm'

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ error: 'No session token' })
    return
  }

  const [session] = await db
    .select({
      userId: sessionTokens.userId,
      role:   users.role,
      nodeId: users.nodeId,
    })
    .from(sessionTokens)
    .innerJoin(users, eq(sessionTokens.userId, users.id))
    .where(
      and(
        eq(sessionTokens.token, token),
        gt(sessionTokens.expiresAt, new Date()),
      )
    )
    .limit(1)

  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session' })
    return
  }

  // Attach session context to request for downstream use
  // RLS context (SET LOCAL app.current_node_id/role) will be set at
  // the db client level in a future order — requires per-connection config
  ;(req as any).userId   = session.userId
  ;(req as any).userRole = session.role
  ;(req as any).nodeId   = session.nodeId

  next()
}
