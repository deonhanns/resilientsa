// api/auth/verify-code.ts
// Vercel serverless function — POST /api/auth/verify-code
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyCode } from '../_lib/otp'
import { hashPhone, encryptPhone, normalisePhone } from '../_lib/crypto'
import { db } from '../_lib/db'
import { users } from '../../src/db/schema/public/users'
import { sessionTokens } from '../../src/db/schema/public/session-tokens'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
