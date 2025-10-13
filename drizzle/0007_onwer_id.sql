ALTER TABLE "workspace" RENAME COLUMN "user_id" TO "owner_id";--> statement-breakpoint
ALTER TABLE "workspace" DROP CONSTRAINT "workspace_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'Member'::text;--> statement-breakpoint
DROP TYPE "public"."memberRole";--> statement-breakpoint
CREATE TYPE "public"."memberRole" AS ENUM('Owner', 'Admin', 'Moderator', 'Member');--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'Member'::"public"."memberRole";--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DATA TYPE "public"."memberRole" USING "role"::"public"."memberRole";--> statement-breakpoint
DROP INDEX "workspace_user_id_idx";--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workspace_user_id_idx" ON "workspace" USING btree ("owner_id");