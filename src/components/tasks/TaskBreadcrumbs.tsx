import ProjectAvatar from "@/components/project/ProjectAvatar";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/useConfirm";
import { useTRPC } from "@/trpc/client";
import { ProjectType, TaskType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  project: ProjectType;
  task: TaskType;
}

const TaskBreadcrumbs = ({ project, task }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.task.getMany.queryOptions({ workspaceId: task.workspaceId })
        );
        await queryClient.invalidateQueries(
          trpc.task.getMany.queryOptions({
            projectId: project.id,
            workspaceId: task.workspaceId,
          })
        );
        toast.success("Task Deleted");
        router.back();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Task",
    "This action cannot be undone",
    "destructive"
  );

  async function handleDelete() {
    const ok = await confirmDelete();

    if (!ok) return;

    await deleteTask.mutateAsync({
      taskId: task.id,
      projectId: project.id,
      workspaceId: task.workspaceId,
    });
  }

  return (
    <>
      <DeleteDialog />

      <div className="flex items-center gap-x-2">
        <ProjectAvatar
          name={project.name}
          image={project.image ?? undefined}
          className="size-6 lg:size-8"
        />

        <Link
          href={`/workspaces/${task.workspaceId}/projects/${task.projectId}`}
        >
          <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
            {project.name}
          </p>
        </Link>

        <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />

        <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
          {task.name}
        </p>

        <Button
          variant="destructive"
          size="sm"
          className="ml-auto"
          onClick={handleDelete}
          disabled={deleteTask.isPending}
        >
          <TrashIcon className="size-4 lg:mr-1" />
          <span className="hidden lg:block">Delete task</span>
        </Button>
      </div>
    </>
  );
};

export default TaskBreadcrumbs;
