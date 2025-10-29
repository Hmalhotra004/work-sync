import { workspace } from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

export const memberRoleSchema = z.enum([
  "Owner",
  "Admin",
  "Moderator",
  "Member",
]);

export const workspaceIdSchema = z.object({
  workspaceId: z.string().trim().min(1, { error: "WorkspaceId is required" }),
});

export const createWorkspaceSchema = createInsertSchema(workspace)
  .omit({
    id: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
    inviteCode: true,
  })
  .extend({
    name: z.string().trim().min(1, { error: "Workspace name is required" }),
    image: z.url().trim().optional().nullable(),
  });

export const updateWorkspaceSchema = createUpdateSchema(workspace)
  .omit({
    ownerId: true,
    createdAt: true,
    updatedAt: true,
    inviteCode: true,
  })
  .extend({
    id: z.string().trim().min(1, { error: "id is required" }),
    name: z
      .string()
      .trim()
      .min(1, { error: "Workspace name is required" })
      .optional(),
    image: z.url().trim().optional(),
  });
