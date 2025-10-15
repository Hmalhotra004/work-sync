"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
}

const WorkspaceTasksView = ({ workspaceId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.workspace.getOne.queryOptions({ workspaceId })
  );

  return <div>WorkspaceTasksView</div>;
};

export default WorkspaceTasksView;
