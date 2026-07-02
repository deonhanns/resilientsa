import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'

export const multiSignalAlerts = pgTable('multi_signal_alerts', {
  id:                uuid('id').primaryKey().defaultRandom(),
  nodeId:            uuid('node_id').notNull().references(() => nodes.id),
  signalIds:         uuid('signal_ids').array().notNull(),
  convergenceCount:  integer('convergence_count').notNull(),
  layersRepresented: text('layers_represented').array(),
  severity:          text('severity', { enum: ['watch','warning'] }).default('watch'),
  generatedAt:       timestamp('generated_at', { withTimezone: true }).defaultNow(),
})
