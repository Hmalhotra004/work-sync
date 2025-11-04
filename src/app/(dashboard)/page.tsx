import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
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

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(trpc.workspace.getMany.queryOptions());

  const workspaces = queryClient.getQueryData(
    trpc.workspace.getMany.queryKey()
  );

  if (workspaces && workspaces.length > 0) {
    redirect(`/workspaces/${workspaces[0].id}`);
  }
  if (workspaces && workspaces.length === 0) {
    redirect(`/workspaces/create`);
  }

  return <Spinner />;
};

export default Home;
