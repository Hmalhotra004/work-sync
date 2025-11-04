"use client";

import TasksSwitcher from "@/components/tasks/TasksSwitcher";

interface Props {
  workspaceId: string;
}

const WorkspaceTasksView = ({ workspaceId }: Props) => {
  return (
    <div className="flex flex-col h-full">
      <TasksSwitcher
        workspaceId={workspaceId}
        project
      />
    </div>
  );
};

export default WorkspaceTasksView;
