CREATE TYPE "public"."taskStatus" AS ENUM('Backlog', 'Todo', 'In Progress', 'In Review', 'Done');--> statement-breakpoint
CREATE TABLE "task" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "taskStatus" DEFAULT 'Todo' NOT NULL,
	"due_date" timestamp NOT NULL,
	"position" integer,
	"workspace_id" text NOT NULL,
	"project_id" text NOT NULL,
	"assignee_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "position_range_check" CHECK ("task"."position" >=1000 AND "task"."position" <= 1000000)
);
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;