import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const matches = pgTable('matches', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  listingIds:            uuid('listing_ids').array().notNull(),
  status:                text('status', {
                           enum: ['proposed','confirmed','completed','declined']
                         }).default('proposed'),
  facilitatedBySteward:  uuid('facilitated_by_steward').references(() => users.id),
  createdAt:             timestamp('created_at', { withTimezone: true }).defaultNow(),
})
