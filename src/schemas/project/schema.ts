import { project } from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

export const projectNWorkspaceIdSchema = z.object({
  projectId: z.string().min(1, { error: "Project Id is required" }),
  workspaceId: z.string().min(1, { error: "Project Id is required" }),
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

export const updateProjectSchema = createUpdateSchema(project)
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
