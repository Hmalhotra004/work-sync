import { workspace } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const createWorkspaceSchema = createInsertSchema(workspace)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: z.string().min(1, { error: "Workspace name is required" }),
    image: z.url().optional(),
  });

export const selectWorkspaceSchema = createSelectSchema(workspace);
