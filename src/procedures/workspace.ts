import { db } from "@/db";
import { member, workspace } from "@/db/schema";
import cloudinary from "@/lib/cloudinary";
import { isCloudinaryUrl } from "@/lib/isCloudinaryUrl";
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
        inviteCode: workspace.inviteCode,
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
        .select({ image: workspace.image, role: member.role })
        .from(workspace)
        .innerJoin(member, eq(member.workspaceId, workspace.id))
        .where(
          and(
            eq(workspace.id, input.id),
            eq(workspace.userId, ctx.auth.user.id)
          )
        );

      if (!workspaceToDelete)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });

      if (workspaceToDelete.role !== "admin")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admin can update a workspace",
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
        .select({ id: workspace.id, image: workspace.image, role: member.role })
        .from(workspace)
        .innerJoin(member, eq(member.workspaceId, workspace.id))
        .where(
          and(
            eq(workspace.id, input.id),
            eq(workspace.userId, ctx.auth.user.id)
          )
        );

      if (!workspaceToDelete)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });

      if (workspaceToDelete.role !== "admin")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admin can delete a workspace",
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

  join: protectedProcedure
    .input(z.object({ id: z.string(), code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { code, id } = input;

      const [workspaceToJoin] = await db
        .select({
          id: workspace.id,
          inviteCode: workspace.inviteCode,
        })
        .from(workspace)
        .where(eq(workspace.id, id));

      if (!workspaceToJoin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (workspaceToJoin.inviteCode !== code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Invite Link",
        });
      }

      await db
        .insert(member)
        .values({
          userId: ctx.auth.user.id,
          workspaceId: workspaceToJoin.id,
          role: "member",
        })
        .onConflictDoNothing();

      return { success: true };
    }),

  getWorkspaceInfo: protectedProcedure
    .input(IdSchema)
    .query(async ({ input }) => {
      const { id } = input;

      const [workspaceInfo] = await db
        .select({ name: workspace.name })
        .from(workspace)
        .where(eq(workspace.id, id));

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

      const [workspaceToReset] = await db
        .select({
          id: workspace.id,
          inviteCode: workspace.inviteCode,
          role: member.role,
        })
        .from(workspace)
        .innerJoin(member, eq(member.workspaceId, workspace.id))
        .where(
          and(eq(workspace.id, id), eq(workspace.userId, ctx.auth.user.id))
        );

      if (!workspaceToReset) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (workspaceToReset.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can reset code",
        });
      }

      const [updatedWorkspace] = await db
        .update(workspace)
        .set({ inviteCode: generateInviteCode(6) })
        .where(eq(workspace.id, workspaceToReset.id))
        .returning();

      return updatedWorkspace;
    }),
});
