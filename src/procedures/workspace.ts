import { db } from "@/db";
import { member, workspace } from "@/db/schema";
import cloudinary from "@/lib/cloudinary";
import { isCloudinaryUrl } from "@/lib/isCloudinaryUrl";
import { createWorkspaceSchema } from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

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

  getOne: protectedProcedure.query(async ({ ctx }) => {
    const [userWorkspaces] = await db
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

  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image } = input;

      if (image && !isCloudinaryUrl(image)) {
        throw new TRPCError({
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Invalid Url",
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

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [workspaceToDelete] = await db
        .select()
        .from(workspace)
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
