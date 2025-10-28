"use client";

import DottedSeparator from "@/components/DottedSeparator";
import FormInput from "@/components/form/FormInput";
import Loader from "@/components/Loader";
import ProjectAvatar from "@/components/project/ProjectAvatar";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectId } from "@/hooks/useProjectId";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { cn, TASKSTATUSMAP } from "@/lib/utils";
import { createTaskSchema } from "@/schemas/task/schema";
import { useTRPC } from "@/trpc/client";
import { TaskStatusEnum, type TaskType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MemberAvatar from "../member/MemberAvatar";
import { Combobox } from "../ui/combobox";

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: TaskType;
}

const TaskForm = ({ onCancel, initialValues, onSuccess }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const isMobile = useIsMobile();

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
      dueDate: initialValues?.dueDate ?? "",
      status: initialValues?.status ?? TaskStatusEnum.Todo,
      assigneeId: initialValues?.assigneeId ?? "",
      projectId: initialValues?.projectId ?? projectId ?? "",
      workspaceId: initialValues?.workspaceId ?? workspaceId,
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
          trpc.task.getMany.queryOptions({ workspaceId })
        );
        toast.success("Task Created");
        onSuccess?.();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  // TODO:Update
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

  if (isLoading || !projects || !members) {
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
        projectId: values.projectId,
        workspaceId: values.workspaceId,
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

        <div
          className={cn(
            "grid grid-cols-2 gap-x-4 w-full",
            isMobile && "flex flex-col gap-y-4 w-full"
          )}
        >
          <FormField
            name="dueDate"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <DatePicker {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="status"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <FormMessage />

                  <SelectContent>
                    {TASKSTATUSMAP.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div
          className={cn(
            "grid grid-cols-2 gap-x-4",
            isMobile && "flex flex-col gap-y-4 w-full"
          )}
        >
          <FormField
            name="assigneeId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <FormControl>
                  <Combobox
                    {...field}
                    placeholder="Assignee"
                    Avatar={MemberAvatar}
                    options={members.members.map((m) => ({
                      value: m.userId,
                      label: m.name,
                      image: m.image,
                    }))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="projectId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                  </FormControl>
                  <FormMessage />

                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                      >
                        <div className="flex items-center gap-x-2">
                          <ProjectAvatar
                            name={p.name}
                            image={p.image ?? undefined}
                            className="size-6"
                          />
                          {p.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter Description"
                  disabled={isPending}
                  {...field}
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
