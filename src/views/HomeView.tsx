"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";
import { useRouter } from "next/navigation";

const HomeView = () => {
  const { data, isPending } = authClient.useSession();

  const router = useRouter();

  function logout() {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.replace("/sign-in") },
    });
  }

  return (
    <div>
      HomeView
      <Button onClick={logout}>logout</Button>
    </div>
  );
};

export default HomeView;
