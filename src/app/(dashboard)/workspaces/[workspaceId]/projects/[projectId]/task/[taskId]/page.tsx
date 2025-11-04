import { ErrorBoundaryWrapper } from "@/components/fallbacks/ErrorBoundaryWrapper";
import PageLoading from "@/components/fallbacks/PageLoading";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import TaskIdView from "@/views/tasks/TaskIdView";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ workspaceId: string; projectId: string; taskId: string }>;
}

const ProjectIdPage = async ({ params }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  } else if (!session.user.emailVerified) {
    redirect(`/email-verification?email=${session.user.email}`);
  }

  const workspaceId = (await params).workspaceId;
  const projectId = (await params).projectId;
  const taskId = (await params).taskId;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.task.taskDetails.queryOptions({ workspaceId, projectId, taskId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageLoading />}>
        <ErrorBoundaryWrapper>
          <TaskIdView
            taskId={taskId}
            workspaceId={workspaceId}
            projectId={projectId}
          />
        </ErrorBoundaryWrapper>
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProjectIdPage;
