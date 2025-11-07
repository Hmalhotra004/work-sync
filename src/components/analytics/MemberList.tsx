import DottedSeparator from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProjectModal } from "@/hooks/useCreateProjectModal";
import { MemberType } from "@/types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import MemberAvatar from "../member/MemberAvatar";

interface Props {
  members: MemberType[];
  total: number;
  workspaceId: string;
}

const MemberList = ({ members, total, workspaceId }: Props) => {
  const { open } = useCreateProjectModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Members ({total})</p>

          <Button
            variant="muted"
            size="icon"
            onClick={open}
          >
            <PlusIcon className="size-4 text-foreground-400" />
          </Button>
        </div>

        <DottedSeparator className="my-4" />

        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {members.map((member) => {
            return (
              <li key={member.memberId}>
                <Card className="shadow-none rounded-lg overflow-hidden">
                  <CardContent className="flex flex-col items-center gap-x-2">
                    <MemberAvatar
                      name={member.name}
                      image={member.image ?? undefined}
                      className="size-10"
                      fallbackClassName="text-base"
                    />

                    <div className="flex flex-col items-center overflow-hidden">
                      <p className="text-lg font-medium truncate">
                        {member.name}
                      </p>

                      <p className="text-sm font-medium truncate">
                        {member.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}

          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No Members Found
          </li>
        </ul>

        <Button
          variant="muted"
          className="mt-4 w-full"
          asChild
        >
          <Link href={`/workspaces/${workspaceId}/members`}>Show All</Link>
        </Button>
      </div>
    </div>
  );
};

export default MemberList;
