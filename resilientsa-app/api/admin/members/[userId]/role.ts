// api/admin/members/[userId]/role.ts
// Vercel serverless function — PATCH /api/admin/members/:userId/role
//
// CREW-ORDER-010 Path B. Extracted verbatim from `api/admin/[...path].ts`, whose
// catch-all only matched ONE path segment — so this route returned Vercel's
// platform 404 and was unreachable in production, meaning ORDER 009a milestone 5
// (Cell Steward promotion/demotion) could not be exercised by anyone. See
// WORF_ALERTS/2026-09-11-order009a-role-escalation-review.md.
//
// CREW-ORDER-011 §4.1: queries now run through the `tx` handed in by
// withRLSContext rather than the module-level `db`.
//
// The strict POSITIVE allowlist below is preserved exactly — only 'cell_steward'
// and 'member' are ever accepted, so node_admin / regional_steward / grounder
// cannot be granted through this route. It is the most security-sensitive line in
// ORDER 009a and must not be altered.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../../../_lib/session'
import { withRLSContext } from '../../../_lib/db-context'
import { users } from '../../../../src/db/schema/public/users'
import { cells } from '../../../../src/db/schema/public/cells'
import { eq, and } from 'drizzle-orm'

type SessionCtx = { userId: string; userRole: string; nodeId: string }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const ctx = session as SessionCtx
  if (ctx.userRole !== 'node_admin') return forbidden(res)

  const targetUserId = req.query.userId as string
  if (!targetUserId) return res.status(400).json({ error: 'userId required' })

  const { role } = req.body ?? {}
  if (role !== 'cell_steward' && role !== 'member') {
    return res.status(400).json({ error: "role must be 'cell_steward' or 'member'" })
  }

  try {
    const result = await withRLSContext(ctx.nodeId, ctx.userRole, async (tx) => {
      const [targetUser] = await tx.select({ id: users.id, nodeId: users.nodeId, cellId: users.cellId, role: users.role })
        .from(users).where(eq(users.id, targetUserId))
      if (!targetUser) return { error: 'No user found with that id', status: 404 as const }
      if (targetUser.nodeId !== ctx.nodeId) return { error: 'Forbidden', status: 403 as const }

      await tx.update(users).set({ role }).where(eq(users.id, targetUserId))

      if (role === 'cell_steward' && targetUser.cellId) {
        await tx.update(cells).set({ stewardUserId: targetUserId }).where(eq(cells.id, targetUser.cellId))
      }
      if (role === 'member') {
        // Demotion: clear stewardship of any cell this user was stewarding
        await tx.update(cells).set({ stewardUserId: null })
          .where(and(eq(cells.nodeId, ctx.nodeId), eq(cells.stewardUserId, targetUserId)))
      }

      return { ok: true, role }
    })

    if ('error' in result) return res.status(result.status ?? 500).json({ error: result.error })
    return res.json(result)
  } catch (err: any) {
    console.error('setMemberRole error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
