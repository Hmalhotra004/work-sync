import { db } from "@/db";
import { member, project, workspace } from "@/db/schema";
import { auth } from "@/lib/auth";
import { projectIdSchema } from "@/schemas/project/schema";
import { workspaceIdSchema } from "@/schemas/workspace/schema";
import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next({ ctx: { ...ctx, auth: session } });
});

export const workspaceProcedure = protectedProcedure
  .input(workspaceIdSchema)
  .use(async ({ ctx, next, input }) => {
    const { workspaceId } = input;

    const [existingWorkspace] = await db
      .select({ id: workspace.id })
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .limit(1);

    if (!existingWorkspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });
    }

    const [memberRecord] = await db
      .select({ role: member.role })
      .from(member)
      .where(
        and(
          eq(member.workspaceId, workspaceId),
          eq(member.userId, ctx.auth.user.id)
        )
      )
      .limit(1);

    if (!memberRecord) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not a member of this workspace",
      });
    }

    return next({ ctx: { ...ctx, role: memberRecord.role } });
  });

export const projectProcedure = workspaceProcedure
  .input(projectIdSchema)
  .use(async ({ next, input }) => {
    const { projectId, workspaceId } = input;

    const [existingProject] = await db
      .select({ id: project.id })
      .from(project)
      .where(
        and(eq(project.id, projectId), eq(project.workspaceId, workspaceId))
      )
      .limit(1);

    if (!existingProject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    return next();
  });
