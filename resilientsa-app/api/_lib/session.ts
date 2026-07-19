// api/_lib/session.ts
// Session middleware adapted for Vercel serverless functions
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from './db'
import { sessionTokens } from '../../src/db/schema/public/session-tokens'
import { users } from '../../src/db/schema/public/users'
import { eq, and, gt } from 'drizzle-orm'

export interface SessionContext {
  userId: string
  userRole: string
  nodeId: string
}

export async function getSession(req: VercelRequest): Promise<SessionContext | null> {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null

  const [session] = await db
    .select({ userId: sessionTokens.userId, role: users.role, nodeId: users.nodeId })
    .from(sessionTokens)
    .innerJoin(users, eq(sessionTokens.userId, users.id))
    .where(and(eq(sessionTokens.token, token), gt(sessionTokens.expiresAt, new Date())))
    .limit(1)

  if (!session) return null

  return {
    userId:   session.userId,
    userRole: session.role ?? 'member',
    nodeId:   session.nodeId ?? '',
  }
}

export function unauthorized(res: VercelResponse) {
  return res.status(401).json({ error: 'Unauthorized' })
}

export function forbidden(res: VercelResponse) {
  return res.status(403).json({ error: 'Forbidden' })
}
