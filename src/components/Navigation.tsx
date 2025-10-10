"use client";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { cn } from "@/lib/utils";
import { RouteType } from "@/types";
import { SettingsIcon, UserIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";

const Navigation = () => {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();

  const routes: RouteType = [
    {
      label: "Home",
      href: "/",
      icon: GoHome,
      activeIcon: GoHomeFill,
    },
    {
      label: "My Tasks",
      href: "/tasks",
      icon: GoCheckCircle,
      activeIcon: GoCheckCircleFill,
    },
    {
      label: "Members",
      href: "/members",
      icon: UserIcon,
      activeIcon: UserIcon,
    },
    {
      label: "Settings",
      href: `/workspaces/${workspaceId}/settings`,
      icon: SettingsIcon,
      activeIcon: SettingsIcon,
    },
  ];

  return (
    <ul className="flex flex-col">
      {routes.map((r, idx) => {
        const href = r.href.toString();
        const isActive = pathname.endsWith(href);
        const Icon = isActive ? r.activeIcon : r.icon;

        return (
          <Link
            key={idx.toString()}
            href={r.href as Route}
          >
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md font-medium text-foreground-500 hover:text-primary transition",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon className="size-5 text-foreground-500" />
              {r.label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};

export default Navigation;
