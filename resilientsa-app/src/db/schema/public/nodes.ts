import { pgTable, uuid, text, real, timestamp } from 'drizzle-orm/pg-core'

export const nodes = pgTable('nodes', {
  id:               uuid('id').primaryKey().defaultRandom(),
  name:             text('name').notNull(),
  locationLat:      real('location_lat'),
  locationLng:      real('location_lng'),
  raCpfName:        text('ra_cpf_name'),
  healthState:      text('health_state', {
                      enum: ['generative','stressed','fragile','collapsed']
                    }).default('generative'),
  healthStateSetBy: uuid('health_state_set_by'),
  healthStateSetAt: timestamp('health_state_set_at', { withTimezone: true }),
  healthStateNotes: text('health_state_notes'),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
})
