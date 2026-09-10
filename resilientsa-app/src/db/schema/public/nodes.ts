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
  // FK to users.id enforced at the DB level (see migration 0004), not modeled
  // via Drizzle's .references() here — same fix as the users.cellId /
  // cells.stewardUserId precedent (ORDER 004): a Drizzle-level FK reference
  // creates a nodes.ts <-> users.ts circular import that breaks tsc's type
  // inference (TS7022/TS7024, confirmed by build). Plain uuid column instead.
  createdBy:        uuid('created_by'),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
})
