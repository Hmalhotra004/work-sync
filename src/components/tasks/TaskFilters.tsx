import MemberAvatar from "@/components/member/MemberAvatar";
import ProjectAvatar from "@/components/project/ProjectAvatar";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import DatePicker from "@/components/ui/date-picker";
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
import { FilterCombobox } from "../ui/filter-combobox";

interface Props {
  hideProjectFilter?: boolean;
}

const TaskFilters = ({ hideProjectFilter = false }: Props) => {
  const trpc = useTRPC();
  const workspaceId = useWorkspaceId();

  const [filters, setFilters] = useTasksFilters();

  const { assigneeId, dueDate, projectId, search, status } = filters;

  const { data: projects, isLoading: isLoadingProjects } = useQuery(
    trpc.project.getMany.queryOptions({ workspaceId })
  );

  const { data: members, isLoading: isLoadingMembers } = useQuery(
    trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
  );

  const onStatusChange = (value: string) => {
    setFilters({ status: value === "all" ? null : (value as TaskStatusEnum) });
  };

  const onAssigneeIdChange = (value: string) => {
    setFilters({ assigneeId: value === "all" ? null : (value as string) });
  };

  const onProjectChange = (value: string) => {
    setFilters({ projectId: value === "all" ? null : (value as string) });
  };

  function clearFilters() {
    setFilters({
      assigneeId: null,
      dueDate: null,
      search: null,
      status: null,
    });
  }

  const isLoading = isLoadingMembers || isLoadingProjects;

  if (isLoading || !members || !projects) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-2">
      {/* status */}
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

      {/* AssigneeId */}
      <FilterCombobox
        Avatar={MemberAvatar}
        onChange={(value) => onAssigneeIdChange(value)}
        placeholder="Assignee"
        options={[
          {
            value: "all",
            label: "All Assignees",
            image: null,
          },
          ...members.members.map((m) => ({
            value: m.userId,
            label: m.name,
            image: m.image,
          })),
        ]}
        value={assigneeId ?? "all"}
      />

      {/* Project */}
      {!hideProjectFilter && (
        <Combobox
          Avatar={ProjectAvatar}
          onChange={(value) => onProjectChange(value)}
          placeholder="Project"
          options={[
            {
              value: "all",
              label: "All Projects",
              image: null,
            },
            ...projects.map((m) => ({
              value: m.id,
              label: m.name,
              image: m.image,
            })),
          ]}
          value={projectId ?? "all"}
        />
      )}

      <DatePicker
        placeholder="Due Date"
        className="h-12 w-full lg:w-auto"
        value={dueDate ? dueDate.toISOString() : ""}
        onChange={(date) => {
          setFilters({ dueDate: date ?? null });
        }}
      />

      {filters && (
        <Button
          size="lg"
          variant="secondary"
          className="ml-auto"
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
