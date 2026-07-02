import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { users } from './users'

export const crisisMode = pgTable('crisis_mode', {
  id:           uuid('id').primaryKey().defaultRandom(),
  nodeId:       uuid('node_id').notNull().references(() => nodes.id),
  activatedBy:  uuid('activated_by').notNull().references(() => users.id),
  activatedAt:  timestamp('activated_at', { withTimezone: true }).defaultNow(),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
})
