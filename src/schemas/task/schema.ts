import { task } from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

export const taskStatusSchema = z.enum(
  ["Backlog", "Todo", "In Progress", "In Review", "Done"],
  { error: "Status is required" }
);

export const createTaskSchema = createInsertSchema(task)
  .omit({
    id: true,
    position: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: z.string().min(1, { error: "Project name is required" }),
    description: z.string().optional(),
    status: taskStatusSchema,
    dueDate: z.date({ error: "Due Date is required" }),
    workspaceId: z.string().min(1, { error: "workspaceId is required" }),
    projectId: z.string().min(1, { error: "projectId is required" }),
    assigneeId: z.string().min(1, { error: "assigneeId is required" }),
  });

export const updateTaskSchema = createUpdateSchema(task)
  .omit({
    position: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().min(1, { error: "id is required" }),
    name: z.string().min(1, { error: "Project name is required" }),
    description: z.string().optional(),
    status: taskStatusSchema,
    dueDate: z.date({ error: "Due Date is required" }),
    workspaceId: z.string().min(1, { error: "workspaceId is required" }),
    projectId: z.string().min(1, { error: "projectId is required" }),
    assigneeId: z.string().min(1, { error: "assigneeId is required" }),
  });
