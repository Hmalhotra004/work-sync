import { db } from "@/db";
import { member, user, workspace } from "@/db/schema";
import { verifyRole } from "@/lib/serverHelpers";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
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

  // updateMemberRole: protectedProcedure
  //   .input(
  //     z.object({
  //       workspaceId: z.string(),
  //       memberId: z.string(),
  //       role: z.enum(["admin", "mod", "member"]),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { workspaceId, memberId, role } = input;

  //     // Verify requester is admin
  //     await verifyAdminRole(workspaceId, ctx.auth.user.id);

  //     // Prevent demoting the workspace owner
  //     const [workspaceOwner] = await db
  //       .select({ userId: workspace.userId })
  //       .from(workspace)
  //       .where(eq(workspace.id, workspaceId))
  //       .limit(1);

  //     const [memberToUpdate] = await db
  //       .select({ userId: member.userId })
  //       .from(member)
  //       .where(eq(member.id, memberId))
  //       .limit(1);

  //     if (memberToUpdate?.userId === workspaceOwner?.userId) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Cannot change workspace owner role",
  //       });
  //     }

  //     const [updatedMember] = await db
  //       .update(member)
  //       .set({ role })
  //       .where(
  //         and(eq(member.id, memberId), eq(member.workspaceId, workspaceId))
  //       )
  //       .returning();

  //     if (!updatedMember) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Member not found",
  //       });
  //     }

  //     return updatedMember;
  //   }),

  removeMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        memberId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, memberId } = input;

      // Verify requester is admin
      await verifyRole(workspaceId, ctx.auth.user.id, "Admin");

      // Prevent removing the workspace owner
      const [workspaceOwner] = await db
        .select({ ownerId: workspace.ownerId })
        .from(workspace)
        .where(eq(workspace.id, workspaceId))
        .limit(1);

      const [memberToRemove] = await db
        .select({ userId: member.userId })
        .from(member)
        .where(eq(member.id, memberId))
        .limit(1);

      if (memberToRemove?.userId === workspaceOwner?.ownerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove workspace owner",
        });
      }

      if (memberToRemove?.userId === ctx.auth.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove yourself",
        });
      }

      const result = await db
        .delete(member)
        .where(
          and(eq(member.id, memberId), eq(member.workspaceId, workspaceId))
        )
        .returning();

      if (!result.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return { success: true };
    }),
});
