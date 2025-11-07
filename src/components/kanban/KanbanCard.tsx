"use client";

import MemberAvatar from "@/components/member/MemberAvatar";
import TaskActions from "@/components/tasks/TaskActions";
import TaskDate from "@/components/tasks/TaskDate";
import DottedSeparator from "@/components/ui/dotted-separator";
import { TaskGetManyType } from "@/types";
import { MoreHorizontalIcon } from "lucide-react";

interface Props {
  task: TaskGetManyType;
}

const KanbanCard = ({ task }: Props) => {
  return (
    <div className="bg-white p-2.5 mb-1.5 rounded shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-x-2">
        <p className="text-sm line-clamp-2">{task.name}</p>
        <TaskActions
          id={task.id}
          projectId={task.projectId!}
        >
          <MoreHorizontalIcon className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition" />
        </TaskActions>
      </div>

      <DottedSeparator />

      <div className="flex items-center gap-x-1.5">
        <MemberAvatar
          name={task.assigneeName ?? ""}
          image={task.assigneeImage ?? undefined}
          fallbackClassName="text-[10px]"
        />

        <div className="size-1 rounded-full bg-foreground-300" />

        <TaskDate
          date={task.dueDate}
          status={task.status}
          className="text-xs"
          hideDetails
        />
      </div>

      {/* <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={task.projectName}
          fallbackClassName="text-[10px]"
        />
        <span className="text-xs font-medium">{task.projectName}</span>
      </div> */}
    </div>
  );
};

export default KanbanCard;
