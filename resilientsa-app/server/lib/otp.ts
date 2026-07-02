import { db } from '../../src/db/client'
import { otpCodes } from '../../src/db/schema/public/otp-codes'
import { eq, and, gt } from 'drizzle-orm'

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeCode(phoneHash: string, code: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  await db.delete(otpCodes).where(eq(otpCodes.phoneHash, phoneHash))
  await db.insert(otpCodes).values({ phoneHash, code, expiresAt })
}

export async function verifyCode(phoneHash: string, code: string): Promise<boolean> {
  const result = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.phoneHash, phoneHash),
        eq(otpCodes.code, code),
        gt(otpCodes.expiresAt, new Date())
      )
    )
    .limit(1)

  if (result.length === 0) return false

  // Delete immediately — single use
  await db.delete(otpCodes).where(eq(otpCodes.phoneHash, phoneHash))
  return true
}
