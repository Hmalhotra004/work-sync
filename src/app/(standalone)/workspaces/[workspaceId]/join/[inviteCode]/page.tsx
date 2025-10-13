import { ErrorBoundaryWrapper } from "@/components/fallbacks/ErrorBoundaryWrapper";
import PageLoading from "@/components/fallbacks/PageLoading";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import JoinWorkspaceView from "@/views/workspaces/JoinWorkspaceView";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ workspaceId: string; inviteCode: string }>;
}

const JoinWorkspacePage = async ({ params }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  } else if (!session.user.emailVerified) {
    redirect(`/email-verification?email=${session.user.email}`);
  }

  const id = (await params).workspaceId;
  const code = (await params).inviteCode;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.workspace.getWorkspaceInfo.queryOptions({ id })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageLoading />}>
        <ErrorBoundaryWrapper>
          <JoinWorkspaceView
            id={id}
            code={code}
          />
        </ErrorBoundaryWrapper>
      </Suspense>
    </HydrationBoundary>
  );
};

export default JoinWorkspacePage;
