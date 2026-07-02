import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const otpCodes = pgTable('otp_codes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  phoneHash: text('phone_hash').notNull().unique(),
  code:      text('code').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
