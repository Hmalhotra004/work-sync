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

export type MemberRoleType = z.infer<typeof memberRoleSchema>;

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
