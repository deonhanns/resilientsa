// api/admin/[...path].ts
// Vercel serverless catch-all — /api/admin/*
// CREW-ORDER-009a — Node & Cell Formation.
//
// Internal routing (path segments from req.query.path):
//   nodes        -> GET  /api/admin/nodes
//   nodes        -> POST /api/admin/nodes
//   cells        -> GET  /api/admin/cells
//   cells        -> POST /api/admin/cells
//   members      -> GET  /api/admin/members
//
// CREW-ORDER-010 Path B: the two member sub-routes that used to live here —
// PATCH /api/admin/members/:userId/cell and PATCH /api/admin/members/:userId/role —
// were moved to real nested files (api/admin/members/[userId]/cell.ts and role.ts)
// because this catch-all only ever matched ONE path segment, so those routes
// returned Vercel's platform 404 and were unreachable in production. See
// WORF_ALERTS/2026-09-11-catchall-routing-depth-failure.md.
//
// The remaining five routes are all single-segment and therefore route correctly
// through this file; their behaviour is unchanged.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized, forbidden } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { db } from '../_lib/db'
import { users } from '../../src/db/schema/public/users'
import { nodes } from '../../src/db/schema/public/nodes'
import { cells } from '../../src/db/schema/public/cells'
import { eq } from 'drizzle-orm'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)

  const ctx = session as SessionCtx
  const seg = segments(req)
  const [p0, p1] = seg

  if (p0 === 'nodes' && req.method === 'GET') return listNodes(req, res, ctx)
  if (p0 === 'nodes' && req.method === 'POST') return createNode(req, res, ctx)
  if (p0 === 'cells' && req.method === 'GET') return listCells(req, res, ctx)
  if (p0 === 'cells' && req.method === 'POST') return createCell(req, res, ctx)
  if (p0 === 'members' && !p1 && req.method === 'GET') return listMembers(req, res, ctx)

  return res.status(404).json({ error: 'Not found' })
}
