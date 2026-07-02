import { pgTable, uuid, text, timestamp, customType } from 'drizzle-orm/pg-core'
import { users } from './users'

const bytea = customType<{ data: string; driverData: Buffer }>({
  dataType() { return 'bytea' },
  toDriver(value: string): Buffer { return Buffer.from(value, 'utf-8') },
  fromDriver(value: Buffer): string { return value.toString('utf-8') },
})

export const grounders = pgTable('grounders', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  organisationName:   text('organisation_name').notNull(),
  contactEmail:       bytea('contact_email'),
  verificationStatus: text('verification_status', {
                        enum: ['applied','under_review','verified','rejected']
                      }).default('applied'),
  verifiedBy:         uuid('verified_by').references(() => users.id),
  verifiedAt:         timestamp('verified_at', { withTimezone: true }),
  createdAt:          timestamp('created_at', { withTimezone: true }).defaultNow(),
})
