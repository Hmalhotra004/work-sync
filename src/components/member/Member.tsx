"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "@/hooks/useConfirm";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { useTRPC } from "@/trpc/client";
import { MemberRoleType, MemberType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreVerticalIcon } from "lucide-react";
import { Fragment } from "react";
import { toast } from "sonner";
import MemberAvatar from "./MemberAvatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  member: MemberType;
  userId: string;
  isNotLast: boolean;
}

const Member = ({ member, isNotLast, userId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const remove = useMutation(
    trpc.member.removeMember.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
        );
        toast.success(`${member.name} Removed`);
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const isHimSelf = member.userId === userId;

  const isAdmin = member.role === "Admin";
  const isMod = member.role === "Moderator";
  const isMember = member.role === "Member";

  const [DeleteDialog, confirmDelete] = useConfirm(
    `Remove ${member.name}`,
    "This action cannot be undone",
    "destructive"
  );

  async function handleRoleChange(memberId: string, role: MemberRoleType) {}

  async function handleRemove() {
    const ok = await confirmDelete();

    if (!ok) return;

    await remove.mutateAsync({
      memberId: member.memberId,
      workspaceId: member.workspaceId,
    });
  }

  return (
    <Fragment key={member.memberId}>
      <DeleteDialog />
      <div className="flex items-center gap-[9px]">
        <MemberAvatar
          name={member.name}
          image={member.image ?? undefined}
          className="size-10"
          fallbackClassName="text-lg"
        />

        <div className="flex flex-col">
          <p className="text-sm font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>

        {!isHimSelf && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="ml-auto"
              >
                <MoreVerticalIcon className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="end"
            >
              <DropdownMenuItem
                className="font-medium cursor-pointer"
                onClick={() => handleRoleChange(member.memberId, "Admin")}
              >
                Promote to Admin
              </DropdownMenuItem>

              <DropdownMenuItem
                className="font-medium cursor-pointer"
                onClick={() => handleRoleChange(member.memberId, "Moderator")}
              >
                Promote to Moderator
              </DropdownMenuItem>

              <DropdownMenuItem
                className="font-medium cursor-pointer text-rose-500 focus:text-rose-700"
                onClick={() => handleRoleChange(member.memberId, "Member")}
              >
                Demote to Member
              </DropdownMenuItem>

              <DropdownMenuItem
                className="font-medium cursor-pointer text-rose-500 focus:text-rose-700"
                onClick={handleRemove}
              >
                Remove {member.name}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isNotLast && <Separator className="my-2.5" />}
    </Fragment>
  );
};

export default Member;
