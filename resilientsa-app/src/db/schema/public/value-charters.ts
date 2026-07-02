import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'

export const valueCharters = pgTable('value_charters', {
  id:             uuid('id').primaryKey().defaultRandom(),
  nodeId:         uuid('node_id').notNull().references(() => nodes.id).unique(),
  content:        text('content'),
  ratifiedAt:     timestamp('ratified_at', { withTimezone: true }),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
})
