"use client";

import DottedSeparator from "@/components/dotted-separator";
import TaskBreadcrumbs from "@/components/tasks/TaskBreadcrumbs";
import TaskDescription from "@/components/tasks/TaskDescription";
import TaskOverview from "@/components/tasks/TaskOverview";
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

  return (
    <div className="flex flex-col">
      <TaskBreadcrumbs
        task={data.task}
        project={data.project}
      />

      <DottedSeparator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskOverview data={data} />
        <TaskDescription task={data.task} />
      </div>
    </div>
  );
};

export default TaskIdView;
