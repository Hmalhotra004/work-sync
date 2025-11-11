import { db } from "@/db";
import { user } from "@/db/schema";
import { deleteCloudinaryImage } from "@/lib/serverHelpers";
import { updateUserSchema } from "@/schemas/profile/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const profileRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    const [profile] = await db.select().from(user).where(eq(user.id, userId));

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }

    return profile;
  }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name, image } = input;
      const userId = ctx.auth.user.id;

      if (userId !== id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Cannot update another user's profile",
        });
      }

      const [userToUpdate] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, userId));

      if (!userToUpdate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
      }

      const [updatedUser] = await db
        .update(user)
        .set({ name, image })
        .where(eq(user.id, userId))
        .returning();

      return updatedUser;
    }),

  deleteProfileImage: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    const [userToUpdate] = await db
      .select({ id: user.id, image: user.image })
      .from(user)
      .where(eq(user.id, userId));

    if (!userToUpdate) {
      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }

    if (userToUpdate.image) {
      try {
        await deleteCloudinaryImage(userToUpdate.image);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete profile image",
        });
      }
    }

    await db.update(user).set({ image: null }).where(eq(user.id, userId));

    return { success: true };
  }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    const [existingUser] = await db
      .select({ id: user.id, image: user.image })
      .from(user)
      .where(eq(user.id, userId));

    if (!existingUser) {
      throw new TRPCError({ code: "NOT_FOUND", message: "user not found" });
    }

    // remove profile image from cloud storage if present
    if (existingUser.image) {
      try {
        await deleteCloudinaryImage(existingUser.image);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }

    await db.delete(user).where(eq(user.id, userId));

    return { success: true };
  }),
});
