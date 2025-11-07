"use client";

import DottedSeparator from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirm } from "@/hooks/useConfirm";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Loader from "@/components/Loader";
import ProjectForm from "@/components/project/ProjectForm";
import { Button } from "@/components/ui/button";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

interface Props {
  projectId: string;
  workspaceId: string;
}

const ProjectSettingsView = ({ projectId, workspaceId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(
    trpc.project.getOne.queryOptions({ projectId, workspaceId })
  );

  const deleteProject = useMutation(
    trpc.project.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.project.getMany.queryOptions({ workspaceId })
        );
        toast.success("Project Deleted");
        router.replace(`/workspaces/${workspaceId}`);
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Project",
    "This action cannot be undone",
    "destructive"
  );

  async function handleDelete() {
    const ok = await confirmDelete();

    if (!ok) return;

    await deleteProject.mutateAsync({ projectId, workspaceId });
  }

  return (
    <>
      <DeleteDialog />

      <div className="h-full w-full flex flex-col gap-y-2">
        <Card className="w-full border-none shadow-none p-0 pb-4">
          <CardHeader className="flex px-0">
            <CardTitle className="text-xl font-bold">
              Edit your Project
            </CardTitle>
          </CardHeader>

          <DottedSeparator />

          <CardContent className="px-0">
            <ProjectForm initialValues={data} />
          </CardContent>
        </Card>

        <Card className="w-full border-none shadow-none bg-background-100">
          <CardContent className="px-7">
            <div className="flex max-md:flex-col justify-center">
              <div className="flex flex-col">
                <h3 className="font-bold">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Deleting a project is irreversible and will remove all
                  associated data
                </p>
              </div>
              <Button
                variant="destructive"
                type="button"
                className="max-md:mt-6 w-fit ml-auto"
                disabled={deleteProject.isPending}
                onClick={handleDelete}
              >
                {deleteProject.isPending ? <Loader /> : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProjectSettingsView;
