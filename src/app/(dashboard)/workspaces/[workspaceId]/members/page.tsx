import { ErrorBoundaryWrapper } from "@/components/fallbacks/ErrorBoundaryWrapper";
import PageLoading from "@/components/fallbacks/PageLoading";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import WorkspaceMembersView from "@/views/workspaces/WorkspaceMembersView";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

const WorkspaceMembers = async ({ params }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  } else if (!session.user.emailVerified) {
    redirect(`/email-verification?email=${session.user.email}`);
  }

  const id = (await params).workspaceId;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.workspace.getOne.queryOptions({ id }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageLoading />}>
        <ErrorBoundaryWrapper>
          <WorkspaceMembersView id={id} />
        </ErrorBoundaryWrapper>
      </Suspense>
    </HydrationBoundary>
  );
};

export default WorkspaceMembers;
