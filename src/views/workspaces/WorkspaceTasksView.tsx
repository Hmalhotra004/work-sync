"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  id: string;
}

const WorkspaceTasksView = ({ id }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.workspace.getOne.queryOptions({ id }));

  return <div>WorkspaceTasksView</div>;
};

export default WorkspaceTasksView;
