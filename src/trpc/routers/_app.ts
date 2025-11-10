import { createTRPCRouter } from "../init";

import { cloudinaryRouter } from "@/procedures/cloudinary";
import { memberRouter } from "@/procedures/member";
import { profileRouter } from "@/procedures/profile";
import { projectRouter } from "@/procedures/project";
import { taskRouter } from "@/procedures/task";
import { workspaceRouter } from "@/procedures/workspace";

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  project: projectRouter,
  task: taskRouter,
  member: memberRouter,
  profile: profileRouter,
  cloudinary: cloudinaryRouter,
});

export type AppRouter = typeof appRouter;
