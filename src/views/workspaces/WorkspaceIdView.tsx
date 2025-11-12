"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
}

const WorkspaceIdView = ({ workspaceId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.workspace.analytics.queryOptions({ workspaceId })
  );

  const { data: projects } = useSuspenseQuery(
    trpc.project.getMany.queryOptions({ workspaceId })
  );

  const { data: tasks } = useSuspenseQuery(
    trpc.task.getMany.queryOptions({ workspaceId })
  );

  const { data: members } = useSuspenseQuery(
    trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
  );

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-muted-foreground">Coming Soon!!</h2>
    </div>
    // <div className="h-full flex flex-col space-y-4">
    //   <Analytics data={data} />

    //   <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
    //     <TaskList
    //       tasks={tasks}
    //       total={tasks.length}
    //       workspaceId={workspaceId}
    //     />

    //     <ProjectList
    //       projects={projects.projects}
    //       total={projects.projects.length}
    //       workspaceId={workspaceId}
    //     />

    //     <MemberList
    //       members={members.members}
    //       total={members.members.length}
    //       workspaceId={workspaceId}
    //     />
    //   </div>
    // </div>
  );
};

export default WorkspaceIdView;
