"use client";

import { useProjectId } from "@/hooks/useProjectId";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

const Projects = () => {
  const trpc = useTRPC();
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const pathname = usePathname();

  const { data } = useQuery(trpc.project.getMany.queryOptions({ workspaceId }));

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-foreground-500">Projects</p>
        <RiAddCircleFill
          // onClick={open}
          className="size-5 text-foreground-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>

      {data?.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.id}`;
        const isActive = pathname === href;
        return (
          <Link
            href={href}
            key={project.id}
          >
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-foreground-500",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Projects;
