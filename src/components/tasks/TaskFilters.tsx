import MemberAvatar from "@/components/member/MemberAvatar";
import ProjectAvatar from "@/components/project/ProjectAvatar";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { FilterCombobox } from "@/components/ui/filter-combobox";
import { useTasksFilters } from "@/hooks/useTasksFilters";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { TASKSTATUSMAP } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { TaskStatusEnum } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ListChecksIcon, XCircleIcon } from "lucide-react";

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

  const [filters, setFilters] = useTasksFilters();
  const { assigneeId, dueDate, projectId, status, search } = filters;

  const { data: projects, isLoading: isLoadingProjects } = useQuery(
    trpc.project.getMany.queryOptions({ workspaceId })
  );
  const { data: members, isLoading: isLoadingMembers } = useQuery(
    trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
  );

  const isLoading = isLoadingMembers || isLoadingProjects;
  if (isLoading || !members || !projects) return null;

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as TaskStatusEnum) });
  };

  const onAssigneeIdChange = (value: string) => {
    setFilters({ assigneeId: value === "all" ? null : value });
  };

  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === "all" ? null : value });
  };

  const clearFilters = () => {
    setFilters({
      assigneeId: null,
      dueDate: null,
      projectId: null,
      status: null,
      search: null,
    });
  };

  const hasActiveFilters =
    !!assigneeId || !!dueDate || !!projectId || !!status || !!search;

  return (
    <div className="flex flex-col lg:flex-row gap-2 items-center flex-wrap">
      {/* Status Filter */}
      <Select
        value={status ?? "all"}
        onValueChange={onStatusChange}
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

      {/* Assignee Filter */}
      <FilterCombobox
        Avatar={MemberAvatar}
        placeholder="Assignee"
        options={[
          { value: "all", label: "All Assignees", image: null },
          ...members.map((m) => ({
            value: m.userId,
            label: m.name,
            image: m.image,
          })),
        ]}
        value={assigneeId ?? "all"}
        onChange={onAssigneeIdChange}
      />

      {/* Project Filter */}
      {!hideProjectFilter && (
        <FilterCombobox
          Avatar={ProjectAvatar}
          placeholder="Project"
          options={[
            { value: "all", label: "All Projects", image: null },
            ...projects.map((m) => ({
              value: m.id,
              label: m.name,
              image: m.image,
            })),
          ]}
          value={projectId ?? "all"}
          onChange={onProjectChange}
        />
      )}

      <DatePicker
        placeholder="Due Date"
        className="h-12 w-full lg:w-auto"
        value={dueDate ? dueDate.toISOString() : ""}
        onChange={(date) => setFilters({ dueDate: date ?? null })}
      />

      {hasActiveFilters && (
        <Button
          size="lg"
          variant="secondary"
          className="ml-auto items-center"
          onClick={clearFilters}
        >
          <XCircleIcon className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default TaskFilters;
