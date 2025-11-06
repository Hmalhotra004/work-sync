import DottedSeparator from "@/components/DottedSeparator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateTaskModal } from "@/hooks/useCreateTaskModal";
import { TaskGetManyType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  tasks: TaskGetManyType[];
  total: number;
  workspaceId: string;
}

const TaskList = ({ tasks, total, workspaceId }: Props) => {
  const { open } = useCreateTaskModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Tasks ({total})</p>

          <Button
            variant="muted"
            size="icon"
            onClick={open}
          >
            <PlusIcon className="size-4 text-foreground-400" />
          </Button>
        </div>

        <DottedSeparator className="my-4" />

        <ul className="flex flex-col gap-y-4">
          {tasks.map((task) => {
            return (
              <li key={task.id}>
                <Link
                  href={`/workspaces/${workspaceId}/projects/${task.projectId}/task/${task.id}`}
                >
                  <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                    <CardContent className="">
                      <p className="text-lg font-medium truncate">
                        {task.name}
                      </p>

                      <div className="flex items-center gap-x-2">
                        <p>{task.projectName}</p>

                        <div className="size-1 rounded-full bg-foreground-300" />

                        <div className="text-sm text-muted-foreground flex items-center">
                          <CalendarIcon className="size-3 mr-1" />

                          <span className="truncate">
                            {formatDistanceToNow(new Date(task.dueDate))}{" "}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}

          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No Tasks Found
          </li>
        </ul>
        <Button
          variant="muted"
          className="mt-4 w-full"
          asChild
        >
          <Link href={`/workspaces/${workspaceId}/tasks`}>Show All</Link>
        </Button>
      </div>
    </div>
  );
};

export default TaskList;
