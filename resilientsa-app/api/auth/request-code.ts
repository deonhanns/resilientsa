// api/auth/request-code.ts
// Vercel serverless function — POST /api/auth/request-code
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateCode, storeCode } from '../_lib/otp'
import { hashPhone, normalisePhone } from '../_lib/crypto'
import { sms } from '../_lib/at'

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
}
