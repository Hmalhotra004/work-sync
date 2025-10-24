"use client";

import DottedSeparator from "@/components/DottedSeparator";
import FormInput from "@/components/form/FormInput";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { useProjectId } from "@/hooks/useProjectId";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { cn } from "@/lib/utils";
import { createTaskSchema } from "@/schemas/task/schema";
import { useTRPC } from "@/trpc/client";
import type { TaskType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: TaskType;
}

const TaskForm = ({ onCancel, initialValues, onSuccess }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();

  const { data: projects, isLoading: isLoadingProjects } = useQuery(
    trpc.project.getMany.queryOptions({ workspaceId })
  );

  const { data: members, isLoading: isLoadingMembers } = useQuery(
    trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
  );

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      dueDate: initialValues?.dueDate ?? new Date(),
      status: initialValues?.status ?? "Todo",
      assigneeId: initialValues?.assigneeId ?? "",
      projectId,
      workspaceId,
    },
  });

  const isEdit = !!initialValues?.id;

  const createTask = useMutation(
    trpc.task.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.project.getOne.queryOptions({ workspaceId, projectId })
        );
        await queryClient.invalidateQueries(
          trpc.task.getMany.queryOptions({ workspaceId, projectId })
        );
        toast.success("Task Created");
        onSuccess?.();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const updateTask = useMutation(
    trpc.project.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.project.getMany.queryOptions({ workspaceId })
        );
        await queryClient.invalidateQueries(
          trpc.project.getOne.queryOptions({
            projectId: initialValues!.id!,
            workspaceId,
          })
        );
        toast.success("Project Updated");
        onSuccess?.();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const isPending = updateTask.isPending || createTask.isPending;

  const isLoading = isLoadingMembers || isLoadingProjects;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="size-5 text-muted-foreground" />
      </div>
    );
  }

  const onSubmit = async (values: z.infer<typeof createTaskSchema>) => {
    if (isEdit) {
      await updateTask.mutateAsync({
        id: initialValues?.id,
        name: values.name,
        image: "",
        workspaceId,
      });
    } else {
      await createTask.mutateAsync({
        name: values.name,
        description: values.description,
        dueDate: values.dueDate,
        status: values.status,
        assigneeId: values.assigneeId,
        projectId,
        workspaceId,
      });

      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-5"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <FormInput
                  type="text"
                  placeholder="Enter Task name"
                  autoComplete="off"
                  disabled={isPending}
                  field={field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DottedSeparator />

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onCancel}
            disabled={isPending}
            className={cn(!onCancel && "invisible")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
          >
            {isEdit ? "Update" : "Create"} Task
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
