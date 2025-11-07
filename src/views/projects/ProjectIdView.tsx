"use client";
import ProjectAvatar from "@/components/project/ProjectAvatar";
import TasksSwitcher from "@/components/tasks/TasksSwitcher";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  workspaceId: string;
  projectId: string;
}

const ProjectIdView = ({ projectId, workspaceId }: Props) => {
  const trpc = useTRPC();

  const { data: project } = useSuspenseQuery(
    trpc.project.getOne.queryOptions({ workspaceId, projectId })
  );

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={project.name}
            image={project.image ?? undefined}
            className="size-8"
          />
          <p className="text-lg font-semibold">{project.name}</p>
        </div>

        <div className="flex items-center gap-x-4">
          {/* <Button
            variant="secondary"
            size="sm"
            asChild
          >
            <Link
              href={`/workspaces/${project.workspaceId}/projects/${project.id}/analytics`}
            >
              <BarChartIcon className="size-4 mr-2" /> Analytics
            </Link>
          </Button> */}

          <Button
            variant="secondary"
            size="sm"
            asChild
          >
            <Link
              href={`/workspaces/${project.workspaceId}/projects/${project.id}/settings`}
            >
              <PencilIcon className="size-4 mr-2" /> Edit Project
            </Link>
          </Button>
        </div>
      </div>

      <TasksSwitcher
        workspaceId={workspaceId}
        projectId={projectId}
        project={false}
      />
    </div>
  );
};

export default ProjectIdView;
