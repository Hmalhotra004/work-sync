import { db } from "@/db";
import { workspace } from "@/db/schema";
import cloudinary from "@/lib/cloudinary";
import { isCloudinaryUrl } from "@/lib/isCloudinaryUrl";
import { createWorkspaceSchema } from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const workspaceRouter = createTRPCRouter({
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
