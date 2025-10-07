import { workspaceRouter } from "@/procedures/workspace";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
