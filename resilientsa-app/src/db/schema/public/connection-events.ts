import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { users } from './users'

export const connectionEvents = pgTable('connection_events', {
  id:        uuid('id').primaryKey().defaultRandom(),
  nodeId:    uuid('node_id').notNull().references(() => nodes.id),
  userAId:   uuid('user_a_id').notNull().references(() => users.id),
  userBId:   uuid('user_b_id').notNull().references(() => users.id),
  eventType: text('event_type', {
               enum: ['trade_completed','steward_introduction','gift_acknowledgement']
             }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
