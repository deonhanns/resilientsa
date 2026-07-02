import { pgTable, uuid, boolean, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { matches } from './matches'

export const tradeCompletions = pgTable('trade_completions', {
  id:                         uuid('id').primaryKey().defaultRandom(),
  matchId:                    uuid('match_id').notNull().references(() => matches.id),
  fairnessConfirmedByEachParty: jsonb('fairness_confirmed_by_each_party').notNull().default({}),
  flagged:                    boolean('flagged').default(false),
  flaggedReason:              text('flagged_reason'),
  completedAt:                timestamp('completed_at', { withTimezone: true }).defaultNow(),
})
