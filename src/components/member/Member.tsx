"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "@/hooks/useConfirm";
import { useWorkspaceId } from "@/hooks/useWorkspaceId";
import { canManage } from "@/lib/utils";
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
  autheticatedUser: { id: string; role: MemberRoleType };
  isNotLast: boolean;
}

const Member = ({ member, isNotLast, autheticatedUser }: Props) => {
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

  const update = useMutation(
    trpc.member.updateRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
        );
        toast.success(`Role Updated`);
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const isHimSelf = member.userId === autheticatedUser.id;
  const isAllowed = canManage(autheticatedUser.role, member.role);

  const [DeleteDialog, confirmDelete] = useConfirm(
    `Remove ${member.name}`,
    "This action cannot be undone",
    "destructive"
  );

  async function handleRoleChange(role: MemberRoleType) {
    update.mutateAsync({
      memberId: member.memberId,
      userId: member.userId,
      workspaceId: member.workspaceId,
      previousRole: member.role,
      role,
    });
  }

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

        {!isHimSelf && isAllowed && (
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
              {/* ----- OWNER CONTROLS ----- */}
              {autheticatedUser.role === "Owner" && (
                <>
                  {member.role === "Moderator" && (
                    <DropdownMenuItem
                      className="font-medium cursor-pointer"
                      onClick={() => handleRoleChange("Admin")}
                      disabled={update.isPending}
                    >
                      Promote to Admin
                    </DropdownMenuItem>
                  )}
                  {member.role === "Member" && (
                    <DropdownMenuItem
                      className="font-medium cursor-pointer"
                      onClick={() => handleRoleChange("Moderator")}
                      disabled={update.isPending}
                    >
                      Promote to Moderator
                    </DropdownMenuItem>
                  )}
                  {member.role === "Admin" && (
                    <DropdownMenuItem
                      className="font-medium cursor-pointer text-rose-500 focus:text-rose-700"
                      onClick={() => handleRoleChange("Moderator")}
                      disabled={update.isPending}
                    >
                      Demote to Moderator
                    </DropdownMenuItem>
                  )}
                  {member.role === "Moderator" && (
                    <DropdownMenuItem
                      className="font-medium cursor-pointer text-rose-500 focus:text-rose-700"
                      onClick={() => handleRoleChange("Member")}
                      disabled={update.isPending}
                    >
                      Demote to Member
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {/* ----- ADMIN CONTROLS ----- */}
              {autheticatedUser.role === "Admin" &&
                (member.role === "Moderator" || member.role === "Member") && (
                  <>
                    {/* only mods can be promoted to admin */}
                    {member.role === "Moderator" && (
                      <DropdownMenuItem
                        className="font-medium cursor-pointer"
                        onClick={() => handleRoleChange("Admin")}
                        disabled={update.isPending}
                      >
                        Promote to Admin
                      </DropdownMenuItem>
                    )}

                    {/* members can only be promoted to mod */}
                    {member.role === "Member" && (
                      <DropdownMenuItem
                        className="font-medium cursor-pointer"
                        onClick={() => handleRoleChange("Moderator")}
                        disabled={update.isPending}
                      >
                        Promote to Moderator
                      </DropdownMenuItem>
                    )}

                    {/* demotions follow the hierarchy */}
                    {member.role === "Moderator" && (
                      <DropdownMenuItem
                        className="font-medium cursor-pointer text-rose-500 focus:text-rose-700"
                        onClick={() => handleRoleChange("Member")}
                        disabled={update.isPending}
                      >
                        Demote to Member
                      </DropdownMenuItem>
                    )}
                  </>
                )}

              {/* ----- REMOVE (Owner/Admin can remove allowed roles) ----- */}
              {(autheticatedUser.role === "Owner" ||
                (autheticatedUser.role === "Admin" &&
                  (member.role === "Moderator" ||
                    member.role === "Member"))) && (
                <DropdownMenuItem
                  className="font-medium cursor-pointer text-rose-500 focus:text-rose-700"
                  onClick={handleRemove}
                  disabled={remove.isPending}
                >
                  Remove {member.name}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isNotLast && <Separator className="my-2.5" />}
    </Fragment>
  );
};

export default Member;
