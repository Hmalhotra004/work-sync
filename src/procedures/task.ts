import { db } from "@/db";
import { project, task } from "@/db/schema";
import { verifyRole } from "@/lib/serverHelpers";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte, ilike, lte } from "drizzle-orm";

import {
  createTaskSchema,
  taskGetManySchema,
  taskGetOneSchema,
  taskIdSchema,
} from "@/schemas/task/schema";

import {
  createTRPCRouter,
  projectProcedure,
  protectedProcedure,
  taskProcedure,
} from "@/trpc/init";
import { endOfDay, startOfDay } from "date-fns";

export const taskRouter = createTRPCRouter({
  getMany: projectProcedure
    .input(taskGetManySchema)
    .query(async ({ input }) => {
      const {
        projectId,
        workspaceId,
        assigneeId,
        dueDate: date,
        search,
        status,
      } = input;

      const today = new Date();
      const dueDate = date ? new Date(date) : null;

      const conditions = [
        eq(task.workspaceId, workspaceId),
        projectId ? eq(task.projectId, projectId) : undefined,
        assigneeId ? eq(task.assigneeId, assigneeId) : undefined,
        status ? eq(task.status, status) : undefined,
        search ? ilike(task.name, `%${search}%`) : undefined,
        dueDate
          ? and(
              gte(task.dueDate, startOfDay(today)),
              lte(task.dueDate, endOfDay(dueDate))
            )
          : undefined,
      ].filter(Boolean);

      const tasks = await db
        .select()
        .from(task)
        .where(and(...conditions))
        .orderBy(desc(task.createdAt), desc(task.name));

      return tasks;
    }),

  getOne: taskProcedure.input(taskGetOneSchema).query(async ({ input }) => {
    const { projectId, workspaceId, taskId } = input;

    const [existingTask] = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.workspaceId, workspaceId),
          eq(task.projectId, projectId),
          eq(task.id, taskId)
        )
      )
      .limit(1);

    if (!existingTask) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    return existingTask;
  }),

  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        assigneeId,
        dueDate: date,
        name,
        projectId,
        status,
        workspaceId,
        description,
      } = input;

      const dueDate = new Date(date);

      if (isNaN(dueDate.getTime())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Date",
        });
      }

      await verifyRole(workspaceId, ctx.auth.user.id, "Moderator");

      const [existingProject] = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const highestPostionTask = await db
        .select()
        .from(task)
        .where(
          and(
            eq(task.status, status),
            eq(task.projectId, projectId),
            eq(task.workspaceId, workspaceId)
          )
        )
        .orderBy(asc(task.position));

      const newPosition =
        highestPostionTask.length > 0
          ? highestPostionTask[0].position + 1000
          : 1000;

      const [createdTask] = await db
        .insert(task)
        .values({
          name,
          dueDate,
          description,
          status,
          workspaceId,
          projectId,
          assigneeId,
          position: newPosition,
        })
        .returning();

      return createdTask;
    }),

  delete: taskProcedure.input(taskIdSchema).mutation(async ({ ctx, input }) => {
    const { taskId, projectId, workspaceId } = input;

    if (ctx.role === "Member") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `Requires Moderator role or higher`,
      });
    }

    await db
      .delete(task)
      .where(
        and(
          eq(task.id, taskId),
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId)
        )
      );

    return { success: true };
  }),
});
