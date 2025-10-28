import { createTRPCRouter } from "../init";

import { cloudinaryRouter } from "@/procedures/cloudinary";
import { memberRouter } from "@/procedures/member";
import { projectRouter } from "@/procedures/project";
import { taskRouter } from "@/procedures/task";
import { workspaceRouter } from "@/procedures/workspace";

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  project: projectRouter,
  task: taskRouter,
  member: memberRouter,
  cloudinary: cloudinaryRouter,
});

export type AppRouter = typeof appRouter;
