"use client";

import DottedSeparator from "@/components/DottedSeparator";
import MemberAvatar from "@/components/member/MemberAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MoreVerticalIcon } from "lucide-react";
import { Fragment } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  workspaceId: string;
  userId: string;
}

const WorkspaceMembersView = ({ workspaceId, userId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
  );

  async function handleRoleChange(
    memberId: string,
    role: "admin" | "mod" | "member"
  ) {}

  async function handleRemove(memberId: string) {}

  return (
    <div className="w-full">
      <Card className="w-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 px-7">
          <CardTitle className="text-xl font-bold">Members List</CardTitle>
        </CardHeader>

        <div className="px-7">
          <DottedSeparator />
        </div>

        <CardContent className="px-7">
          {data.members.map((m, idx) => {
            return (
              <Fragment key={m.memberId}>
                <div className="flex items-center gap-[9px]">
                  <MemberAvatar
                    name={m.name}
                    image={m.image ?? undefined}
                    className="size-10"
                    fallbackClassName="text-lg"
                  />

                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>

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
                        onClick={() => handleRoleChange(m.memberId, "mod")}
                      >
                        Set as Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="font-medium cursor-pointer text-rose-500"
                        onClick={() => handleRemove(m.memberId)}
                      >
                        Remove {m.name}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {idx < data.pagination.total - 1 && (
                  <Separator className="my-3" />
                )}
              </Fragment>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceMembersView;
