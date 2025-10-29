import { MemberRoleType } from "@/types";
import { TRPCError } from "@trpc/server";
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

export const verifyRole = (
  userRole: MemberRoleType,
  roleRequired: MemberRoleType
) => {
  if (!hasRolePermission(userRole, roleRequired)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Requires ${roleRequired} role or higher`,
    });
  }
};

export const verifyExactRole = (
  userRole: MemberRoleType,
  roleRequired: MemberRoleType
) => {
  if (userRole !== roleRequired) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `Only ${roleRequired}s can perform this action`,
    });
  }
};
