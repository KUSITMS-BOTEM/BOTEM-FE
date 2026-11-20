"use client";

import type { ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import FundingDetailLoader from "@/widgets/funding/FundingDetailLoader";

type FundingShareContainerProps = {
  shareKey: string;
  memberIntent?: ShareMemberIntent;
  isLoggedIn?: boolean;
};

export default function FundingShareContainer({
  shareKey,
  memberIntent,
  isLoggedIn,
}: FundingShareContainerProps) {
  return (
    <FundingDetailLoader shareKey={shareKey} memberIntent={memberIntent} isLoggedIn={isLoggedIn} />
  );
}
