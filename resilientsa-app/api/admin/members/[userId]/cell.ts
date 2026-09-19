// api/admin/members/[userId]/cell.ts
// Vercel serverless function — PATCH /api/admin/members/:userId/cell
//
// CREW-ORDER-010 Path B. Extracted verbatim from `api/admin/[...path].ts`, whose
// catch-all only matched ONE path segment — so this route returned Vercel's
// platform 404 and was unreachable in production, meaning ORDER 009a milestone 4
// (member-to-cell assignment) could not be exercised by anyone. See
// WORF_ALERTS/2026-09-11-catchall-routing-depth-failure.md.
//
// CREW-ORDER-011 §4.1: queries now run through the `tx` handed in by
// withRLSContext instead of the module-level `db`, so the RLS context variables
// actually apply to them. Logic otherwise unchanged: same node_admin gate, same
// server-side cross-node rejection, same "cell must belong to the caller's node"
// check, same 404-instead-of-403 for a cross-node cell (no existence leak).
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../../../_lib/session'
import { withRLSContext } from '../../../_lib/db-context'
import { withAppConnection } from '../../../_lib/with-app-connection'
import { users } from '../../../../src/db/schema/public/users'
import { cells } from '../../../../src/db/schema/public/cells'
import { eq } from 'drizzle-orm'

type SessionCtx = { userId: string; userRole: string; nodeId: string }

export default withAppConnection(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const ctx = session as SessionCtx
  if (ctx.userRole !== 'node_admin') return forbidden(res)

  const targetUserId = req.query.userId as string
  if (!targetUserId) return res.status(400).json({ error: 'userId required' })

  const { cellId } = req.body ?? {}
  if (!cellId || typeof cellId !== 'string') {
    return res.status(400).json({ error: 'cellId is required' })
  }

  try {
    const result = await withRLSContext(ctx.nodeId, ctx.userRole, ctx.userId, async (tx) => {
      const [targetUser] = await tx.select({ id: users.id, nodeId: users.nodeId })
        .from(users).where(eq(users.id, targetUserId))
      if (!targetUser) return { error: 'No user found with that id', status: 404 as const }
      if (targetUser.nodeId !== ctx.nodeId) return { error: 'Forbidden', status: 403 as const }

      const [targetCell] = await tx.select({ id: cells.id, nodeId: cells.nodeId })
        .from(cells).where(eq(cells.id, cellId))
      if (!targetCell || targetCell.nodeId !== ctx.nodeId) {
        return { error: 'No cell found in your node with that id', status: 404 as const }
      }

      await tx.update(users).set({ cellId }).where(eq(users.id, targetUserId))
      return { ok: true }
    })

    if ('error' in result) return res.status(result.status ?? 500).json({ error: result.error })
    return res.json(result)
  } catch (err: any) {
    console.error('assignCell error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
