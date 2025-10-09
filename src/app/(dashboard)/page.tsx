import { auth } from "@/lib/auth";
import HomeView from "@/views/HomeView";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Home = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  } else if (!session.user.emailVerified) {
    redirect(`/email-verification?email=${session.user.email}`);
  }

  return (
    <HomeView />
    // <HydrationBoundary state={dehydrate(queryClient)}>
    //   <Suspense fallback={<Loader />}>
    //     {/* TODO:Change error */}
    //     <ErrorBoundary fallback={<div>error</div>}>
    //     </ErrorBoundary>
    //   </Suspense>
    // </HydrationBoundary>
  );
};

export default Home;
