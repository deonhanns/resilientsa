CREATE TABLE "cooperative_status_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cooperative_id" uuid NOT NULL,
	"status" text NOT NULL,
	"updated_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "cooperatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"cooperative_type" text NOT NULL,
	"status" text DEFAULT 'preparing',
	"registration_number" text,
	"registered_name" text,
	"formation_meeting_date" date,
	"constitution_document_id" text,
	"coop1_document_id" text,
	"cr2_document_id" text
);
--> statement-breakpoint
CREATE TABLE "founding_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cooperative_id" uuid NOT NULL,
	"full_name" "bytea",
	"surname" "bytea",
	"address" "bytea",
	"id_number" "bytea",
	"email" "bytea",
	"is_director" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "anticipatory_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"cell_id" uuid,
	"pillar_tag" text NOT NULL,
	"internal_forecast_id" uuid,
	"external_signal_id" uuid,
	"convergence" boolean DEFAULT false,
	"confidence" text DEFAULT 'low',
	"surfaced_to" uuid,
	"surfaced_at" timestamp with time zone,
	"acknowledged_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cells" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"name" text NOT NULL,
	"steward_user_id" uuid,
	"steward_companion_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_exchange_reference" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"cell_id" uuid,
	"pillar_tag" text NOT NULL,
	"item_description" text NOT NULL,
	"typical_equivalent" text,
	"sample_size" integer DEFAULT 0,
	"generated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_health_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"conducted_by" uuid NOT NULL,
	"conducted_at" timestamp with time zone DEFAULT now(),
	"health_state_result" text NOT NULL,
	"dimension_notes" jsonb DEFAULT '{}'::jsonb,
	"recommended_pathway" text NOT NULL,
	"next_assessment_due" date,
	"shared_with_community_leadership_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "connection_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"user_a_id" uuid NOT NULL,
	"user_b_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crisis_mode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"activated_by" uuid NOT NULL,
	"activated_at" timestamp with time zone DEFAULT now(),
	"deactivated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "external_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signal_type" text NOT NULL,
	"source" text NOT NULL,
	"affected_region" text,
	"severity" text NOT NULL,
	"reported_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone,
	"logged_by" text DEFAULT 'uhura',
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "gifts_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"loves_to_do" text,
	"naturally_good_at" text,
	"cares_deeply_about" text,
	"free_text_gifts" text,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "gifts_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "grounders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_name" text NOT NULL,
	"contact_email" "bytea",
	"verification_status" text DEFAULT 'applied',
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "internal_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"cell_id" uuid,
	"pillar_tag" text NOT NULL,
	"forecast_type" text NOT NULL,
	"confidence" text DEFAULT 'low',
	"projected_at" timestamp with time zone DEFAULT now(),
	"projected_window_start" timestamp with time zone NOT NULL,
	"projected_window_end" timestamp with time zone NOT NULL,
	"basis" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"cell_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"pillar_tags" text[] NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"photo_url" text,
	"status" text DEFAULT 'open',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_ids" uuid[] NOT NULL,
	"status" text DEFAULT 'proposed',
	"facilitated_by_steward" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "multi_signal_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"signal_ids" uuid[] NOT NULL,
	"convergence_count" integer NOT NULL,
	"layers_represented" text[],
	"severity" text DEFAULT 'watch',
	"generated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "network_phase_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"cell_id" uuid,
	"phase" text NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now(),
	"metrics" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"location_lat" real,
	"location_lng" real,
	"ra_cpf_name" text,
	"health_state" text DEFAULT 'generative',
	"health_state_set_by" uuid,
	"health_state_set_at" timestamp with time zone,
	"health_state_notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"message_type" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now(),
	"delivery_status" text DEFAULT 'sent'
);
--> statement-breakpoint
CREATE TABLE "offering_endorsements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"node_id" uuid NOT NULL,
	"recommend" boolean NOT NULL,
	"note" text,
	"visibility" text DEFAULT 'attributed',
	"submitted_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offering_engagements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offering_id" uuid NOT NULL,
	"node_id" uuid NOT NULL,
	"status" text DEFAULT 'requested',
	"requested_at" timestamp with time zone DEFAULT now(),
	"request_context" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "programme_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grounder_id" uuid NOT NULL,
	"pillar_tags" text[] NOT NULL,
	"name" text NOT NULL,
	"short_description" text,
	"full_description" text,
	"community_requirements" text,
	"typical_duration" text,
	"status" text DEFAULT 'draft',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trade_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"fairness_confirmed_by_each_party" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"flagged" boolean DEFAULT false,
	"flagged_reason" text,
	"completed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"cell_id" uuid,
	"display_name" text NOT NULL,
	"phone_number" "bytea",
	"role" text DEFAULT 'member',
	"invited_by" uuid,
	"preferred_language" text DEFAULT 'en',
	"whatsapp_opted_in" boolean DEFAULT false,
	"whatsapp_number" "bytea",
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "value_charters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"content" text,
	"ratified_at" timestamp with time zone,
	"last_reviewed_at" timestamp with time zone,
	CONSTRAINT "value_charters_node_id_unique" UNIQUE("node_id")
);
--> statement-breakpoint
ALTER TABLE "cooperative_status_events" ADD CONSTRAINT "cooperative_status_events_cooperative_id_cooperatives_id_fk" FOREIGN KEY ("cooperative_id") REFERENCES "public"."cooperatives"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cooperatives" ADD CONSTRAINT "cooperatives_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anticipatory_alerts" ADD CONSTRAINT "anticipatory_alerts_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anticipatory_alerts" ADD CONSTRAINT "anticipatory_alerts_cell_id_cells_id_fk" FOREIGN KEY ("cell_id") REFERENCES "public"."cells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anticipatory_alerts" ADD CONSTRAINT "anticipatory_alerts_internal_forecast_id_internal_forecasts_id_fk" FOREIGN KEY ("internal_forecast_id") REFERENCES "public"."internal_forecasts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anticipatory_alerts" ADD CONSTRAINT "anticipatory_alerts_external_signal_id_external_signals_id_fk" FOREIGN KEY ("external_signal_id") REFERENCES "public"."external_signals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anticipatory_alerts" ADD CONSTRAINT "anticipatory_alerts_surfaced_to_users_id_fk" FOREIGN KEY ("surfaced_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cells" ADD CONSTRAINT "cells_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cells" ADD CONSTRAINT "cells_steward_user_id_users_id_fk" FOREIGN KEY ("steward_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cells" ADD CONSTRAINT "cells_steward_companion_user_id_users_id_fk" FOREIGN KEY ("steward_companion_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_exchange_reference" ADD CONSTRAINT "community_exchange_reference_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_exchange_reference" ADD CONSTRAINT "community_exchange_reference_cell_id_cells_id_fk" FOREIGN KEY ("cell_id") REFERENCES "public"."cells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_health_assessments" ADD CONSTRAINT "community_health_assessments_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_health_assessments" ADD CONSTRAINT "community_health_assessments_conducted_by_users_id_fk" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_events" ADD CONSTRAINT "connection_events_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_events" ADD CONSTRAINT "connection_events_user_a_id_users_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection_events" ADD CONSTRAINT "connection_events_user_b_id_users_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crisis_mode" ADD CONSTRAINT "crisis_mode_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crisis_mode" ADD CONSTRAINT "crisis_mode_activated_by_users_id_fk" FOREIGN KEY ("activated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifts_profiles" ADD CONSTRAINT "gifts_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grounders" ADD CONSTRAINT "grounders_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_forecasts" ADD CONSTRAINT "internal_forecasts_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_forecasts" ADD CONSTRAINT "internal_forecasts_cell_id_cells_id_fk" FOREIGN KEY ("cell_id") REFERENCES "public"."cells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_cell_id_cells_id_fk" FOREIGN KEY ("cell_id") REFERENCES "public"."cells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_facilitated_by_steward_users_id_fk" FOREIGN KEY ("facilitated_by_steward") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_signal_alerts" ADD CONSTRAINT "multi_signal_alerts_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_phase_snapshots" ADD CONSTRAINT "network_phase_snapshots_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_phase_snapshots" ADD CONSTRAINT "network_phase_snapshots_cell_id_cells_id_fk" FOREIGN KEY ("cell_id") REFERENCES "public"."cells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering_endorsements" ADD CONSTRAINT "offering_endorsements_engagement_id_offering_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."offering_engagements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering_endorsements" ADD CONSTRAINT "offering_endorsements_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering_engagements" ADD CONSTRAINT "offering_engagements_offering_id_programme_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."programme_offerings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering_engagements" ADD CONSTRAINT "offering_engagements_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_offerings" ADD CONSTRAINT "programme_offerings_grounder_id_grounders_id_fk" FOREIGN KEY ("grounder_id") REFERENCES "public"."grounders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_completions" ADD CONSTRAINT "trade_completions_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_cell_id_cells_id_fk" FOREIGN KEY ("cell_id") REFERENCES "public"."cells"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "value_charters" ADD CONSTRAINT "value_charters_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;