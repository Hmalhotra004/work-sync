"use client";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Skeleton } from "./ui/skeleton";

const Navigation = () => {
  const trpc = useTRPC();
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();

  const { data: workspace, isLoading } = useQuery(
    trpc.workspace.getOne.queryOptions({ workspaceId })
  );

  if (isLoading || !workspace) {
    return (
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-5 bg-foreground-500 p-2.5" />
        <Skeleton className="h-5 bg-foreground-500 p-2.5" />
        <Skeleton className="h-5 bg-foreground-500 p-2.5" />
        <Skeleton className="h-5 bg-foreground-500 p-2.5" />
      </div>
    );
  }

  const userRole = workspace.role;

  const filteredRoutes = routes.filter(
    (r) => !r.allowedRole || r.allowedRole.includes(userRole)
  );

  return (
    <ul className="flex flex-col">
      {filteredRoutes.map((r, idx) => {
        const fullHref = `/workspaces/${workspaceId}${r.href}`;
        const isActive = pathname === fullHref;
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

export default Navigation;
