"use client";

import DottedSeparator from "@/components/dotted-separator";
import Loader from "@/components/Loader";
import TaskForm from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirm } from "@/hooks/useConfirm";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

interface Props {
  taskId: string;
  projectId: string;
  workspaceId: string;
}

const TaskEditView = ({ taskId, projectId, workspaceId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: task } = useSuspenseQuery(
    trpc.task.getOne.queryOptions({ projectId, taskId, workspaceId })
  );

  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.task.getMany.queryOptions({ workspaceId })
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

    await deleteTask.mutateAsync({ workspaceId, projectId, taskId });
  }

  function onCancel() {
    router.back();
  }

  return (
    <>
      <DeleteDialog />
      <div className="h-full w-full flex flex-col gap-y-2">
        <Card className="w-full border-none shadow-none p-0 pb-4">
          <CardHeader className="flex px-0">
            <CardTitle className="text-xl font-bold">Edit your task</CardTitle>
          </CardHeader>

          <DottedSeparator />

          <CardContent className="px-0">
            <TaskForm
              initialValues={task}
              onCancel={onCancel}
            />
          </CardContent>
        </Card>

        <Card className="w-full border-none shadow-none bg-background-100">
          <CardContent className="px-7">
            <div className="flex max-md:flex-col justify-center">
              <div className="flex flex-col">
                <h3 className="font-bold">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Deleting a workspace is irreversible and will remove all
                  associated data
                </p>
              </div>
              <Button
                variant="destructive"
                type="button"
                className="max-md:mt-6 w-fit ml-auto"
                disabled={deleteTask.isPending}
                onClick={handleDelete}
              >
                {deleteTask.isPending ? <Loader /> : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TaskEditView;
