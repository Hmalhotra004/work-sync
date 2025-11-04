"use client";

import { cn } from "@/lib/utils";
import { RouteType } from "@/types";
import { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  workspaceId: string;
  routes: RouteType[];
}

const NavBtn = ({ workspaceId, routes }: Props) => {
  const pathName = usePathname();

  return (
    <ul className="flex flex-col">
      {routes.map((r, idx) => {
        const fullHref = `/workspaces/${workspaceId}${r.href}`;
        const isActive = pathName === fullHref;
        const Icon = isActive ? r.activeIcon : r.icon;

        return (
          <Link
            key={idx.toString()}
            href={fullHref as Route}
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

export default NavBtn;
