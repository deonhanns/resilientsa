import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { programmeOfferings } from './programme-offerings'

export const offeringEngagements = pgTable('offering_engagements', {
  id:             uuid('id').primaryKey().defaultRandom(),
  offeringId:     uuid('offering_id').notNull().references(() => programmeOfferings.id),
  nodeId:         uuid('node_id').notNull().references(() => nodes.id),
  status:         text('status', {
                    enum: ['requested','accepted','declined','active','completed']
                  }).default('requested'),
  requestedAt:    timestamp('requested_at', { withTimezone: true }).defaultNow(),
  requestContext: text('request_context'),
  startedAt:      timestamp('started_at', { withTimezone: true }),
  completedAt:    timestamp('completed_at', { withTimezone: true }),
})
