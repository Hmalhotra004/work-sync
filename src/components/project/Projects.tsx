"use client";

import { useCreateProjectModal } from "@/hooks/useCreateProjectModal";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { allowedAdmin, cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
import ProjectAvatar from "./ProjectAvatar";

const Projects = () => {
  const trpc = useTRPC();
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  const { data, isLoading } = useQuery(
    trpc.project.getMany.queryOptions({ workspaceId })
  );

  const { open } = useCreateProjectModal();

  if (!data || isLoading) {
    return (
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase text-foreground-500">Projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-foreground-500">Projects</p>
        {allowedAdmin.includes(data?.role) && (
          <RiAddCircleFill
            onClick={open}
            className="size-5 text-foreground-500 cursor-pointer hover:opacity-75 transition"
          />
        )}
      </div>

      {data?.projects.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.id}`;
        const isActive = pathname.includes(href);

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
              <ProjectAvatar
                name={project.name}
                image={project.image ?? undefined}
              />
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Projects;
