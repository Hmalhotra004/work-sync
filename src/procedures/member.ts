import { db } from "@/db";
import { member, user, workspace } from "@/db/schema";
import { verifyRole } from "@/lib/serverHelpers";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

export const memberRouter = createTRPCRouter({
  getWorkspaceMembers: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { workspaceId, limit = 50, offset = 0 } = input;

      // Verify user is a member of the workspace
      const [membership] = await db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.workspaceId, workspaceId),
            eq(member.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a member of this workspace",
        });
      }

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(member)
        .where(eq(member.workspaceId, workspaceId));

      // Fetch members with user details
      const members = await db
        .select({
          memberId: member.id,
          userId: member.userId,
          workspaceId: member.workspaceId,
          name: user.name,
          email: user.email,
          image: user.image,
          role: member.role,
          isOwner: sql<boolean>`${workspace.ownerId} = ${member.userId}`,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .innerJoin(workspace, eq(workspace.id, member.workspaceId))
        .where(eq(member.workspaceId, workspaceId))
        .orderBy(member.createdAt)
        .limit(limit)
        .offset(offset);

      return {
        members,
        pagination: {
          total: count,
          limit,
          offset,
          hasMore: offset + limit < count,
        },
      };
    }),

  removeMember: workspaceProcedure
    .input(
      z.object({
        memberId: z.string().trim().min(1, { error: "MemberId is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, memberId } = input;

      verifyRole(ctx.role, "Admin");

      // Prevent removing the workspace owner
      const [workspaceOwner] = await db
        .select({ ownerId: workspace.ownerId })
        .from(workspace)
        .where(eq(workspace.id, workspaceId))
        .limit(1);

      const [memberToRemove] = await db
        .select({ role: member.role, userId: member.userId })
        .from(member)
        .where(eq(member.id, memberId))
        .limit(1);

      if (!memberToRemove) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      if (memberToRemove?.userId === workspaceOwner?.ownerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove workspace owner",
        });
      }

      if (ctx.role === "Admin" && memberToRemove.role === "Admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Cannot remove an Admin",
        });
      }

      if (memberToRemove?.userId === ctx.auth.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove yourself",
        });
      }

      await db
        .delete(member)
        .where(
          and(eq(member.id, memberId), eq(member.workspaceId, workspaceId))
        )
        .returning();

      return { success: true };
    }),
});
