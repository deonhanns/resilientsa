import { pgTable, uuid, text, boolean, timestamp, customType } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { cells } from './cells'

// bytea custom type for pgcrypto-encrypted PII fields
const bytea = customType<{ data: string; driverData: Buffer }>({
  dataType() { return 'bytea' },
  toDriver(value: string): Buffer { return Buffer.from(value, 'utf-8') },
  fromDriver(value: Buffer): string { return value.toString('utf-8') },
})

export const users = pgTable('users', {
  id:                uuid('id').primaryKey().defaultRandom(),
  nodeId:            uuid('node_id').notNull().references(() => nodes.id),
  cellId:            uuid('cell_id').references(() => cells.id),
  displayName:       text('display_name').notNull(),
  phoneNumber:       bytea('phone_number'),
  role:              text('role', {
                       enum: ['member','cell_steward','node_admin','regional_steward']
                     }).default('member'),
  invitedBy:         uuid('invited_by'),
  preferredLanguage: text('preferred_language').default('en'),
  whatsappOptedIn:   boolean('whatsapp_opted_in').default(false),
  whatsappNumber:    bytea('whatsapp_number'),
  createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow(),
})
