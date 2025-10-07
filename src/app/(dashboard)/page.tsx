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

  return <HomeView />;
};

export default Home;
