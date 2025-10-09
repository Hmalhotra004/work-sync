"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { RiAddCircleFill } from "react-icons/ri";
import Loader from "./Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import WorkspaceAvatar from "./workspace/WorkspaceAvatar";

const WorkspaceSwitcher = () => {
  const trpc = useTRPC();

  const { data: workspaces, isLoading } = useQuery(
    trpc.workspace.getMany.queryOptions()
  );

  if (isLoading) return <Loader className="mx-auto" />;

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-foreground-500">Workspaces</p>
        <RiAddCircleFill className="size-5 text-foreground-500 cursor-pointer hover:opacity-75 transition" />
      </div>
      <Select>
        <SelectTrigger className="w-full bg-background-200 font-medium p-1">
          <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.map((w) => {
            return (
              <SelectItem
                key={w.id}
                value={w.id}
              >
                <div className="flex justify-start items-center gap-3 font-medium">
                  <WorkspaceAvatar
                    name={w.name}
                    image={w.image ?? undefined}
                  />
                  <span className="truncate">{w.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WorkspaceSwitcher;
