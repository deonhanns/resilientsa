import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const giftsProfiles = pgTable('gifts_profiles', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull().references(() => users.id).unique(),
  lovesToDo:       text('loves_to_do'),
  naturallyGoodAt: text('naturally_good_at'),
  caresDeeplyAbout: text('cares_deeply_about'),
  freeTextGifts:   text('free_text_gifts'),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
