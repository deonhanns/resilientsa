import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { cooperatives } from './cooperatives'

export const cooperativeStatusEvents = pgTable('cooperative_status_events', {
  id:             uuid('id').primaryKey().defaultRandom(),
  cooperativeId:  uuid('cooperative_id').notNull().references(() => cooperatives.id),
  status:         text('status').notNull(),
  updatedBy:      uuid('updated_by').notNull(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow(),
  notes:          text('notes'),
}, () => ({ schema: 'coop_pii' }))
