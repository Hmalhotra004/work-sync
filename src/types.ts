import { inferRouterOutputs } from "@trpc/server";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { type IconType as ReactIconType } from "react-icons/lib";
import z from "zod";
import { taskStatusSchema } from "./schemas/task/schema";
import { memberRoleSchema } from "./schemas/workspace/schema";
import { AppRouter } from "./trpc/routers/_app";

export type WorkspaceType =
  inferRouterOutputs<AppRouter>["workspace"]["getOne"];

export type ProjectType = inferRouterOutputs<AppRouter>["project"]["getOne"];

export type TaskType = inferRouterOutputs<AppRouter>["task"]["getOne"];

// export type TaskGetManyType = inferRouterOutputs<AppRouter>["task"]["getMany"];
export type TaskGetManyType = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  description: string | null;
  status: "Backlog" | "Todo" | "In Progress" | "In Review" | "Done";
  dueDate: string;
  position: number;
  projectId: string | null;
  assigneeId: string | null;
  projectName: string | null;
  projectImage: string | null;
  assigneeName: string | null;
  assigneeImage: string | null;
};

export type MemberRoleType = z.infer<typeof memberRoleSchema>;

export type MemberType = {
  memberId: string;
  userId: string;
  workspaceId: string;
  name: string;
  email: string;
  image: string | null;
  role: "Owner" | "Admin" | "Moderator" | "Member";
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskStatusType = z.infer<typeof taskStatusSchema>;

export enum TaskStatusEnum {
  Backlog = "Backlog",
  Todo = "Todo",
  In_Progress = "In Progress",
  In_Review = "In Review",
  Done = "Done",
}

export type IconType =
  | ReactIconType
  | ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;

export type RouteType = {
  label: string;
  href: string;
  icon: IconType;
  activeIcon: IconType;
}[];

export type uploadPayload = {
  id: string;
  status: TaskStatusType;
  position: number;
};

export type CalendarEventType = {
  start: Date;
  end: Date;
  id: string;
  title: string;
  project: {
    id: string | null;
    name: string | null;
    image: string | null;
  };
  assignee: {
    id: string | null;
    name: string | null;
    image: string | null;
  };
  status: TaskStatusType;
};
