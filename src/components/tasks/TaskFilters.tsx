import { useTasksFilters } from "@/hooks/useTasksFilters";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { TASKSTATUSMAP } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { TaskStatusEnum } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ListChecksIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  hideProjectFilter?: boolean;
}

const TaskFilters = ({ hideProjectFilter = false }: Props) => {
  const trpc = useTRPC();
  const workspaceId = useWorkspaceId();
  const [{ assigneeId, dueDate, projectId, search, status }, setFilters] =
    useTasksFilters();

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as TaskStatusEnum) });
  };

  const { data: projects, isLoading: isLoadingProjects } = useQuery(
    trpc.project.getMany.queryOptions({ workspaceId })
  );

  const { data: members, isLoading: isLoadingMembers } = useQuery(
    trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
  );

  const isLoading = isLoadingMembers || isLoadingProjects;

  if (isLoading) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-2">
      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <ListChecksIcon className="size-4 mr-2" />
            <SelectValue placeholder="All statuses" />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectSeparator />
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
    </div>
  );
};

export default TaskFilters;
