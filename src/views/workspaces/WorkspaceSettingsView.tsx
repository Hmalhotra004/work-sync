"use client";

import DottedSeparator from "@/components/DottedSeparator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="h-full w-full">
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex px-7">
          <CardTitle className="text-xl font-bold">
            Edit your workspace
          </CardTitle>
        </CardHeader>

        <div className="px-7">
          <DottedSeparator />
        </div>

        <CardContent className="px-7">
          <WorkspaceForm initialValues={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceSettingsView;
