import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { grounders } from './grounders'

export const programmeOfferings = pgTable('programme_offerings', {
  id:                     uuid('id').primaryKey().defaultRandom(),
  grounderId:             uuid('grounder_id').notNull().references(() => grounders.id),
  pillarTags:             text('pillar_tags').array().notNull(),
  name:                   text('name').notNull(),
  shortDescription:       text('short_description'),
  fullDescription:        text('full_description'),
  communityRequirements:  text('community_requirements'),
  typicalDuration:        text('typical_duration'),
  status:                 text('status', {
                            enum: ['draft','active','paused','archived']
                          }).default('draft'),
  createdAt:              timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:              timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
