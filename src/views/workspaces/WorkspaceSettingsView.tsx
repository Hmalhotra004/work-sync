"use client";

import WorkspaceForm from "@/components/workspace/WorkspaceForm";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  id: string;
}

const WorkspaceSettingsView = ({ id }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.workspace.getOne.queryOptions({ id }));

  return (
    <div>
      <WorkspaceForm initialValues={data} />
    </div>
  );
};

export default WorkspaceSettingsView;
