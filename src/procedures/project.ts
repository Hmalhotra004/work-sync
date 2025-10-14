import { db } from "@/db";
import { project } from "@/db/schema";
import { isCloudinaryUrl } from "@/lib/isCloudinaryUrl";
import { verifyRole } from "@/lib/serverHelpers";
import { createProjectSchema } from "@/schemas";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  projectProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { eq } from "drizzle-orm";

export const projectRouter = createTRPCRouter({
  getMany: projectProcedure.query(async ({ input }) => {
    const { workspaceId } = input;

    const projects = await db
      .select()
      .from(project)
      .where(eq(project.workspaceId, workspaceId));

    return projects;
  }),

  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, image, workspaceId } = input;

      await verifyRole(workspaceId, ctx.auth.user.id, "Admin");

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
});
