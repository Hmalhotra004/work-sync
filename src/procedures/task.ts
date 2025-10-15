import { db } from "@/db";
import { project, task } from "@/db/schema";
import { verifyRole } from "@/lib/serverHelpers";
import {
  createTaskSchema,
  taskGetManySchema,
  taskIdSchema,
} from "@/schemas/task/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, ilike } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  taskProcedure,
} from "@/trpc/init";

export const taskRouter = createTRPCRouter({
  getMany: taskProcedure.input(taskGetManySchema).query(async ({ input }) => {
    const {
      projectIdN: projectId,
      workspaceId,
      assigneeId,
      dueDate,
      search,
      status,
    } = input;

    const tasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.workspaceId, workspaceId),
          projectId ? eq(task.projectId, projectId) : undefined,
          assigneeId ? eq(task.assigneeId, assigneeId) : undefined,
          dueDate ? eq(task.dueDate, dueDate) : undefined,
          status ? eq(task.status, status) : undefined,
          search ? ilike(task.name, `%${search}%`) : undefined
        )
      )
      .orderBy(desc(task.createdAt));

    return tasks;
  }),

  create: protectedProcedure
    .input(createTaskSchema)
    .query(async ({ ctx, input }) => {
      const {
        assigneeId,
        dueDate,
        name,
        projectId,
        status,
        workspaceId,
        description,
      } = input;

      await verifyRole(workspaceId, ctx.auth.user.id, "Moderator");

      const [existingProject] = await db
        .select({})
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
