import { MemberRoleType } from "@/types";

const ROLE_HIERARCHY: Record<MemberRoleType, number> = {
  Owner: 4,
  Admin: 3,
  Moderator: 2,
  Member: 1,
};

export function hasRolePermission(
  userRole: MemberRoleType,
  requiredRole: MemberRoleType
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function getRolesWithPermission(
  minimumRole: MemberRoleType
): MemberRoleType[] {
  const minLevel = ROLE_HIERARCHY[minimumRole];
  return (Object.keys(ROLE_HIERARCHY) as MemberRoleType[]).filter(
    (role) => ROLE_HIERARCHY[role] >= minLevel
  );
}
