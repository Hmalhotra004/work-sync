"use client";

import DottedSeparator from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Props {
  workspaceId: string;
  code: string;
}

const JoinWorkspaceView = ({ code, workspaceId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data } = useSuspenseQuery(
    trpc.workspace.getWorkspaceInfo.queryOptions({ workspaceId })
  );

  const join = useMutation(
    trpc.workspace.join.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.workspace.getMany.queryOptions()
        );
        toast.success("Workspace Joined");
        router.replace(`/workspaces/${workspaceId}`);
      },
      onError: (err) => toast.error(err.message),
    })
  );

  function handleCancel() {
    router.replace(`/`);
  }

  const isPending = join.isPending;

  return (
    <div className="w-full lg:max-w-xl">
      <Card className="w-full border-none shadow-none">
        <CardHeader className="px-7">
          <CardTitle className="text-xl font-bold">Join workspace</CardTitle>
          <CardDescription>
            you&apos;ve been invited to join <strong>{data.name}</strong>{" "}
            workspace
          </CardDescription>
        </CardHeader>

        <div className="px-7">
          <DottedSeparator />
        </div>

        <CardContent className="px-7">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={async () =>
                await join.mutateAsync({ code, workspaceId })
              }
              disabled={isPending}
            >
              Join
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinWorkspaceView;
