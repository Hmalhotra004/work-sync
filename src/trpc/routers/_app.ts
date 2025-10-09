import { cloudinaryRouter } from "@/procedures/cloudinary";
import { workspaceRouter } from "@/procedures/workspace";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  cloudinary: cloudinaryRouter,
});

export type AppRouter = typeof appRouter;
