import { db } from "@/db";
import { member } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import "server-only";
import cloudinary from "./cloudinary";

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

export const verifyAdminRole = async (
  workspaceId: string,
  userId: string
): Promise<void> => {
  const [memberRecord] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.workspaceId, workspaceId), eq(member.userId, userId)))
    .limit(1);

  if (!memberRecord) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not a part of workspace",
    });
  }

  if (memberRecord.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can perform this action",
    });
  }
};
