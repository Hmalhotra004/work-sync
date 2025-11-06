import DottedSeparator from "@/components/DottedSeparator";
import ProjectAvatar from "@/components/project/ProjectAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProjectModal } from "@/hooks/useCreateProjectModal";
import { ProjectType } from "@/types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  projects: ProjectType[];
  total: number;
  workspaceId: string;
}

const ProjectList = ({ projects, total, workspaceId }: Props) => {
  const { open } = useCreateProjectModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Projects ({total})</p>

          <Button
            variant="muted"
            size="icon"
            onClick={open}
          >
            <PlusIcon className="size-4 text-foreground-400" />
          </Button>
        </div>

        <DottedSeparator className="my-4" />

        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((project) => {
            return (
              <li key={project.id}>
                <Link
                  href={`/workspaces/${workspaceId}/projects/${project.id}`}
                >
                  <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                    <CardContent className="flex items-center gap-x-2.5">
                      <ProjectAvatar
                        name={project.name}
                        image={project.image ?? undefined}
                        className="size-10"
                        fallbackClassName="text-base"
                      />

                      <p className="text-lg font-medium truncate">
                        {project.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}

          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No Projects Found
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectList;
