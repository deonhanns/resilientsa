import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users, bytea } from './users'

export const grounders = pgTable('grounders', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  userId:             uuid('user_id').unique().references(() => users.id),
  organisationName:   text('organisation_name').notNull(),
  contactEmail:       bytea('contact_email'),
  verificationStatus: text('verification_status', {
                        enum: ['applied','under_review','verified','rejected']
                      }).default('applied'),
  verifiedBy:         uuid('verified_by').references(() => users.id),
  verifiedAt:         timestamp('verified_at', { withTimezone: true }),
  createdAt:          timestamp('created_at', { withTimezone: true }).defaultNow(),
})
