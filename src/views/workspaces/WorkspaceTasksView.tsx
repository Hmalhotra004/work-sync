"use client";

import { useTasksFilters } from "@/hooks/useTasksFilters";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
}

const WorkspaceTasksView = ({ workspaceId }: Props) => {
  const trpc = useTRPC();

  const [{ assigneeId, dueDate, search, status, projectId }] =
    useTasksFilters();

  const { data: tasks } = useSuspenseQuery(
    trpc.task.getMany.queryOptions({
      workspaceId,
      projectId,
      assigneeId,
      status,
      dueDate,
      search,
    })
  );

  return (
    <div>
      WorkspaceTasksView
      {JSON.stringify(tasks)}
    </div>
  );
};

export default WorkspaceTasksView;
