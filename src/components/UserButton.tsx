"use client";

import { authClient } from "@/lib/authClient";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import DottedSeparator from "./DottedSeparator";
import Loader from "./Loader";
import { Avatar, AvatarFallback } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const UserButton = () => {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  const user = data?.user;

  if (isPending) {
    return (
      <div className="size-10 rounded-full flex items-center justify-around bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  function logout() {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.replace("/sign-in") },
    });
  }

  const avatarFallback = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300 cursor-pointer">
          <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <Avatar className="size-[52px] border border-neutral-300 cursor-pointer">
            <AvatarFallback className="bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center justify-center gap-y-1">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>

        <DottedSeparator className="mb-1" />

        <DropdownMenuItem
          onClick={logout}
          className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer transition"
        >
          <LogOutIcon className="size-4 mr-1" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
