import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const sessionTokens = pgTable('session_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  token:     text('token').notNull().unique(),
  userId:    uuid('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
