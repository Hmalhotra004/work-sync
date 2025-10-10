import { workspace } from "@/db/schema";
import z from "zod";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const IdSchema = z.object({
  id: z.string().min(1, { error: "ID is required" }),
});

export const createWorkspaceSchema = createInsertSchema(workspace)
  .omit({
    id: true,
    userId: true,
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
    userId: true,
    createdAt: true,
    updatedAt: true,
    inviteCode: true,
  })
  .extend({
    id: z.string().min(1, { error: "id is required" }),
    name: z.string().min(1, { error: "Workspace name is required" }).optional(),
    image: z.url().optional(),
  });

export const selectWorkspaceSchema = createSelectSchema(workspace);
