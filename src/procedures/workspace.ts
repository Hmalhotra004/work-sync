import { db } from "@/db";
import { workspace } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { createWorkspaceSchema } from "../schemas";

export const workspaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      const [createdWorkspace] = await db
        .insert(workspace)
        .values({ name, userId: ctx.auth.user.id })
        .returning();

      return createdWorkspace;
    }),
});
