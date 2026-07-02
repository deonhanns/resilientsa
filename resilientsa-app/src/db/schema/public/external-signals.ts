import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const externalSignals = pgTable('external_signals', {
  id:             uuid('id').primaryKey().defaultRandom(),
  signalType:     text('signal_type', {
                    enum: ['load_shedding_escalation','weather_warning',
                           'water_disruption_notice','unrest_signal','health_outbreak_notice']
                  }).notNull(),
  source:         text('source').notNull(),
  affectedRegion: text('affected_region'),
  severity:       text('severity', { enum: ['watch','warning','severe'] }).notNull(),
  reportedAt:     timestamp('reported_at', { withTimezone: true }).defaultNow(),
  expiresAt:      timestamp('expires_at', { withTimezone: true }),
  loggedBy:       text('logged_by').default('uhura'),
  notes:          text('notes'),
})
