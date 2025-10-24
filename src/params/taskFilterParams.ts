import { TaskStatusEnum } from "@/types";
import { createLoader, parseAsString, parseAsStringEnum } from "nuqs/server";

export const taskFilterParams = {
  projectId: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  assigneeId: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
  dueDate: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum(Object.values(TaskStatusEnum)),
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const loadSearchParams = createLoader(taskFilterParams);

export const normalizeTaskFilters = (
  filters: Awaited<ReturnType<typeof loadSearchParams>>
) => {
  return {
    projectId: filters.projectId || undefined,
    assigneeId: filters.assigneeId || undefined,
    search: filters.search || undefined,
    status: filters.status || undefined,
    dueDate: filters.dueDate ? new Date(filters.dueDate) : undefined,
  };
};
