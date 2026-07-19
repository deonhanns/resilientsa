// api/_lib/crypto.ts
// Phone encryption/hashing — identical to server/lib/crypto.ts
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!
const IV_LENGTH = 16

export function hashPhone(phone: string): string {
  return crypto
    .createHmac('sha256', ENCRYPTION_KEY)
    .update(normalisePhone(phone))
    .digest('hex')
}

export function encryptPhone(phone: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(normalisePhone(phone), 'utf8'), cipher.final()])
  const combined = Buffer.concat([iv, encrypted])
  return `\\x${combined.toString('hex')}`
}

export function decryptPhone(hexData: string): string {
  const hex = hexData.startsWith('\\x') ? hexData.slice(2) : hexData
  const data = Buffer.from(hex, 'hex')
  const iv = data.subarray(0, IV_LENGTH)
  const encrypted = data.subarray(IV_LENGTH)
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 10) return `+27${digits.slice(1)}`
  if (digits.startsWith('27') && digits.length === 11) return `+${digits}`
  return phone.startsWith('+') ? phone : `+${digits}`
}
