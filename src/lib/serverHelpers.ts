import { db } from "@/db";
import { member } from "@/db/schema";
import { MemberRoleType } from "@/types";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import "server-only";
import cloudinary from "./cloudinary";
import { hasRolePermission } from "./roleHierarchy";

export const extractCloudinaryPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
};

export const deleteCloudinaryImage = async (
  imageUrl: string
): Promise<void> => {
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};

export const verifyRole = async (
  workspaceId: string,
  userId: string,
  role: MemberRoleType
): Promise<void> => {
  const [memberRecord] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.workspaceId, workspaceId), eq(member.userId, userId)))
    .limit(1);

  if (!memberRecord) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not a member of this workspace",
    });
  }

  if (!hasRolePermission(memberRecord.role, role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Requires ${role} role or higher`,
    });
  }
};

export const verifyExactRole = async (
  workspaceId: string,
  userId: string,
  exactRole: MemberRoleType
): Promise<void> => {
  const [memberRecord] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.workspaceId, workspaceId), eq(member.userId, userId)))
    .limit(1);

  if (!memberRecord) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not a member of this workspace",
    });
  }

  if (memberRecord.role !== exactRole) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Only ${exactRole} can perform this action`,
    });
  }
};

export const getUserRole = async (
  workspaceId: string,
  userId: string
): Promise<MemberRoleType> => {
  const [memberRecord] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.workspaceId, workspaceId), eq(member.userId, userId)))
    .limit(1);

  if (!memberRecord) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not a member of this workspace",
    });
  }

  return memberRecord.role;
};
