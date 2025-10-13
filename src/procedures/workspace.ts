import { db } from "@/db";
import { member, workspace } from "@/db/schema";
import { isCloudinaryUrl } from "@/lib/isCloudinaryUrl";
import { deleteCloudinaryImage, verifyAdminRole } from "@/lib/serverHelpers";
import { generateInviteCode } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

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
        inviteCode: workspace.inviteCode,
        userId: workspace.userId,
        role: member.role,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      })
      .from(workspace)
      .innerJoin(member, eq(member.workspaceId, workspace.id))
      .where(eq(member.userId, ctx.auth.user.id))
      .orderBy(workspace.updatedAt);

    return userWorkspaces;
  }),

  getOne: protectedProcedure.input(IdSchema).query(async ({ ctx, input }) => {
    const { id } = input;

    const [userWorkspace] = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        image: workspace.image,
        inviteCode: workspace.inviteCode,
        userId: workspace.userId,
        role: member.role,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      })
      .from(workspace)
      .innerJoin(member, eq(member.workspaceId, workspace.id))
      .where(and(eq(workspace.id, id), eq(member.userId, ctx.auth.user.id)))
      .limit(1);

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
          message: "Invalid image URL",
        });
      }

      // Use transaction for atomicity
      const result = await db.transaction(async (tx) => {
        const [createdWorkspace] = await tx
          .insert(workspace)
          .values({ name, image, userId: ctx.auth.user.id })
          .returning();

        await tx.insert(member).values({
          role: "admin",
          userId: ctx.auth.user.id,
          workspaceId: createdWorkspace.id,
        });

        return createdWorkspace;
      });

      return result;
    }),

  update: protectedProcedure
    .input(updateWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, image, name } = input;

      // Verify admin role
      await verifyAdminRole(id, ctx.auth.user.id);

      if (image && !isCloudinaryUrl(image)) {
        throw new TRPCError({
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Invalid image URL",
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
          message: "Workspace not found",
        });
      }

      return updatedWorkspace;
    }),

  deleteWorkspaceImage: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ ctx, input }) => {
      const [workspaceToUpdate] = await db
        .select({ image: workspace.image, role: member.role })
        .from(workspace)
        .innerJoin(member, eq(member.workspaceId, workspace.id))
        .where(
          and(eq(workspace.id, input.id), eq(member.userId, ctx.auth.user.id))
        )
        .limit(1);

      if (!workspaceToUpdate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (workspaceToUpdate.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update a workspace",
        });
      }

      // Delete image from Cloudinary if exists
      if (workspaceToUpdate.image) {
        try {
          await deleteCloudinaryImage(workspaceToUpdate.image);
        } catch (err) {
          console.error("Failed to delete image from Cloudinary:", err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete image",
          });
        }
      }

      // Update database to remove image reference
      await db
        .update(workspace)
        .set({ image: null })
        .where(eq(workspace.id, input.id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ ctx, input }) => {
      const [workspaceToDelete] = await db
        .select({ id: workspace.id, image: workspace.image, role: member.role })
        .from(workspace)
        .innerJoin(member, eq(member.workspaceId, workspace.id))
        .where(
          and(eq(workspace.id, input.id), eq(member.userId, ctx.auth.user.id))
        )
        .limit(1);

      if (!workspaceToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (workspaceToDelete.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete a workspace",
        });
      }

      // Delete image from Cloudinary if exists (before deleting workspace)
      if (workspaceToDelete.image) {
        try {
          await deleteCloudinaryImage(workspaceToDelete.image);
        } catch (err) {
          console.error("Failed to delete image from Cloudinary:", err);
        }
      }

      await db.delete(workspace).where(eq(workspace.id, workspaceToDelete.id));

      return { success: true };
    }),

  join: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        code: z.string().min(6).max(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { code, id } = input;

      const [workspaceToJoin] = await db
        .select({
          id: workspace.id,
          inviteCode: workspace.inviteCode,
        })
        .from(workspace)
        .where(eq(workspace.id, id))
        .limit(1);

      if (!workspaceToJoin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (workspaceToJoin.inviteCode !== code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid invite code",
        });
      }

      // Check if user is already a member
      const [existingMember] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.userId, ctx.auth.user.id),
            eq(member.workspaceId, workspaceToJoin.id)
          )
        )
        .limit(1);

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already a member of this workspace",
        });
      }

      await db.insert(member).values({
        userId: ctx.auth.user.id,
        workspaceId: workspaceToJoin.id,
        role: "member",
      });

      return { success: true, workspaceId: workspaceToJoin.id };
    }),

  getWorkspaceInfo: protectedProcedure
    .input(IdSchema)
    .query(async ({ input }) => {
      const { id } = input;

      const [workspaceInfo] = await db
        .select({ name: workspace.name })
        .from(workspace)
        .where(eq(workspace.id, id))
        .limit(1);

      if (!workspaceInfo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      return workspaceInfo;
    }),

  resetInviteCode: protectedProcedure
    .input(IdSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Verify admin role
      await verifyAdminRole(id, ctx.auth.user.id);

      const [updatedWorkspace] = await db
        .update(workspace)
        .set({ inviteCode: generateInviteCode(6) })
        .where(eq(workspace.id, id))
        .returning();

      if (!updatedWorkspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      return updatedWorkspace;
    }),
});
