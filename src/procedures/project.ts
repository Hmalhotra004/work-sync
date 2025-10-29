import { db } from "@/db";
import { project } from "@/db/schema";
import { isCloudinaryUrl } from "@/lib/isCloudinaryUrl";
import { deleteCloudinaryImage } from "@/lib/serverHelpers";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import {
  createProjectSchema,
  projectNWorkspaceIdSchema,
  updateProjectSchema,
} from "@/schemas/project/schema";

import { hasRolePermission } from "@/lib/roleHierarchy";
import { createTRPCRouter, workspaceProcedure } from "@/trpc/init";

export const projectRouter = createTRPCRouter({
  getMany: workspaceProcedure.query(async ({ input }) => {
    const { workspaceId } = input;

    const projects = await db
      .select()
      .from(project)
      .where(eq(project.workspaceId, workspaceId));

    return projects;
  }),

  getOne: workspaceProcedure
    .input(projectNWorkspaceIdSchema)
    .query(async ({ input }) => {
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

  create: workspaceProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image, workspaceId } = input;

      if (!hasRolePermission(ctx.role, "Admin")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Requires Admin role or higher`,
        });
      }

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

  update: workspaceProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, image, name } = input;

      if (!hasRolePermission(ctx.role, "Admin")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Requires Admin role or higher`,
        });
      }

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
        .where(eq(project.id, id))
        .returning();

      if (!updatedProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return updatedProject;
    }),

  deleteProjectImage: workspaceProcedure
    .input(projectNWorkspaceIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;

      if (!hasRolePermission(ctx.role, "Admin")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Requires Admin role or higher`,
        });
      }

      const [projectToUpdate] = await db
        .select({ image: project.image })
        .from(project)
        .where(eq(project.id, projectId))
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
        .where(eq(project.id, projectId));

      return { success: true };
    }),

  delete: workspaceProcedure
    .input(projectNWorkspaceIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;

      if (!hasRolePermission(ctx.role, "Admin")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Requires Admin role or higher`,
        });
      }

      const [projectToDelete] = await db
        .select({ id: project.id, image: project.image })
        .from(project)
        .where(eq(project.id, projectId))
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

      await db.delete(project).where(eq(project.id, projectId));

      return { success: true };
    }),
});
