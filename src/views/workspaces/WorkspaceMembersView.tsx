"use client";

import DottedSeparator from "@/components/DottedSeparator";
import Member from "@/components/member/Member";
import MemberList from "@/components/member/MemberList";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
  userId: string;
}

const WorkspaceMembersView = ({ workspaceId, userId }: Props) => {
  const trpc = useTRPC();

  const { data: members } = useSuspenseQuery(
    trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
  );

  const owners = members.filter((m) => m.role === "Owner");
  const admins = members.filter((m) => m.role === "Admin");
  const mods = members.filter((m) => m.role === "Moderator");
  const mems = members.filter((m) => m.role === "Member");

  const owner = owners[0];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold mb-0.5">Owner</h1>

          <DottedSeparator
            className="mb-2"
            gapSize="4px"
            dotSize="3px"
          />

          <Member
            member={owner}
            isNotLast={false}
            userId={userId}
          />
        </div>

        {admins.length > 0 && (
          <MemberList
            data={admins}
            label="Admins"
            userId={userId}
          />
        )}

        {mods.length > 0 && (
          <MemberList
            data={mods}
            label="Moderators"
            userId={userId}
          />
        )}

        {mems.length > 0 && (
          <MemberList
            data={mems}
            label="Members"
            userId={userId}
          />
        )}
      </div>
    </div>
  );
};

export default WorkspaceMembersView;
