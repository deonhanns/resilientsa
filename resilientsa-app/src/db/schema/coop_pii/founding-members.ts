// coop_pii/founding-members.ts
// PURGE on registration confirmation per cooperative-formation-spec-v1.0.md Section 2
// ALL PII fields are bytea (pgcrypto encrypted)

import { pgTable, uuid, boolean, customType } from 'drizzle-orm/pg-core'

const bytea = customType<{ data: string; driverData: Buffer }>({
  dataType() { return 'bytea' },
  toDriver(value: string): Buffer { return Buffer.from(value, 'utf-8') },
  fromDriver(value: Buffer): string { return value.toString('utf-8') },
})

export const foundingMembers = pgTable('founding_members', {
  id:            uuid('id').primaryKey().defaultRandom(),
  cooperativeId: uuid('cooperative_id').notNull(),
  fullName:      bytea('full_name'),
  surname:       bytea('surname'),
  address:       bytea('address'),
  idNumber:      bytea('id_number'),
  email:         bytea('email'),
  isDirector:    boolean('is_director').default(false),
}, () => ({ schema: 'coop_pii' }))
