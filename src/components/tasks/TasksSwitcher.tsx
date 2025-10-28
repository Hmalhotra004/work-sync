import DottedSeparator from "@/components/DottedSeparator";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateTaskModal } from "@/hooks/useCreateTaskModal";
import { useTasksFilters } from "@/hooks/useTasksFilters";
import { tabs } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { DataTable } from "./DataTable";
import { getTaskColumns } from "./TaskColumns";
import TaskFilters from "./TaskFilters";

interface Props {
  workspaceId: string;
  projectId: string;
}

const TasksSwitcher = ({ projectId, workspaceId }: Props) => {
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const [{ assigneeId, dueDate, search, status }] = useTasksFilters();

  const trpc = useTRPC();

  const { open } = useCreateTaskModal();

  const { data: tasks, isLoading: isLoadingTasks } = useQuery(
    trpc.task.getMany.queryOptions({
      workspaceId,
      projectId,
      assigneeId,
      dueDate,
      status,
      search,
    })
  );

  const taskColumns = getTaskColumns(false);

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 w-full border rounded-lg"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            {tabs.map((t, idx) => (
              <TabsTrigger
                key={idx}
                className="h-8 w-full lg:w-auto"
                value={t.value}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            size="sm"
            className="w-full lg:w-auto"
            onClick={open}
          >
            <PlusIcon className="size-4" /> New
          </Button>
        </div>

        <DottedSeparator className="my-4" />

        <TaskFilters hideProjectFilter />

        <DottedSeparator className="my-4" />

        {isLoadingTasks ? (
          <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
            <Spinner className="size-5" />
          </div>
        ) : (
          <>
            <TabsContent
              value="table"
              className="mt-0"
            >
              <DataTable
                data={tasks ?? []}
                columns={taskColumns}
              />
            </TabsContent>

            <TabsContent
              value="kanban"
              className="mt-0"
            >
              kanban
            </TabsContent>

            <TabsContent
              value="calender"
              className="mt-0"
            >
              Ch
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};

export default TasksSwitcher;
