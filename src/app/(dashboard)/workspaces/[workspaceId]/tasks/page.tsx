import { ErrorBoundaryWrapper } from "@/components/fallbacks/ErrorBoundaryWrapper";
import PageLoading from "@/components/fallbacks/PageLoading";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import WorkspaceTasksView from "@/views/workspaces/WorkspaceTasksView";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";
import { Suspense } from "react";

import {
  loadSearchParams,
  normalizeTaskFilters,
} from "@/params/taskFilterParams";

interface Props {
  params: Promise<{ workspaceId: string }>;
  searchparams: SearchParams;
}

const WorkspaceTasks = async ({ params, searchparams }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  } else if (!session.user.emailVerified) {
    redirect(`/email-verification?email=${session.user.email}`);
  }

  const filters = loadSearchParams(searchparams);
  const { assigneeId, dueDate, projectId, search, status } =
    normalizeTaskFilters(filters);

  const workspaceId = (await params).workspaceId;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageLoading />}>
        <ErrorBoundaryWrapper>
          <WorkspaceTasksView workspaceId={workspaceId} />
        </ErrorBoundaryWrapper>
      </Suspense>
    </HydrationBoundary>
  );
};

export default WorkspaceTasks;
