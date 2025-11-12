import MemberAvatar from "@/components/member/MemberAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DottedSeparator from "@/components/ui/dotted-separator";
import { TaskDetailsType } from "@/types";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import OverviewProperty from "./OverviewProperty";
import TaskDate from "./TaskDate";

interface Props {
  data: TaskDetailsType;
  isAllowed: boolean;
}

const TaskOverview = ({ data, isAllowed }: Props) => {
  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Overview</p>

          {isAllowed && (
            <Button
              variant="secondary"
              size="sm"
              asChild
            >
              <Link
                href={`/workspaces/${data.task.workspaceId}/projects/${data.task.projectId}/task/${data.task.id}/edit`}
              >
                <PencilIcon className="size-4 mr-1" />
                Edit
              </Link>
            </Button>
          )}
        </div>

        <DottedSeparator className="my-4" />

        <div className="flex flex-col gap-y-4">
          <OverviewProperty label="Assignee">
            <MemberAvatar
              name={data.assignee.name}
              image={data.assignee.image ?? undefined}
              className="size-6"
            />
            <p className="text-sm font-medium">{data.assignee.name}</p>
          </OverviewProperty>

          <OverviewProperty label="Due Date">
            <TaskDate
              date={data.task.dueDate}
              completedDate={data.task.completedDate}
              status={data.task.status}
              className="text-sm font-medium"
            />
          </OverviewProperty>

          <OverviewProperty label="Status">
            <Badge variant={data.task.status}>{data.task.status}</Badge>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};

export default TaskOverview;
