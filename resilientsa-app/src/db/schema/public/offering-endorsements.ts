import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { offeringEngagements } from './offering-engagements'

export const offeringEndorsements = pgTable('offering_endorsements', {
  id:           uuid('id').primaryKey().defaultRandom(),
  engagementId: uuid('engagement_id').notNull().references(() => offeringEngagements.id),
  nodeId:       uuid('node_id').notNull().references(() => nodes.id),
  recommend:    boolean('recommend').notNull(),
  note:         text('note'),
  visibility:   text('visibility', {
                  enum: ['attributed','anonymous']
                }).default('attributed'),
  submittedAt:  timestamp('submitted_at', { withTimezone: true }).defaultNow(),
})
