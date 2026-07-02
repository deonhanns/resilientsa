import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { cells } from './cells'

export const communityExchangeReference = pgTable('community_exchange_reference', {
  id:                uuid('id').primaryKey().defaultRandom(),
  nodeId:            uuid('node_id').notNull().references(() => nodes.id),
  cellId:            uuid('cell_id').references(() => cells.id),
  pillarTag:         text('pillar_tag').notNull(),
  itemDescription:   text('item_description').notNull(),
  typicalEquivalent: text('typical_equivalent'),
  sampleSize:        integer('sample_size').default(0),
  generatedAt:       timestamp('generated_at', { withTimezone: true }).defaultNow(),
})
