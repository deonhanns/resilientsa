ALTER TABLE "cells" DROP CONSTRAINT "cells_steward_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cells" DROP CONSTRAINT "cells_steward_companion_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_cell_id_cells_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_hash" text;