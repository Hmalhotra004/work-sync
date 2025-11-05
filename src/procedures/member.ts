import { db } from "@/db";
import { member, user, workspace } from "@/db/schema";
import { verifyRole } from "@/lib/serverHelpers";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { memberRoleSchema } from "@/schemas/workspace/schema";
import { createTRPCRouter, workspaceProcedure } from "@/trpc/init";
import { MemberRoleType } from "@/types";

export const memberRouter = createTRPCRouter({
  getWorkspaceMembers: workspaceProcedure.query(async ({ ctx, input }) => {
    const { workspaceId } = input;

    const members = await db
      .select({
        memberId: member.id,
        userId: member.userId,
        workspaceId: member.workspaceId,
        name: user.name,
        email: user.email,
        image: user.image,
        role: member.role,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .innerJoin(workspace, eq(workspace.id, member.workspaceId))
      .where(eq(member.workspaceId, workspaceId))
      .orderBy(member.createdAt);

    return {
      members,
      autheticatedUser: { id: ctx.auth.user.id, role: ctx.role },
    };
  }),

  updateRole: workspaceProcedure
    .input(
      z.object({
        memberId: z.string().trim().min(1, { error: "MemberId is required" }),
        userId: z.string().trim().min(1, { error: "UserId is required" }),
        previousRole: memberRoleSchema,
        role: memberRoleSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { memberId, role, previousRole, workspaceId, userId } = input;

      const actingRole = ctx.role;

      if (previousRole === role) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Member already has this role.",
        });
      }

      if (role === "Owner") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Workspace can have only one Owner",
        });
      }

      // 1️⃣ Owner — can do anything
      if (actingRole === "Owner") {
        // proceed
      }
      // 2️⃣ Admin — limited management
      else if (actingRole === "Admin") {
        // Cannot touch Owner or other Admins
        if (previousRole === "Owner" || previousRole === "Admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admins cannot manage other Admins or the Owner.",
          });
        }

        // Admin can promote/demote only Mods & Members
        const allowedTransitions: Record<MemberRoleType, MemberRoleType[]> = {
          Member: ["Moderator"], // Promote Member → Moderator
          Moderator: ["Member", "Admin"], // Promote to Admin or Demote to Member
          Admin: [], // handled above
          Owner: [], // handled above
        };

        const validNextRoles = allowedTransitions[previousRole];
        if (!validNextRoles.includes(role)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Admins can only promote/demote within hierarchy.`,
          });
        }
      }
      // 3️⃣ Mods & Members — no permission
      else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to change roles.",
        });
      }

      // --- Perform DB update ---
      const [updatedMember] = await db
        .update(member)
        .set({ role })
        .where(
          and(
            eq(member.id, memberId),
            eq(member.userId, userId),
            eq(member.workspaceId, workspaceId)
          )
        )
        .returning();

      if (!updatedMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found or update failed.",
        });
      }

      return updatedMember;
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
