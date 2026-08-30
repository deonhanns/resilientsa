// api/listings/[...path].ts
// Vercel serverless catch-all — /api/listings/*
// Consolidates ORDER 006's 2 listing handlers into ONE function (function-count
// consolidation to stay under the Vercel Hobby 12-function limit, Spock-approved).
//
// Internal routing (path segments from req.query.path):
//   (empty)  -> GET/POST /api/listings
//   :id      -> PATCH/DELETE /api/listings/:id
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSession, unauthorized } from '../_lib/session'
import { withRLSContext } from '../_lib/db-context'
import { db } from '../_lib/db'
import { listings } from '../../src/db/schema/public/listings'
import { users } from '../../src/db/schema/public/users'
import { eq, and, desc, sql } from 'drizzle-orm'

type SessionCtx = { userId: string; userRole: string; nodeId: string }

function segments(req: VercelRequest): string[] {
  const p = req.query.path
  if (Array.isArray(p)) return p as string[]
  if (typeof p === 'string') return [p]
  return []
}

// GET/POST /api/listings
async function listingsRoot(req: VercelRequest, res: VercelResponse, session: SessionCtx) {
  if (req.method === 'GET') {
    const { cell_id, pillar, type, status } = req.query

    const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
      const conditions = [eq(listings.nodeId, session.nodeId)]
      if (cell_id)  conditions.push(eq(listings.cellId, cell_id as string))
      if (status)   conditions.push(eq(listings.status, status as any))
      if (type)     conditions.push(eq(listings.type, type as any))
      if (pillar && pillar !== 'all') {
        conditions.push(sql`${listings.pillarTags} @> ARRAY[${pillar as string}]`)
      }
      return db.select().from(listings).where(and(...conditions)).orderBy(desc(listings.createdAt)).limit(100)
    })

    return res.json(rows)
  }

  if (req.method === 'POST') {
    const { type, pillar_tags, title, description } = req.body
    if (!type || !pillar_tags || !title) {
      return res.status(400).json({ error: 'type, pillar_tags, and title are required' })
    }

    const [user] = await withRLSContext(session.nodeId, session.userRole, () =>
      db.select({ cellId: users.cellId }).from(users).where(eq(users.id, session.userId)).limit(1)
    )

    if (!user?.cellId) {
      return res.status(400).json({ error: 'You must be assigned to a cell before posting a listing' })
    }

    const [listing] = await withRLSContext(session.nodeId, session.userRole, () =>
      db.insert(listings).values({
        nodeId:      session.nodeId,
        cellId:      user.cellId!,
        userId:      session.userId,
        type,
        pillarTags:  pillar_tags,
        title,
        description: description ?? null,
      }).returning()
    )

    return res.status(201).json(listing)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// PATCH/DELETE /api/listings/:id
async function listingById(req: VercelRequest, res: VercelResponse, id: string, session: SessionCtx) {
  if (req.method === 'PATCH') {
    const { title, description, status, expected_status } = req.body

    const rows = await withRLSContext(session.nodeId, session.userRole, async () => {
      const [existing] = await db
        .select().from(listings)
        .where(and(eq(listings.id, id), eq(listings.userId, session.userId)))
        .limit(1)

      if (!existing) return null
      if (expected_status && existing.status !== expected_status) {
        return { conflict: true, current: existing.status }
      }

      return db.update(listings).set({
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
        updatedAt: new Date(),
      }).where(eq(listings.id, id)).returning()
    })

    if (!rows) return res.status(404).json({ error: 'Listing not found' })
    if (!Array.isArray(rows)) {
      if ('conflict' in rows) {
        return res.status(409).json({ error: 'Status conflict', current_status: (rows as any).current })
      }
      return res.status(500).json({ error: 'Unexpected response' })
    }
    return res.json(rows[0])
  }

  if (req.method === 'DELETE') {
    const rows = await withRLSContext(session.nodeId, session.userRole, () =>
      db.update(listings)
        .set({ status: 'withdrawn', updatedAt: new Date() })
        .where(and(eq(listings.id, id), eq(listings.userId, session.userId)))
        .returning()
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Listing not found or not yours' })
    return res.json(rows[0])
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await getSession(req)
  if (!session) return unauthorized(res)
  const ctx = session as SessionCtx

  const seg = segments(req)
  const [p0] = seg

  if (!p0) return listingsRoot(req, res, ctx)
  return listingById(req, res, p0, ctx)
}
