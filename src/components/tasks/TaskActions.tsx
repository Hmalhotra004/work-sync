"use client";

import { useConfirm } from "@/hooks/useConfirm";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectId } from "@/hooks/useProjectId";

interface Props {
  id: string;
  projectId: string;
  children: ReactNode;
}

const TaskActions = ({ children, id, projectId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const ProjectIdAsParam = useProjectId();
  const router = useRouter();

  const [ConfirmDeleteTaskDialog, confirm] = useConfirm(
    "Delete Task",
    "This action cannot be undone",
    "destructive"
  );

  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.task.getMany.queryOptions({ workspaceId, projectId })
        );
        toast.success("Task Deleted");
      },
      onError: (err) => toast.error(err.message),
    })
  );

  function onOpenTask() {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}/task/${id}`);
  }

  function onOpenEditTask() {
    router.push(
      `/workspaces/${workspaceId}/projects/${projectId}/task/${id}/edit`
    );
  }

  function onOpenProject() {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  }

  async function onTaskDelete() {
    const ok = await confirm();

    if (!ok) return;

    deleteTask.mutateAsync({ taskId: id, projectId, workspaceId });
  }

  return (
    <>
      <ConfirmDeleteTaskDialog />

      <div className="flex justify-end">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48"
          >
            <DropdownMenuItem
              onClick={onOpenTask}
              className="font-medium p-[10px]"
            >
              <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
              Task Details
            </DropdownMenuItem>

            {!ProjectIdAsParam && (
              <DropdownMenuItem
                onClick={onOpenProject}
                className="font-medium p-[10px]"
              >
                <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                Open Project
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={onOpenEditTask}
              className="font-medium p-[10px]"
            >
              <PencilIcon className="size-4 mr-2 stroke-2" />
              Edit Task
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onTaskDelete}
              disabled={deleteTask.isPending}
              className="text-amber-700 focus:text-amber-700 font-medium p-[10px]"
            >
              <TrashIcon className="size-4 mr-2 stroke-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default TaskActions;
