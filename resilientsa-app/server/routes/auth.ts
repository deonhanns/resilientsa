import { Router, Request, Response } from 'express'
import { sms } from '../lib/at'
import { generateCode, storeCode, verifyCode } from '../lib/otp'
import { hashPhone, encryptPhone, normalisePhone } from '../lib/crypto'
import { db } from '../../src/db/client'
import { users } from '../../src/db/schema/public/users'
import { sessionTokens } from '../../src/db/schema/public/session-tokens'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

const router = Router()

// POST /auth/request-code
router.post('/request-code', async (req: Request, res: Response) => {
  const { phone_number } = req.body
  if (!phone_number) {
    res.status(400).json({ error: 'phone_number required' })
    return
  }

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
    // In sandbox mode, SMS may fail if number is not whitelisted
    // Log the code in sandbox so we can still develop
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SANDBOX] OTP for ${normalised}: ${code}`)
    }
  }

  res.json({ message: 'Code sent' })
})

// POST /auth/verify-code
router.post('/verify-code', async (req: Request, res: Response) => {
  const { phone_number, code, preferred_language } = req.body
  if (!phone_number || !code) {
    res.status(400).json({ error: 'phone_number and code required' })
    return
  }

  const normalised = normalisePhone(phone_number)
  const phoneHash  = hashPhone(normalised)
  const valid      = await verifyCode(phoneHash, code)

  if (!valid) {
    res.status(401).json({ error: 'Invalid or expired code' })
    return
  }

  const encryptedPhone = encryptPhone(normalised)

  let userRows = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, encryptedPhone))
    .limit(1)

  let user = userRows[0]

  if (!user) {
    const [inserted] = await db
      .insert(users)
      .values({
        displayName:       'Community member',
        nodeId:            '00000000-0000-0000-0000-000000000001', // default node
        phoneNumber:       encryptedPhone,
        role:              'member',
        preferredLanguage: preferred_language ?? 'en',
      })
      .returning()
    user = inserted
  }

  const sessionToken = randomUUID()
  const expiresAt    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await db.insert(sessionTokens).values({
    token:     sessionToken,
    userId:    user!.id,
    expiresAt,
  })

  res.json({
    session_token: sessionToken,
    user_id:       user!.id,
    role:          user!.role,
  })
})

export default router
