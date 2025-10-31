import MemberAvatar from "@/components/member/MemberAvatar";
import ProjectAvatar from "@/components/project/ProjectAvatar";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { cn } from "@/lib/utils";
import { CalendarEventType, TaskStatusType } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  data: CalendarEventType;
}

const statusColorMap: Record<TaskStatusType, string> = {
  Backlog: "border-l-red-500",
  Todo: "border-l-slate-200",
  "In Progress": "border-l-amber-300",
  "In Review": "border-l-sky-300",
  Done: "border-l-emerald-400",
};

const EventCard = ({ data }: Props) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();

    router.push(
      `/workspaces/${workspaceId}/projects/${data.project.id}/task/${data.id}`
    );
  }
  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
          statusColorMap[data.status]
        )}
      >
        <p>{data.title}</p>

        <div className="flex items-center gap-x-1">
          <MemberAvatar
            name={data.assignee.name!}
            image={data.assignee.image ?? undefined}
          />

          <div className="size-1 rounded-full bg-foreground-300" />

          <ProjectAvatar
            name={data.project.name!}
            image={data.project.image ?? undefined}
            className="size-5"
            fallbackClassName="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
