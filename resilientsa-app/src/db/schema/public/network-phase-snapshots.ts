import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { cells } from './cells'

export const networkPhaseSnapshots = pgTable('network_phase_snapshots', {
  id:         uuid('id').primaryKey().defaultRandom(),
  nodeId:     uuid('node_id').notNull().references(() => nodes.id),
  cellId:     uuid('cell_id').references(() => cells.id),
  phase:      text('phase', {
                enum: ['scattered_fragments','hub_and_spoke','multi_hub','core_periphery']
              }).notNull(),
  computedAt: timestamp('computed_at', { withTimezone: true }).defaultNow(),
  metrics:    jsonb('metrics').default({}),
})
