import { db } from "@/db";
import { member, workspace } from "@/db/schema";
import cloudinary from "@/lib/cloudinary";
import { isCloudinaryUrl } from "@/lib/isCloudinaryUrl";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import {
  createWorkspaceSchema,
  IdSchema,
  updateWorkspaceSchema,
} from "@/schemas";

export const workspaceRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        image: workspace.image,
        userId: workspace.userId,
        role: member.role,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      })
      .from(workspace)
      .innerJoin(member, eq(member.workspaceId, workspace.id))
      .where(eq(member.userId, ctx.auth.user.id));

    return userWorkspaces;
  }),

  getOne: protectedProcedure.input(IdSchema).query(async ({ ctx, input }) => {
    const { id } = input;

    const [userWorkspace] = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        image: workspace.image,
        userId: workspace.userId,
        role: member.role,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      })
      .from(workspace)
      .innerJoin(member, eq(member.workspaceId, workspace.id))
      .where(and(eq(workspace.id, id), eq(member.userId, ctx.auth.user.id)));

    if (!userWorkspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });
    }

    return userWorkspace;
  }),

  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image } = input;

      if (image && !isCloudinaryUrl(image)) {
        throw new TRPCError({
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Invalid Image",
        });
      }

      const [createdWorkspace] = await db
        .insert(workspace)
        .values({ name, image, userId: ctx.auth.user.id })
        .returning();

      await db.insert(member).values({
        role: "admin",
        userId: ctx.auth.user.id,
        workspaceId: createdWorkspace.id,
      });

      return createdWorkspace;
    }),

  update: protectedProcedure
    .input(updateWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, image, name } = input;

      const [memberRecord] = await db
        .select()
        .from(member)
        .where(
          and(eq(member.workspaceId, id), eq(member.userId, ctx.auth.user.id))
        )
        .limit(1);

      if (!memberRecord || memberRecord.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update this workspace.",
        });
      }

      const [updatedWorkspace] = await db
        .update(workspace)
        .set({
          name,
          image: image ?? null,
        })
        .where(eq(workspace.id, id))
        .returning();

      if (!updatedWorkspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found.",
        });
      }

      return updatedWorkspace;
    }),

  deleteWorkspaceImage: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ ctx, input }) => {
      const [workspaceToDelete] = await db
        .select({ image: workspace.image })
        .from(workspace)
        .innerJoin(member, eq(member.workspaceId, workspace.id))
        .where(
          and(
            eq(workspace.id, input.id),
            eq(workspace.userId, ctx.auth.user.id),
            eq(member.role, "admin")
          )
        );

      if (!workspaceToDelete)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });

      //  Delete image from Cloudinary if exists
      if (workspaceToDelete.image) {
        try {
          // Extract Cloudinary public_id from URL
          const match = workspaceToDelete.image.match(
            /\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/
          );
          const publicId = match ? match[1] : null;

          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (err) {
          console.error("Failed to delete image from Cloudinary:", err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }
      }

      return { success: true };
    }),

  delete: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ ctx, input }) => {
      const [workspaceToDelete] = await db
        .select({ id: workspace.id, image: workspace.image })
        .from(workspace)
        .innerJoin(member, eq(member.workspaceId, workspace.id))
        .where(
          and(
            eq(workspace.id, input.id),
            eq(workspace.userId, ctx.auth.user.id),
            eq(member.role, "admin")
          )
        );

      if (!workspaceToDelete)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });

      //  Delete image from Cloudinary if exists
      if (workspaceToDelete.image) {
        try {
          // Extract Cloudinary public_id from URL
          const match = workspaceToDelete.image.match(
            /\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/
          );
          const publicId = match ? match[1] : null;

          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (err) {
          console.error("Failed to delete image from Cloudinary:", err);
        }
      }

      await db.delete(workspace).where(eq(workspace.id, workspaceToDelete.id));

      return { success: true };
    }),
});
