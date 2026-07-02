import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { users } from './users'

export const cells = pgTable('cells', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  nodeId:                uuid('node_id').notNull().references(() => nodes.id),
  name:                  text('name').notNull(),
  stewardUserId:         uuid('steward_user_id').references(() => users.id),
  stewardCompanionUserId: uuid('steward_companion_user_id').references(() => users.id),
  createdAt:             timestamp('created_at', { withTimezone: true }).defaultNow(),
})
