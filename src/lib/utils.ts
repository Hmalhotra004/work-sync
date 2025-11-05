import { MemberRoleType, TaskStatusEnum } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateInviteCode(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function canManage(
  userRole: MemberRoleType,
  targetRole: MemberRoleType
): boolean {
  if (userRole === "Owner") {
    return targetRole !== "Owner";
  }

  if (userRole === "Admin") {
    return targetRole === "Moderator" || targetRole === "Member";
  }

  return false;
}

export const TASKSTATUSMAP = [
  {
    value: TaskStatusEnum.Backlog,
    label: "Backlog",
  },
  {
    value: TaskStatusEnum.Todo,
    label: "Todo",
  },
  {
    value: TaskStatusEnum.In_Progress,
    label: "In Progress",
  },
  {
    value: TaskStatusEnum.In_Review,
    label: "In Review",
  },
  {
    value: TaskStatusEnum.Done,
    label: "Done",
  },
];

export const allowedOwner: MemberRoleType[] = ["Owner"];
export const allowedAdmin: MemberRoleType[] = ["Owner", "Admin"];
export const allowedMod: MemberRoleType[] = ["Owner", "Admin", "Moderator"];
