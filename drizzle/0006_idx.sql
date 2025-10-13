CREATE INDEX "member_user_id_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "member_workspace_id_idx" ON "member" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_user_id_idx" ON "workspace" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workspace_invite_code_idx" ON "workspace" USING btree ("invite_code");