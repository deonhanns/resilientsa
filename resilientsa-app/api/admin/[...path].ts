// api/admin/[...path].ts
// Vercel serverless catch-all — /api/admin/*
// CREW-ORDER-009a — Node & Cell Formation.
//
// Internal routing (path segments from req.query.path):
//   nodes              -> GET  /api/admin/nodes
//   nodes              -> POST /api/admin/nodes
//   cells              -> GET  /api/admin/cells
//   cells              -> POST /api/admin/cells
//   members            -> GET  /api/admin/members
//   members/:id/cell   -> PATCH /api/admin/members/:id/cell
//   members/:id/role   -> PATCH /api/admin/members/:id/role
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { db } from '../_lib/db'
import { users } from '../../src/db/schema/public/users'
import { nodes } from '../../src/db/schema/public/nodes'
import { cells } from '../../src/db/schema/public/cells'
import { eq, and } from 'drizzle-orm'

type SessionCtx = { userId: string; userRole: string; nodeId: string }

function segments(req: VercelRequest): string[] {
  // See SCOTTY_PATTERNS.md Pattern 006: this deployment's routing passes
  // the catch-all param through with its literal '...' prefix still
  // attached (req.query['...path'] instead of req.query.path).
  const p = req.query.path ?? (req.query as Record<string, unknown>)['...path']
  if (Array.isArray(p)) return p as string[]
  if (typeof p === 'string') return [p]
  return []
}

// ─── nodes ───

// GET /api/admin/nodes
async function listNodes(req: VercelRequest, res: VercelResponse, session: SessionCtx) {
  if (session.userRole === 'regional_steward') {
    const rows = await db.select().from(nodes)
    return res.json({ nodes: rows })
  }
  if (session.userRole === 'node_admin') {
    const rows = await db.select().from(nodes).where(eq(nodes.id, session.nodeId))
    return res.json({ nodes: rows })
  }
  return forbidden(res)
}

