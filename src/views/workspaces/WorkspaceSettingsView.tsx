"use client";

import DottedSeparator from "@/components/DottedSeparator";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WorkspaceForm from "@/components/workspace/WorkspaceForm";
import { useConfirm } from "@/hooks/useConfirm";
import { useTRPC } from "@/trpc/client";
import { CheckIcon, CopyIcon, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

interface Props {
  id: string;
}

const WorkspaceSettingsView = ({ id }: Props) => {
  const [copied, setCopied] = useState(false);
  const [reset, setReset] = useState(false);

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

  const resetCode = useMutation(
    trpc.workspace.resetInviteCode.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.workspace.getOne.queryOptions({ id: data.id })
        );
        router.refresh();
        toast.success("Invite Code reset Success");
      },

      onError: (error) => toast.error(error.message),

      onSettled: () => setReset(false),
    })
  );

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Workspace",
    "This action cannot be undone",
    "destructive"
  );

  const [ResetDialog, confirmReset] = useConfirm(
    "Reset Invite Link",
    "This will invalidate the current invite link",
    "destructive"
  );

  async function handleDelete() {
    const ok = await confirmDelete();

    if (!ok) return;

    await deleteWorkspace.mutateAsync({ id: data.id });
  }

  async function handleReset() {
    const ok = await confirmReset();

    if (!ok) return;
    setReset(true);

    await resetCode.mutateAsync({ id: data.id });
  }

  async function handleCopyInviteLink() {
    setCopied(true);

    navigator.clipboard.writeText(fullInviteLink).then(() => {
      toast.success("Copied");
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  }

  const fullInviteLink = `${window.location.origin}/workspaces/${data.id}/join/${data.inviteCode}`;

  return (
    <>
      <DeleteDialog />
      <ResetDialog />

      <div className="h-full w-full flex flex-col gap-y-2">
        <Card className="w-full border-none shadow-none">
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

        <Card className="w-full border-none shadow-none bg-background-100">
          <CardContent className="px-7">
            <div className="flex flex-col justify-center">
              <div className="flex flex-col">
                <h3 className="font-bold">Invite Members</h3>
                <p className="text-sm text-muted-foreground">
                  Use the invite link to add members to your workspace.
                </p>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-x-2">
                  <Input
                    disabled
                    value={fullInviteLink}
                  />
                  <Button
                    variant="teritary"
                    className="size-12"
                    onClick={handleCopyInviteLink}
                    disabled={resetCode.isPending}
                  >
                    {copied ? (
                      <CheckIcon className="size-5" />
                    ) : (
                      <CopyIcon className="size-5" />
                    )}
                  </Button>
                  <Button
                    variant="teritary"
                    className="size-12"
                    onClick={handleReset}
                    disabled={resetCode.isPending}
                  >
                    {reset ? (
                      <Loader className="size-5" />
                    ) : (
                      <RefreshCcw className="size-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.role === "Owner" && (
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
        )}
      </div>
    </>
  );
};

export default WorkspaceSettingsView;
