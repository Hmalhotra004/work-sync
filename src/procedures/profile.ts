import { db } from "@/db";
import { user } from "@/db/schema";
import { deleteCloudinaryImage } from "@/lib/serverHelpers";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const profileRouter = createTRPCRouter({
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
      // if (!extractCloudinaryPublicId(userToUpdate.image)) return;

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
});
