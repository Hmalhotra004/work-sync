"use client";

import TasksSwitcher from "@/components/tasks/TasksSwitcher";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
}

const WorkspaceTasksView = ({ workspaceId }: Props) => {
  const trpc = useTRPC();

  const { data: role } = useSuspenseQuery(
    trpc.workspace.getRole.queryOptions({ workspaceId })
  );

  return (
    <div className="flex flex-col h-full">
      <TasksSwitcher
        role={role}
        workspaceId={workspaceId}
        project
      />
    </div>
  );
};

export default WorkspaceTasksView;
