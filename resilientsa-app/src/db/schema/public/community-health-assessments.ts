import { pgTable, uuid, text, timestamp, jsonb, date } from 'drizzle-orm/pg-core'
import { nodes } from './nodes'
import { users } from './users'

export const communityHealthAssessments = pgTable('community_health_assessments', {
  id:                              uuid('id').primaryKey().defaultRandom(),
  nodeId:                          uuid('node_id').notNull().references(() => nodes.id),
  conductedBy:                     uuid('conducted_by').notNull().references(() => users.id),
  conductedAt:                     timestamp('conducted_at', { withTimezone: true }).defaultNow(),
  healthStateResult:               text('health_state_result', {
                                     enum: ['generative','stressed','fragile','collapsed']
                                   }).notNull(),
  dimensionNotes:                  jsonb('dimension_notes').default({}),
  recommendedPathway:              text('recommended_pathway', {
                                     enum: ['standard_onboarding','enhanced_support',
                                            'pre_onboarding','humanitarian_referral']
                                   }).notNull(),
  nextAssessmentDue:               date('next_assessment_due'),
  sharedWithCommunityLeadershipAt: timestamp('shared_with_community_leadership_at', { withTimezone: true }),
})
