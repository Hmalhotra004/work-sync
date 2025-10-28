"use client";

import DottedSeparator from "@/components/DottedSeparator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkspaceForm from "@/components/workspace/WorkspaceForm";

const CreateWorkspaceView = () => {
  return (
    <div className="h-full w-full lg:max-w-xl">
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex px-7">
          <CardTitle className="text-xl font-bold">
            Create a new workspace
          </CardTitle>
        </CardHeader>

        <div className="px-7">
          <DottedSeparator />
        </div>

        <CardContent className="px-7">
          <WorkspaceForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWorkspaceView;
