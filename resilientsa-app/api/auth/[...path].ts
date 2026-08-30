// api/auth/[...path].ts
// Vercel serverless catch-all — /api/auth/*
// Consolidates ORDER 004's 2 auth handlers into ONE function (function-count
// consolidation to stay under the Vercel Hobby 12-function limit, Spock-approved).
//
// Internal routing (path segments from req.query.path):
//   request-code -> POST /api/auth/request-code
//   verify-code  -> POST /api/auth/verify-code
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateCode, storeCode, verifyCode } from '../_lib/otp'
import { hashPhone, encryptPhone, normalisePhone } from '../_lib/crypto'
import { sms } from '../_lib/at'
import { db } from '../_lib/db'
import { users } from '../../src/db/schema/public/users'
import { sessionTokens } from '../../src/db/schema/public/session-tokens'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

function segments(req: VercelRequest): string[] {
  const p = req.query.path
  if (Array.isArray(p)) return p as string[]
  if (typeof p === 'string') return [p]
  return []
}

// POST /api/auth/request-code
async function requestCode(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { phone_number } = req.body
    if (!phone_number) return res.status(400).json({ error: 'phone_number required' })

    const normalised = normalisePhone(phone_number)
    const phoneHash  = hashPhone(normalised)
    const code       = generateCode()

    await storeCode(phoneHash, code)

    try {
      await sms.send({
        to:      [normalised],
        message: `Your ResilientSA code is ${code}. Valid for 10 minutes.`,
        from:    process.env.AT_SENDER_ID ?? 'ResilientSA',
      })
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[SANDBOX] OTP for ${normalised}: ${code}`)
      }
    }

    return res.json({ message: 'Code sent' })
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || 'Unknown error',
      stack: err.stack?.split('\n').slice(0, 3),
      hasDbUrl: !!process.env.DATABASE_URL,
      hasEncKey: !!process.env.ENCRYPTION_KEY,
    })
  }
}

// POST /api/auth/verify-code
async function verifyCodeRoute(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone_number, code, preferred_language } = req.body
  if (!phone_number || !code) {
    return res.status(400).json({ error: 'phone_number and code required' })
  }

  const normalised = normalisePhone(phone_number)
  const phoneHash  = hashPhone(normalised)
  const valid      = await verifyCode(phoneHash, code)

  if (!valid) {
    return res.status(401).json({ error: 'Invalid or expired code' })
  }

  const encryptedPhone = encryptPhone(normalised)

  let userRows = await db
    .select()
    .from(users)
    .where(eq(users.phoneHash, phoneHash))
    .limit(1)

  let user = userRows[0]

  if (!user) {
    const [inserted] = await db
      .insert(users)
      .values({
        displayName:       'Community member',
        nodeId:            '00000000-0000-0000-0000-000000000001',
        phoneHash:         phoneHash,
        phoneNumber:       encryptedPhone,
        role:              'member',
        preferredLanguage: preferred_language ?? 'en',
      })
      .returning()
    user = inserted
  } else {
    await db
      .update(users)
      .set({ phoneNumber: encryptedPhone })
      .where(eq(users.id, user.id))
  }

  const sessionToken = randomUUID()
  const expiresAt    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await db.insert(sessionTokens).values({
    token:     sessionToken,
    userId:    user!.id,
    expiresAt,
  })

  return res.json({
    session_token: sessionToken,
    user_id:       user!.id,
    role:          user!.role,
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const seg = segments(req)
  const [p0] = seg

  if (p0 === 'request-code') return requestCode(req, res)
  if (p0 === 'verify-code') return verifyCodeRoute(req, res)

  return res.status(404).json({ error: 'Not found' })
}
