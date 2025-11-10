"use client";

import { authClient } from "@/lib/authClient";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "./Loader";
import { Avatar, AvatarFallback } from "./ui/avatar";
import DottedSeparator from "./ui/dotted-separator";

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
      <div className="size-10 rounded-full flex items-center justify-around bg-background-200 border border-border-300">
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
        {user.image ? (
          <div className="size-10 relative rounded-full overflow-hidden cursor-pointer hover:opacity-75">
            <Image
              src={user.image}
              alt="User Image"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <Avatar className="size-10 hover:opacity-75 transition border border-border-300 cursor-pointer">
            <AvatarFallback className="bg-background-200 font-medium text-foreground-500 flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          {user.image ? (
            <div className="size-[52px] relative rounded-full overflow-hidden cursor-pointer hover:opacity-75">
              <Image
                src={user.image}
                alt="User Image"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <Avatar className="size-[52px] hover:opacity-75 transition border border-border-300 cursor-pointer">
              <AvatarFallback className="bg-background-200 font-medium text-foreground-500 flex items-center justify-center">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex flex-col items-center justify-center gap-y-1">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-foreground-500">{user.email}</p>
          </div>
        </div>

        <DropdownMenuItem
          className="h-10 flex items-center justify-center font-medium cursor-pointer transition"
          asChild
        >
          <Link href="/profile/settings">
            <SettingsIcon className="size-4 mr-1" />
            settings
          </Link>
        </DropdownMenuItem>

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
