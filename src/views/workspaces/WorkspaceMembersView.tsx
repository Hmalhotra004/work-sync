"use client";

import DottedSeparator from "@/components/dotted-separator";
import Member from "@/components/member/Member";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
}

const WorkspaceMembersView = ({ workspaceId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.member.getWorkspaceMembers.queryOptions({ workspaceId })
  );

  const owners = data.members.filter((m) => m.role === "Owner");
  const admins = data.members.filter((m) => m.role === "Admin");
  const mods = data.members.filter((m) => m.role === "Moderator");
  const mems = data.members.filter((m) => m.role === "Member");

  const memberList = [
    {
      label: "Owner",
      members: owners,
    },
    ...(admins.length > 0
      ? [
          {
            label: "Admins",
            members: admins,
          },
        ]
      : []),
    ...(mods.length > 0
      ? [
          {
            label: "Moderators",
            members: mods,
          },
        ]
      : []),
    ...(mems.length > 0
      ? [
          {
            label: "Members",
            members: mems,
          },
        ]
      : []),
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-y-6">
        {memberList.map((d, idx) => {
          return (
            <div
              className="flex flex-col"
              key={idx}
            >
              <h1 className="text-xl font-bold mb-0.5">{d.label}</h1>

              <DottedSeparator
                gapSize="4px"
                dotSize="3px"
              />

              <div className="mt-2">
                {d.members.map((mem, index) => {
                  return (
                    <Member
                      key={mem.memberId}
                      member={mem}
                      isNotLast={index < d.members.length - 1}
                      autheticatedUser={data.autheticatedUser}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkspaceMembersView;
