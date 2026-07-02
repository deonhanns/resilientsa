import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const notificationLog = pgTable('notification_log', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull().references(() => users.id),
  channel:         text('channel', {
                     enum: ['sms','push','whatsapp']
                   }).notNull(),
  messageType:     text('message_type', {
                     enum: ['trade_match','fairness_prompt','steward_alert','crisis_activation']
                   }).notNull(),
  sentAt:          timestamp('sent_at', { withTimezone: true }).defaultNow(),
  deliveryStatus:  text('delivery_status', {
                     enum: ['sent','delivered','failed']
                   }).default('sent'),
})
