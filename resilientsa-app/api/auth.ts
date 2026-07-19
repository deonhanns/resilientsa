// api/auth.ts
// Consolidated auth routes — POST /api/auth/request-code, POST /api/auth/verify-code
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sms } from './_lib/at'
import { generateCode, storeCode, verifyCode } from './_lib/otp'
import { hashPhone, encryptPhone, normalisePhone } from './_lib/crypto'
import { db } from './_lib/db'
import { users } from '../src/db/schema/public/users'
import { sessionTokens } from '../src/db/schema/public/session-tokens'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url ?? ''

  // POST /api/auth/request-code
  if (req.method === 'POST' && url.endsWith('/request-code')) {
    const { phone_number } = req.body
    if (!phone_number) return res.status(400).json({ error: 'phone_number required' })

    const normalised = normalisePhone(phone_number)
    const phoneHash  = hashPhone(normalised)
    const code       = generateCode()
    await storeCode(phoneHash, code)

    try {
      await sms.send({
        to: [normalised],
        message: `Your ResilientSA code is ${code}. Valid for 10 minutes.`,
        from: process.env.AT_SENDER_ID ?? 'ResilientSA',
      })
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[SANDBOX] OTP for ${normalised}: ${code}`)
      }
    }
    return res.json({ message: 'Code sent' })
  }

  // POST /api/auth/verify-code
  if (req.method === 'POST' && url.endsWith('/verify-code')) {
    const { phone_number, code, preferred_language } = req.body
    if (!phone_number || !code) return res.status(400).json({ error: 'phone_number and code required' })

    const normalised = normalisePhone(phone_number)
    const phoneHash  = hashPhone(normalised)
    const valid      = await verifyCode(phoneHash, code)
    if (!valid) return res.status(401).json({ error: 'Invalid or expired code' })

    const encryptedPhone = encryptPhone(normalised)
    let userRows = await db.select().from(users).where(eq(users.phoneHash, phoneHash)).limit(1)
    let user = userRows[0]

    if (!user) {
      const [inserted] = await db.insert(users).values({
        displayName: 'Community member', nodeId: '00000000-0000-0000-0000-000000000001',
        phoneHash, phoneNumber: encryptedPhone, role: 'member',
        preferredLanguage: preferred_language ?? 'en',
      }).returning()
      user = inserted
    } else {
      await db.update(users).set({ phoneNumber: encryptedPhone }).where(eq(users.id, user.id))
    }

    const sessionToken = randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await db.insert(sessionTokens).values({ token: sessionToken, userId: user!.id, expiresAt })

    return res.json({ session_token: sessionToken, user_id: user!.id, role: user!.role })
  }

  return res.status(404).json({ error: 'Not found' })
}
