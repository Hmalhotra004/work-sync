"use client";

import Analytics from "@/components/analytics/Analytics";
import MemberList from "@/components/analytics/MemberList";
import ProjectList from "@/components/analytics/ProjectList";
import TaskList from "@/components/analytics/TaskList";
import PageLoading from "@/components/fallbacks/PageLoading";
import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
}

const WorkspaceIdView = ({ workspaceId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.workspace.analytics.queryOptions({ workspaceId })
  );

  const { data: projects, isLoading: isLoadingProjects } = useQuery(
    trpc.project.getMany.queryOptions({ workspaceId })
  );

  const { data: tasks, isLoading: isLoadingTasks } = useQuery(
    trpc.task.getMany.queryOptions({ workspaceId })
  );

  const { data: members, isLoading: isLoadingMembers } = useQuery(
    trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
  );

  const isLoading = isLoadingProjects || isLoadingTasks || isLoadingMembers;

  if (isLoading || !tasks || !projects || !members) {
    return <PageLoading />;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <Analytics data={data} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TaskList
          tasks={tasks}
          total={tasks.length}
          workspaceId={workspaceId}
        />

        <ProjectList
          projects={projects.projects}
          total={projects.projects.length}
          workspaceId={workspaceId}
        />

        <MemberList
          members={members.members}
          total={members.members.length}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  );
};

export default WorkspaceIdView;
