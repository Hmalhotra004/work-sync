"use client";

import DottedSeparator from "@/components/DottedSeparator";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkspaceForm from "@/components/workspace/WorkspaceForm";
import { useConfirm } from "@/hooks/useConfirm";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  id: string;
}

const WorkspaceSettingsView = ({ id }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(trpc.workspace.getOne.queryOptions({ id }));

  const deleteWorkspace = useMutation(
    trpc.workspace.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.workspace.getMany.queryOptions()
        );
        toast.success("Workspace Deleted");
        router.replace("/");
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Workspace",
    "This action cannot be undone",
    "destructive"
  );

  async function handleDelete() {
    const ok = await confirmDelete();

    if (!ok) return;

    await deleteWorkspace.mutateAsync({ id: data.id });
  }

  return (
    <>
      <DeleteDialog />

      <div className="h-full w-full flex flex-col gap-y-2">
        <Card className="w-full border-none shadow-none">
          <CardHeader className="flex px-7">
            <CardTitle className="text-xl font-bold">
              Edit your workspace
            </CardTitle>
            o
          </CardHeader>

          <div className="px-7">
            <DottedSeparator />
          </div>

          <CardContent className="px-7">
            <WorkspaceForm initialValues={data} />
          </CardContent>
        </Card>

        <Card className="w-full border-none shadow-none bg-background-100">
          <CardContent className="px-7">
            <div className="flex max-md:flex-col justify-center">
              <div className="flex flex-col">
                <h3 className="font-bold">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Deleting a workspace is irreversible and will remove all
                  associated data
                </p>
              </div>
              <Button
                variant="destructive"
                type="button"
                className="max-md:mt-6 w-fit ml-auto"
                disabled={deleteWorkspace.isPending}
                onClick={handleDelete}
              >
                {deleteWorkspace.isPending ? <Loader /> : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WorkspaceSettingsView;
