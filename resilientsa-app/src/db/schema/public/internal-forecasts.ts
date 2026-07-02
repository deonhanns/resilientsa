import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { cells } from './cells'

export const internalForecasts = pgTable('internal_forecasts', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  nodeId:                uuid('node_id').notNull().references(() => nodes.id),
  cellId:                uuid('cell_id').references(() => cells.id),
  pillarTag:             text('pillar_tag').notNull(),
  forecastType:          text('forecast_type', {
                           enum: ['depletion_trend','isolation_trend','needs_radar_trajectory']
                         }).notNull(),
  confidence:            text('confidence', {
                           enum: ['low','medium','high']
                         }).default('low'),
  projectedAt:           timestamp('projected_at', { withTimezone: true }).defaultNow(),
  projectedWindowStart:  timestamp('projected_window_start', { withTimezone: true }).notNull(),
  projectedWindowEnd:    timestamp('projected_window_end', { withTimezone: true }).notNull(),
  basis:                 jsonb('basis').default({}),
})
