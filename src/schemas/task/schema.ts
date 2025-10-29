import { task } from "@/db/schema";
import z from "zod";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const taskStatusSchema = z.enum(
  ["Backlog", "Todo", "In Progress", "In Review", "Done"],
  { error: "Status is required" }
);

export const taskIdSchema = z.object({
  taskId: z.string().trim().min(1, { error: "TaskId is required" }),
});

export const taskGetManySchema = z.object({
  search: z.string().trim().optional(),
  dueDate: z.date().optional(),
  status: z
    .enum(["Backlog", "Todo", "In Progress", "In Review", "Done"])
    .optional(),
  assigneeId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
});

export const taskGetOneSchema = z.object({
  taskId: z.string().trim().min(1, { error: "TaskId is requried" }),
});

export const createTaskSchema = createInsertSchema(task)
  .omit({
    id: true,
    position: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: z.string().trim().min(1, { error: "Task name is required" }),
    description: z.string().trim().optional(),
    status: taskStatusSchema,
    dueDate: z.string().trim().min(1, { error: "Due Date is required" }),
    workspaceId: z.string().trim().min(1, { error: "workspaceId is required" }),
    projectId: z.string().trim().min(1, { error: "projectId is required" }),
    assigneeId: z.string().trim().min(1, { error: "assigneeId is required" }),
  });

export const updateTaskSchema = createUpdateSchema(task)
  .omit({
    position: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().trim().min(1, { error: "id is required" }),
    name: z.string().trim().min(1, { error: "Project name is required" }),
    description: z.string().trim().optional(),
    status: taskStatusSchema,
    dueDate: z.date({ error: "Due Date is required" }),
    workspaceId: z.string().trim().min(1, { error: "workspaceId is required" }),
    projectId: z.string().trim().min(1, { error: "projectId is required" }),
    assigneeId: z.string().trim().min(1, { error: "assigneeId is required" }),
  });

export const taskSelectSchema = createSelectSchema(task);
