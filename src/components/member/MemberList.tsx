"use client";

import DottedSeparator from "@/components/DottedSeparator";
import { MemberType } from "@/types";
import Member from "./Member";

interface Props {
  label: string;
  data: MemberType[];
  userId: string;
}

const MemberList = ({ data, label, userId }: Props) => {
  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold mb-0.5">{label}</h1>

      <DottedSeparator
        gapSize="4px"
        dotSize="3px"
      />

      <div className="mt-2">
        {data.map((ad, idx) => {
          return (
            <Member
              key={ad.memberId}
              member={ad}
              isNotLast={idx < data.length - 1}
              userId={userId}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MemberList;
