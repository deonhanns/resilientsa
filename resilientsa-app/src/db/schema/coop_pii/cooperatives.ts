import { pgTable, uuid, text, date } from 'drizzle-orm/pg-core'
import { nodes } from '../public/nodes'

export const cooperatives = pgTable('cooperatives', {
  id:                       uuid('id').primaryKey().defaultRandom(),
  nodeId:                   uuid('node_id').notNull().references(() => nodes.id),
  cooperativeType:          text('cooperative_type', {
                              enum: ['general','agricultural','social','worker','housing']
                            }).notNull(),
  status:                   text('status', {
                              enum: ['preparing','documents_ready','submitted','name_reserved',
                                     'under_review','registered','returned']
                            }).default('preparing'),
  registrationNumber:       text('registration_number'),
  registeredName:           text('registered_name'),
  formationMeetingDate:     date('formation_meeting_date'),
  constitutionDocumentId:   text('constitution_document_id'),
  coop1DocumentId:          text('coop1_document_id'),
  cr2DocumentId:            text('cr2_document_id'),
}, () => ({ schema: 'coop_pii' }))
