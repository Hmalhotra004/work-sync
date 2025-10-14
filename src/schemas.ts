import { project, workspace } from "@/db/schema";
import z from "zod";

import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const IdSchema = z.object({
  id: z.string().min(1, { error: "ID is required" }),
});

export const memberRoleSchema = z.enum([
  "Owner",
  "Admin",
  "Moderator",
  "Member",
]);

export const createWorkspaceSchema = createInsertSchema(workspace)
  .omit({
    id: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
    inviteCode: true,
  })
  .extend({
    name: z.string().min(1, { error: "Workspace name is required" }),
    image: z.url().optional().nullable(),
  });

export const updateWorkspaceSchema = createUpdateSchema(workspace)
  .omit({
    ownerId: true,
    createdAt: true,
    updatedAt: true,
    inviteCode: true,
  })
  .extend({
    id: z.string().min(1, { error: "id is required" }),
    name: z.string().min(1, { error: "Workspace name is required" }).optional(),
    image: z.url().optional(),
  });

export const createProjectSchema = createInsertSchema(project)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    workspaceId: z.string().min(1, { error: "id is required" }),
    name: z.string().min(1, { error: "Project name is required" }),
    image: z.url().optional().nullable(),
  });

export const updateProjectSchema = createInsertSchema(project)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().min(1, { error: "id is required" }),
    workspaceId: z.string().min(1, { error: "workspaceId is required" }),
    name: z.string().min(1, { error: "Project name is required" }),
    image: z.url().optional().nullable(),
  });
