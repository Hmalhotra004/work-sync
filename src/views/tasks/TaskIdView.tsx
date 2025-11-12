"use client";

import TaskBreadcrumbs from "@/components/tasks/TaskBreadcrumbs";
import TaskDescription from "@/components/tasks/TaskDescription";
import TaskOverview from "@/components/tasks/TaskOverview";
import DottedSeparator from "@/components/ui/dotted-separator";
import { allowedMod } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  taskId: string;
  projectId: string;
  workspaceId: string;
}

const TaskIdView = ({ taskId, projectId, workspaceId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.task.taskDetails.queryOptions({ projectId, workspaceId, taskId })
  );

  const { data: role } = useSuspenseQuery(
    trpc.workspace.getRole.queryOptions({ workspaceId })
  );

  const isAllowed = allowedMod.includes(role);

  return (
    <div className="flex flex-col">
      <TaskBreadcrumbs
        task={data.task}
        project={data.project}
        isAllowed={isAllowed}
      />

      <DottedSeparator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskOverview
          data={data}
          isAllowed={isAllowed}
        />
        <TaskDescription
          task={data.task}
          isAllowed={isAllowed}
        />
      </div>
    </div>
  );
};

export default TaskIdView;
