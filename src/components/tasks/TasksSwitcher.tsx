import { Button } from "@/components/ui/button";
import DottedSeparator from "@/components/ui/dotted-separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateTaskModal } from "@/hooks/useCreateTaskModal";
import { useTasksFilters } from "@/hooks/useTasksFilters";
import { allowedMod } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { MemberRoleType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import DataCalendar from "./DataCalendar";
import DataKanban from "./DataKanban";
import { DataTable } from "./DataTable";
import { getTaskColumns } from "./TaskColumns";
import TaskFilters from "./TaskFilters";

interface Props {
  workspaceId: string;
  projectId?: string;
  project: boolean;
  role: MemberRoleType;
}

const TasksSwitcher = ({
  projectId,
  workspaceId,
  project = false,
  role,
}: Props) => {
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const trpc = useTRPC();
  const { open } = useCreateTaskModal();

  const [{ assigneeId, dueDate, search, status, projectId: id }] =
    useTasksFilters();

  const { data: tasks, isLoading: isLoadingTasks } = useQuery(
    trpc.task.getMany.queryOptions({
      workspaceId,
      projectId: projectId ?? id,
      assigneeId,
      dueDate,
      search,
      status,
    })
  );

  const tabs = [
    {
      label: "Table",
      value: "table",
    },
    ...(!project
      ? [
          {
            label: "Kanban",
            value: "kanban",
          },
        ]
      : []),

    {
      label: "Calender",
      value: "calender",
    },
  ];

  const taskColumns = getTaskColumns(project, role);
  const isAllowed = allowedMod.includes(role);

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

          {isAllowed && (
            <Button
              size="sm"
              className="w-full lg:w-auto"
              onClick={open}
            >
              <PlusIcon className="size-4" /> New
            </Button>
          )}
        </div>

        <DottedSeparator className="my-4" />

        <TaskFilters hideProjectFilter={!project} />

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

            {!project && (
              <TabsContent
                value="kanban"
                className="mt-0"
              >
                <DataKanban
                  data={tasks ?? []}
                  projectId={projectId ?? ""}
                  workspaceId={workspaceId}
                />
              </TabsContent>
            )}

            <TabsContent
              value="calender"
              className="mt-0"
            >
              <DataCalendar data={tasks ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};

export default TasksSwitcher;
