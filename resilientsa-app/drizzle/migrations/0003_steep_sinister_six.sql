ALTER TABLE "grounders" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "grounders" ADD CONSTRAINT "grounders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grounders" ADD CONSTRAINT "grounders_user_id_unique" UNIQUE("user_id");