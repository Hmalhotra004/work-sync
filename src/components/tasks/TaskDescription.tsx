"use client";

import DottedSeparator from "@/components/DottedSeparator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { TaskType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  task: TaskType;
}

const TaskDescription = ({ task }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isEditing, setisEditing] = useState(false);
  const [value, setValue] = useState(task.description);

  const updateTask = useMutation(
    trpc.task.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.task.getMany.queryOptions({
            workspaceId: task.workspaceId,
          })
        );
        await queryClient.invalidateQueries(
          trpc.task.getMany.queryOptions({
            projectId: task.projectId,
            workspaceId: task.workspaceId,
          })
        );
        await queryClient.invalidateQueries(
          trpc.task.getOne.queryOptions({
            taskId: task.id,
            projectId: task.projectId,
            workspaceId: task.workspaceId,
          })
        );
        toast.success("Task Updated");
      },
      onError: (error) => toast.error(error.message),
    })
  );

  async function handleUpdate() {
    updateTask.mutateAsync({
      ...task,
      taskId: task.id,
      description: value ?? "",
    });
    setisEditing(false);
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setisEditing((p) => !p)}
          disabled={updateTask.isPending}
        >
          {isEditing ? <XIcon /> : <PencilIcon className="size-4 mr-1" />}
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <DottedSeparator className="my-4" />

      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description..."
            value={value ?? ""}
            rows={4}
            onChange={(e) => setValue(e.target.value)}
            disabled={updateTask.isPending}
          />
          <Button
            size="sm"
            className="w-fit ml-auto"
            onClick={handleUpdate}
          >
            {updateTask.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      ) : (
        <div>
          {value || (
            <span className="text-muted-foreground">No Description</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDescription;
