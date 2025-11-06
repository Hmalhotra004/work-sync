import { db } from "@/db";
import { project, task } from "@/db/schema";
import { isCloudinaryUrl } from "@/lib/isCloudinaryUrl";
import { deleteCloudinaryImage, verifyRole } from "@/lib/serverHelpers";
import { TRPCError } from "@trpc/server";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { and, eq, gte, lt, lte, ne } from "drizzle-orm";

import {
  createProjectSchema,
  updateProjectSchema,
} from "@/schemas/project/schema";

import {
  createTRPCRouter,
  projectProcedure,
  workspaceProcedure,
} from "@/trpc/init";

export const projectRouter = createTRPCRouter({
  getMany: workspaceProcedure.query(async ({ ctx, input }) => {
    const { workspaceId } = input;

    const projects = await db
      .select()
      .from(project)
      .where(eq(project.workspaceId, workspaceId));

    return { projects, role: ctx.role };
  }),

  getOne: projectProcedure.query(async ({ input }) => {
    const { projectId, workspaceId } = input;

    const [existingProject] = await db
      .select()
      .from(project)
      .where(
        and(eq(project.id, projectId), eq(project.workspaceId, workspaceId))
      )
      .limit(1);

    return existingProject;
  }),

  analytics: projectProcedure.query(async ({ ctx, input }) => {
    const { projectId, workspaceId } = input;

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          gte(task.createdAt, thisMonthStart),
          lte(task.createdAt, thisMonthEnd)
        )
      );

    const lastMonthTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          gte(task.createdAt, lastMonthStart),
          lte(task.createdAt, lastMonthEnd)
        )
      );

    const taskCount = thisMonthTasks.length;
    const taskDifference = taskCount - lastMonthTasks.length;

    const thisMonthAssignedTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          eq(task.assigneeId, ctx.auth.user.id),
          gte(task.createdAt, thisMonthStart),
          lte(task.createdAt, thisMonthEnd)
        )
      );

    const lastMonthAssignedTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          eq(task.assigneeId, ctx.auth.user.id),
          gte(task.createdAt, lastMonthStart),
          lte(task.createdAt, lastMonthEnd)
        )
      );

    const assignedTaskCount = thisMonthAssignedTasks.length;
    const assignedTaskDifference =
      assignedTaskCount - lastMonthAssignedTasks.length;

    const thisMonthIncompleteTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          ne(task.status, "Done"),
          gte(task.createdAt, thisMonthStart),
          lte(task.createdAt, thisMonthEnd)
        )
      );

    const lastMonthIncompleteTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          ne(task.status, "Done"),
          gte(task.createdAt, lastMonthStart),
          lte(task.createdAt, lastMonthEnd)
        )
      );

    const incompleteTaskCount = thisMonthIncompleteTasks.length;
    const incompleteTaskDifference =
      incompleteTaskCount - lastMonthIncompleteTasks.length;

    const thisMonthCompletedTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          eq(task.status, "Done"),
          gte(task.createdAt, thisMonthStart),
          lte(task.createdAt, thisMonthEnd)
        )
      );

    const lastMonthCompletedTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          eq(task.status, "Done"),
          gte(task.createdAt, lastMonthStart),
          lte(task.createdAt, lastMonthEnd)
        )
      );

    const completedTaskCount = thisMonthCompletedTasks.length;
    const completedTaskDifference =
      completedTaskCount - lastMonthCompletedTasks.length;

    const thisMonthOverdueTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          ne(task.status, "Done"),
          lt(task.dueDate, now),
          gte(task.createdAt, thisMonthStart),
          lte(task.createdAt, thisMonthEnd)
        )
      );

    const lastMonthOverdueTasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.projectId, projectId),
          eq(task.workspaceId, workspaceId),
          ne(task.status, "Done"),
          lt(task.dueDate, now),
          gte(task.createdAt, lastMonthStart),
          lte(task.createdAt, lastMonthEnd)
        )
      );

    const overdueTaskCount = thisMonthOverdueTasks.length;
    const overdueTaskDifference =
      overdueTaskCount - lastMonthOverdueTasks.length;

    return {
      taskCount,
      taskDifference,
      assignedTaskCount,
      assignedTaskDifference,
      completedTaskCount,
      completedTaskDifference,
      incompleteTaskCount,
      incompleteTaskDifference,
      overdueTaskCount,
      overdueTaskDifference,
    };
  }),

  create: workspaceProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image, workspaceId } = input;

      verifyRole(ctx.role, "Admin");

      if (image && !isCloudinaryUrl(image)) {
        throw new TRPCError({
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Invalid image URL",
        });
      }

      const [createdProject] = await db
        .insert(project)
        .values({ name, image, workspaceId })
        .returning();

      return createdProject;
    }),

  update: projectProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, image, name, workspaceId } = input;

      verifyRole(ctx.role, "Admin");

      if (image && !isCloudinaryUrl(image)) {
        throw new TRPCError({
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Invalid image URL",
        });
      }

      const [updatedProject] = await db
        .update(project)
        .set({
          name,
          image: image ?? null,
        })
        .where(and(eq(project.id, id), eq(project.workspaceId, workspaceId)))
        .returning();

      if (!updatedProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return updatedProject;
    }),

  deleteProjectImage: projectProcedure.mutation(async ({ ctx, input }) => {
    const { projectId, workspaceId } = input;

    verifyRole(ctx.role, "Admin");

    const [projectToUpdate] = await db
      .select({ image: project.image })
      .from(project)
      .where(
        and(eq(project.id, projectId), eq(project.workspaceId, workspaceId))
      )
      .limit(1);

    if (!projectToUpdate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Delete image from Cloudinary if exists
    if (projectToUpdate.image) {
      try {
        await deleteCloudinaryImage(projectToUpdate.image);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete Workspace",
        });
      }
    }

    // Update database to remove image reference
    await db
      .update(project)
      .set({ image: null })
      .where(
        and(eq(project.id, projectId), eq(project.workspaceId, workspaceId))
      );

    return { success: true };
  }),

  delete: projectProcedure.mutation(async ({ ctx, input }) => {
    const { projectId, workspaceId } = input;

    verifyRole(ctx.role, "Admin");

    const [projectToDelete] = await db
      .select({ id: project.id, image: project.image })
      .from(project)
      .where(
        and(eq(project.id, projectId), eq(project.workspaceId, workspaceId))
      )
      .limit(1);

    if (!projectToDelete) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });
    }

    // Delete image from Cloudinary if exists (before deleting workspace)
    if (projectToDelete.image) {
      try {
        await deleteCloudinaryImage(projectToDelete.image);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete Workspace",
        });
      }
    }

    await db
      .delete(project)
      .where(
        and(eq(project.id, projectId), eq(project.workspaceId, workspaceId))
      );

    return { success: true };
  }),
});
