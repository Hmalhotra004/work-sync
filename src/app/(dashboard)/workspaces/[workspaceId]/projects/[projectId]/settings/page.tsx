import { ErrorBoundaryWrapper } from "@/components/fallbacks/ErrorBoundaryWrapper";
import PageLoading from "@/components/fallbacks/PageLoading";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import ProjectSettingsView from "@/views/projects/ProjectSettingsView";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

const Settings = async ({ params }: Props) => {
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

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.project.getOne.queryOptions({ id: projectId, workspaceId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PageLoading />}>
        <ErrorBoundaryWrapper>
          <ProjectSettingsView
            workspaceId={workspaceId}
            projectId={projectId}
          />
        </ErrorBoundaryWrapper>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Settings;
