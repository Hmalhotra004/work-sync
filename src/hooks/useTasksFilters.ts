import { TaskStatusEnum } from "@/types";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

export const useTasksFilters = () => {
  const [filters, setFilters] = useQueryStates({
    projectId: parseAsString,
    status: parseAsStringEnum(Object.values(TaskStatusEnum)),
    assigneeId: parseAsString,
    search: parseAsString,
    dueDate: parseAsString,
  });

  const normalized = {
    projectId: filters.projectId ?? undefined,
    assigneeId: filters.assigneeId ?? undefined,
    search: filters.search ?? undefined,
    status: filters.status ?? undefined,
    dueDate: filters.dueDate ? new Date(filters.dueDate) : undefined,
  };

  return [normalized, setFilters] as const;
};
