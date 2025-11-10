import { ErrorBoundaryWrapper } from "@/components/fallbacks/ErrorBoundaryWrapper";
import PageLoading from "@/components/fallbacks/PageLoading";
import { auth } from "@/lib/auth";
import SettingsView from "@/views/profile/SettingsView";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const ProfileSettingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  } else if (!session.user.emailVerified) {
    redirect(`/email-verification?email=${session.user.email}`);
  }

  const user = session.user;

  return (
    // <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<PageLoading />}>
      <ErrorBoundaryWrapper>
        <SettingsView user={user} />
      </ErrorBoundaryWrapper>
    </Suspense>
    // </HydrationBoundary>
  );
};

export default ProfileSettingsPage;
