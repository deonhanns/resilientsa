import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { cells } from './cells'
import { users } from './users'

export const listings = pgTable('listings', {
  id:          uuid('id').primaryKey().defaultRandom(),
  nodeId:      uuid('node_id').notNull().references(() => nodes.id),
  cellId:      uuid('cell_id').notNull().references(() => cells.id),
  userId:      uuid('user_id').notNull().references(() => users.id),
  type:        text('type', { enum: ['offer','need'] }).notNull(),
  pillarTags:  text('pillar_tags').array().notNull(),
  title:       text('title').notNull(),
  description: text('description'),
  photoUrl:    text('photo_url'),
  status:      text('status', {
                 enum: ['open','matched','completed','withdrawn']
               }).default('open'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
