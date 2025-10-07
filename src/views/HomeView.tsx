"use client";
import UserButton from "@/components/UserButton";
import { useTRPC } from "@/trpc/client";

const HomeView = () => {
  const trpc = useTRPC();

  return (
    <div>
      <UserButton />
    </div>
  );
};

export default HomeView;
