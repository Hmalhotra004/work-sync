import { ErrorBoundaryWrapper } from "@/components/fallbacks/ErrorBoundaryWrapper";
import PageLoading from "@/components/fallbacks/PageLoading";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import WorkspaceIdView from "@/views/workspaces/WorkspaceIdView";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

const WorkspaceIdPage = async ({ params }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  } else if (!session.user.emailVerified) {
    redirect(`/email-verification?email=${session.user.email}`);
  }

  const workspaceId = (await params).workspaceId;

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(
      trpc.workspace.analytics.queryOptions({ workspaceId })
    ),
    queryClient.prefetchQuery(
      trpc.project.getMany.queryOptions({ workspaceId })
    ),
    queryClient.prefetchQuery(trpc.task.getMany.queryOptions({ workspaceId })),
    queryClient.prefetchQuery(
      trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageLoading />}>
        <ErrorBoundaryWrapper>
          <WorkspaceIdView workspaceId={workspaceId} />
        </ErrorBoundaryWrapper>
      </Suspense>
    </HydrationBoundary>
  );
};

export default WorkspaceIdPage;
