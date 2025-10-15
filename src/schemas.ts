import { project, task, workspace } from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";
import { TaskStatusEnum } from "./types";

export const IdSchema = z.object({
  id: z.string().min(1, { error: "ID is required" }),
});

export const projectNWorkspaceIdSchema = z.object({
  projectId: z.string().min(1, { error: "Project Id is required" }),
  workspaceId: z.string().min(1, { error: "Project Id is required" }),
});

export const memberRoleSchema = z.enum([
  "Owner",
  "Admin",
  "Moderator",
  "Member",
]);

export const taskStatusSchema = z.enum([
  "Backlog",
  "Todo",
  "In Progress",
  "In Review",
  "Done",
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
    status: z.nativeEnum(TaskStatusEnum, { error: "status is required" }),
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
    status: z.nativeEnum(TaskStatusEnum, { error: "status is required" }),
    dueDate: z.date({ error: "Due Date is required" }),
    workspaceId: z.string().min(1, { error: "workspaceId is required" }),
    projectId: z.string().min(1, { error: "projectId is required" }),
    assigneeId: z.string().min(1, { error: "assigneeId is required" }),
  });
