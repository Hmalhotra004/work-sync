"use client";

import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { routes } from "@/lib/routes";
import { allowedAdmin } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { RouteType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { SettingsIcon } from "lucide-react";
import NavBtn from "./NavBtn";

const Navigation = () => {
  const trpc = useTRPC();
  const workspaceId = useWorkspaceId();

  const { data: workspace, isLoading } = useQuery(
    trpc.workspace.getOne.queryOptions({ workspaceId })
  );

  const navs: RouteType[] = routes.slice(0, 3);

  if (isLoading || !workspace) {
    return (
      <NavBtn
        workspaceId={workspaceId}
        routes={navs}
      />
    );
  }

  const userRole = workspace.role;

  if (allowedAdmin.includes(userRole)) {
    navs.push({
      label: "Settings",
      href: `/settings`,
      icon: SettingsIcon,
      activeIcon: SettingsIcon,
      allowedRole: allowedAdmin,
    });
  }

  return (
    <NavBtn
      workspaceId={workspaceId}
      routes={navs}
    />
  );
};

export default Navigation;
