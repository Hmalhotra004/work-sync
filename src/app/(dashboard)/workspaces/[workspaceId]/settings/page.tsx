import Loader from "@/components/Loader";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import WorkspaceSettingsView from "@/views/workspaces/WorkspaceSettingsView";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{ workspaceId: string }>;
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

  const id = (await params).workspaceId;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.workspace.getOne.queryOptions({ id }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* FIXME:fix */}
      <Suspense fallback={<Loader />}>
        <ErrorBoundary fallback={<></>}>
          <WorkspaceSettingsView id={id} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Settings;
