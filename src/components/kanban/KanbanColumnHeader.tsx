import { Button } from "@/components/ui/button";
import { useCreateTaskModal } from "@/hooks/useCreateTaskModal";
import { TaskStatusType } from "@/types";
import { ReactNode } from "react";

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
  PlusIcon,
} from "lucide-react";

interface Props {
  board: TaskStatusType;
  taskCount: number;
}

const statusIconMap: Record<TaskStatusType, ReactNode> = {
  Backlog: <CircleDashedIcon className="size-[18px] text-red-500" />,
  Todo: <CircleIcon className="size-[18px] text-slate-400" />,
  "In Progress": <CircleDotDashedIcon className="size-[18px] text-amber-300" />,
  "In Review": <CircleDotIcon className="size-[18px] text-sky-300" />,
  Done: <CircleCheckIcon className="size-[18px] text-emerald-400" />,
};

const KanbanColumnHeader = ({ board, taskCount }: Props) => {
  const { open } = useCreateTaskModal();

  const icon = statusIconMap[board];
  return (
    <div className="px-2 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium">{board}</h2>
        <div className="size-5 flex items-center justify-center rounded-md bg-background-200 text-xs text-neutral-700 font-medium">
          {taskCount}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-5"
        onClick={open}
      >
        <PlusIcon className="size-4 text-foreground-500" />
      </Button>
    </div>
  );
};

export default KanbanColumnHeader;
