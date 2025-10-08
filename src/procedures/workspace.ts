import { db } from "@/db";
import { workspace } from "@/db/schema";
import { createWorkspaceSchema } from "@/schemas";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const workspaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image } = input;

      if (
        image &&
        !image.startsWith(
          `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`
        )
      ) {
        throw new Error("Invalid image source");
      }

      const [createdWorkspace] = await db
        .insert(workspace)
        .values({ name, image, userId: ctx.auth.user.id })
        .returning();

      return createdWorkspace;
    }),
});
