import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { cells } from './cells'
import { users } from './users'
import { internalForecasts } from './internal-forecasts'
import { externalSignals } from './external-signals'

export const anticipatoryAlerts = pgTable('anticipatory_alerts', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  nodeId:             uuid('node_id').notNull().references(() => nodes.id),
  cellId:             uuid('cell_id').references(() => cells.id),
  pillarTag:          text('pillar_tag').notNull(),
  internalForecastId: uuid('internal_forecast_id').references(() => internalForecasts.id),
  externalSignalId:   uuid('external_signal_id').references(() => externalSignals.id),
  convergence:        boolean('convergence').default(false),
  confidence:         text('confidence', {
                        enum: ['low','medium','high']
                      }).default('low'),
  surfacedTo:         uuid('surfaced_to').references(() => users.id),
  surfacedAt:         timestamp('surfaced_at', { withTimezone: true }),
  acknowledgedAt:     timestamp('acknowledged_at', { withTimezone: true }),
})
