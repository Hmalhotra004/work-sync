import { db } from "@/db";
import { project, task, user } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { endOfDay, startOfDay } from "date-fns";
import { and, asc, desc, eq, gte, ilike, lte } from "drizzle-orm";

import {
  createTaskSchema,
  taskGetManySchema,
  updateKanbanSchema,
  updateTaskSchema,
} from "@/schemas/task/schema";

import { verifyRole } from "@/lib/serverHelpers";
import {
  createTRPCRouter,
  projectProcedure,
  taskProcedure,
  workspaceProcedure,
} from "@/trpc/init";

export const taskRouter = createTRPCRouter({
  getMany: workspaceProcedure
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
        .select({
          id: task.id,
          name: task.name,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          position: task.position,
          workspaceId: task.workspaceId,

          // project details
          projectId: project.id,
          projectName: project.name,
          projectImage: project.image,

          // assignee details
          assigneeId: user.id,
          assigneeName: user.name,
          assigneeImage: user.image,
        })
        .from(task)
        .leftJoin(project, eq(task.projectId, project.id))
        .leftJoin(user, eq(task.assigneeId, user.id))
        .where(and(...conditions))
        .orderBy(asc(task.name), desc(task.createdAt));

      return tasks;
    }),

  getOne: taskProcedure.query(async ({ input }) => {
    const { projectId, workspaceId, taskId } = input;

    const [existingTask] = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.id, taskId),
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId)
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

  create: projectProcedure
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

      verifyRole(ctx.role, "Moderator");

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
        .orderBy(desc(task.position));

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

  update: taskProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        name,
        description,
        dueDate: date,
        status,
        workspaceId,
        projectId,
        assigneeId,
      } = input;

      verifyRole(ctx.role, "Moderator");

      const dueDate = new Date(date);

      if (isNaN(dueDate.getTime())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Date",
        });
      }

      const [existingTask] = await db
        .select()
        .from(task)
        .where(
          and(
            eq(task.id, id),
            eq(task.projectId, projectId),
            eq(task.workspaceId, workspaceId)
          )
        )
        .limit(1);

      if (existingTask.status === status) {
        const [updatedTask] = await db
          .update(task)
          .set({
            name,
            description,
            assigneeId,
            dueDate,
            status,
          })
          .where(
            and(
              eq(task.id, id),
              eq(task.projectId, projectId),
              eq(task.workspaceId, workspaceId)
            )
          )
          .returning();

        return updatedTask;
      } else {
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
          .orderBy(desc(task.position));

        const newPosition =
          highestPostionTask.length > 0
            ? highestPostionTask[0].position + 1000
            : 1000;

        const [updatedTask] = await db
          .update(task)
          .set({
            name,
            description,
            assigneeId,
            dueDate,
            status,
            position: newPosition,
          })
          .where(
            and(
              eq(task.id, id),
              eq(task.projectId, projectId),
              eq(task.workspaceId, workspaceId)
            )
          )
          .returning();

        return updatedTask;
      }
    }),

  updateKanban: projectProcedure
    .input(updateKanbanSchema)
    .mutation(async ({ input }) => {
      const { tasks, projectId, workspaceId } = input;

      const updatedTasks = await db.transaction(async (tx) => {
        const results = [];

        for (const t of tasks) {
          const [existingTask] = await tx
            .select({ id: task.id })
            .from(task)
            .where(
              and(
                eq(task.id, t.id),
                eq(task.projectId, projectId),
                eq(task.workspaceId, workspaceId)
              )
            )
            .limit(1);

          if (!existingTask) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Task not found`,
            });
          }

          await tx
            .update(task)
            .set({
              status: t.status,
              position: t.position,
            })
            .where(eq(task.id, t.id));

          results.push({
            id: t.id,
            status: t.status,
            position: t.position,
          });
        }

        return results;
      });

      return { success: true, updatedTasks };
    }),

  delete: taskProcedure.mutation(async ({ ctx, input }) => {
    const { taskId, projectId, workspaceId } = input;

    verifyRole(ctx.role, "Moderator");

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