// POST /api/admin/nodes
async function createNode(req: VercelRequest, res: VercelResponse, session: SessionCtx) {
  if (session.userRole !== 'regional_steward') return forbidden(res)

  const { name, raCpfName, initialAdminUserId } = req.body ?? {}
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' })
  }
  if (!initialAdminUserId || typeof initialAdminUserId !== 'string') {
    return res.status(400).json({ error: 'initialAdminUserId is required' })
  }

  try {
    const [targetUser] = await db.select({ id: users.id, role: users.role })
      .from(users).where(eq(users.id, initialAdminUserId))

    if (!targetUser) {
      return res.status(404).json({ error: 'No user found with that id' })
    }
    if (['node_admin', 'regional_steward'].includes(targetUser.role ?? '')) {
      return res.status(409).json({ error: 'This user already holds an administrative role elsewhere' })
    }

    const [node] = await db.insert(nodes).values({
      name, raCpfName: raCpfName ?? null, createdBy: session.userId,
    }).returning({ id: nodes.id })

    await db.update(users)
      .set({ nodeId: node.id, role: 'node_admin', cellId: null })
      .where(eq(users.id, initialAdminUserId))

    return res.status(201).json({ nodeId: node.id, adminUserId: initialAdminUserId })
  } catch (err: any) {
    console.error('createNode error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ─── cells ───

// GET /api/admin/cells
async function listCells(req: VercelRequest, res: VercelResponse, session: SessionCtx) {
  if (session.userRole !== 'node_admin') return forbidden(res)
  const rows = await withRLSContext(session.nodeId, session.userRole, async () =>
    db.select().from(cells).where(eq(cells.nodeId, session.nodeId))
  )
  return res.json({ cells: rows })
}

// POST /api/admin/cells
async function createCell(req: VercelRequest, res: VercelResponse, session: SessionCtx) {
  if (session.userRole !== 'node_admin') return forbidden(res)

  const { name } = req.body ?? {}
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' })
  }

  try {
    const result = await withRLSContext(session.nodeId, session.userRole, async () =>
      db.insert(cells).values({ nodeId: session.nodeId, name }).returning({ id: cells.id })
    )
    return res.status(201).json({ cellId: result[0].id })
  } catch (err: any) {
    console.error('createCell error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ─── members ───

// GET /api/admin/members
async function listMembers(req: VercelRequest, res: VercelResponse, session: SessionCtx) {
  if (session.userRole !== 'node_admin') return forbidden(res)
  const rows = await withRLSContext(session.nodeId, session.userRole, async () =>
    db.select({ id: users.id, displayName: users.displayName, role: users.role, cellId: users.cellId })
      .from(users).where(eq(users.nodeId, session.nodeId))
  )
  return res.json({ members: rows })
}

// PATCH /api/admin/members/:userId/cell
async function assignCell(req: VercelRequest, res: VercelResponse, targetUserId: string, session: SessionCtx) {
  if (session.userRole !== 'node_admin') return forbidden(res)

  const { cellId } = req.body ?? {}
  if (!cellId || typeof cellId !== 'string') {
    return res.status(400).json({ error: 'cellId is required' })
  }

  try {
    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const [targetUser] = await db.select({ id: users.id, nodeId: users.nodeId })
        .from(users).where(eq(users.id, targetUserId))
      if (!targetUser) return { error: 'No user found with that id', status: 404 as const }
      if (targetUser.nodeId !== session.nodeId) return { error: 'Forbidden', status: 403 as const }

      const [targetCell] = await db.select({ id: cells.id, nodeId: cells.nodeId })
        .from(cells).where(eq(cells.id, cellId))
      if (!targetCell || targetCell.nodeId !== session.nodeId) {
        return { error: 'No cell found in your node with that id', status: 404 as const }
      }

      await db.update(users).set({ cellId }).where(eq(users.id, targetUserId))
      return { ok: true }
    })

    if ('error' in result) return res.status(result.status).json({ error: result.error })
    return res.json(result)
  } catch (err: any) {
    console.error('assignCell error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// PATCH /api/admin/members/:userId/role
async function setMemberRole(req: VercelRequest, res: VercelResponse, targetUserId: string, session: SessionCtx) {
  if (session.userRole !== 'node_admin') return forbidden(res)

  const { role } = req.body ?? {}
  if (role !== 'cell_steward' && role !== 'member') {
    return res.status(400).json({ error: "role must be 'cell_steward' or 'member'" })
  }

  try {
    const result = await withRLSContext(session.nodeId, session.userRole, async () => {
      const [targetUser] = await db.select({ id: users.id, nodeId: users.nodeId, cellId: users.cellId, role: users.role })
        .from(users).where(eq(users.id, targetUserId))
      if (!targetUser) return { error: 'No user found with that id', status: 404 as const }
      if (targetUser.nodeId !== session.nodeId) return { error: 'Forbidden', status: 403 as const }

      await db.update(users).set({ role }).where(eq(users.id, targetUserId))

      if (role === 'cell_steward' && targetUser.cellId) {
        await db.update(cells).set({ stewardUserId: targetUserId }).where(eq(cells.id, targetUser.cellId))
      }
      if (role === 'member') {
        // Demotion: clear stewardship of any cell this user was stewarding
        await db.update(cells).set({ stewardUserId: null })
          .where(and(eq(cells.nodeId, session.nodeId), eq(cells.stewardUserId, targetUserId)))
      }

      return { ok: true, role }
    })

    if ('error' in result) return res.status(result.status).json({ error: result.error })
    return res.json(result)
  } catch (err: any) {
    console.error('setMemberRole error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const ctx = session as SessionCtx
  const seg = segments(req)
  const [p0, p1, p2] = seg

  if (p0 === 'nodes' && req.method === 'GET') return listNodes(req, res, ctx)
  if (p0 === 'nodes' && req.method === 'POST') return createNode(req, res, ctx)
  if (p0 === 'cells' && req.method === 'GET') return listCells(req, res, ctx)
  if (p0 === 'cells' && req.method === 'POST') return createCell(req, res, ctx)
  if (p0 === 'members' && !p1 && req.method === 'GET') return listMembers(req, res, ctx)
  if (p0 === 'members' && p1 && p2 === 'cell' && req.method === 'PATCH') return assignCell(req, res, p1, ctx)
  if (p0 === 'members' && p1 && p2 === 'role' && req.method === 'PATCH') return setMemberRole(req, res, p1, ctx)

  return res.status(404).json({ error: 'Not found' })
}
