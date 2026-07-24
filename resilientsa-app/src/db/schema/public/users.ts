import { pgTable, uuid, text, boolean, timestamp, customType } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'

// bytea custom type — hex-encoded strings for PostgreSQL compatibility.
// pg parameterized queries accept \\x-prefixed hex for bytea columns.
export const bytea = customType<{ data: string; driverData: string }>({
  dataType() { return 'bytea' },
  toDriver(value: string): string {
    // Already hex-encoded with \\x prefix from crypto.encryptPhone
    return value
  },
  fromDriver(value: string): string {
    // pg returns bytea as Buffer → node-postgres converts to hex string
    return value
  },
})

export const users = pgTable('users', {
  id:                uuid('id').primaryKey().defaultRandom(),
  nodeId:            uuid('node_id').notNull().references(() => nodes.id),
  cellId:            uuid('cell_id'),
  displayName:       text('display_name').notNull(),
  phoneHash:         text('phone_hash'),
  phoneNumber:       bytea('phone_number'),
  role:              text('role', {
                       enum: ['member','cell_steward','node_admin','regional_steward','grounder']
                     }).default('member'),
  invitedBy:         uuid('invited_by'),
  preferredLanguage: text('preferred_language').default('en'),
  whatsappOptedIn:   boolean('whatsapp_opted_in').default(false),
  whatsappNumber:    bytea('whatsapp_number'),
  createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow(),
})
