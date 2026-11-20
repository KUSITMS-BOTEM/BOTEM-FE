"use client";

import type { ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import FundingDetailLoader from "@/widgets/funding/FundingDetailLoader";

type FundingShareContainerProps = {
  fundingId: string;
  memberIntent?: ShareMemberIntent;
  isLoggedIn?: boolean;
};

export default function FundingShareContainer({
  fundingId,
  memberIntent,
  isLoggedIn,
}: FundingShareContainerProps) {
  return (
    <FundingDetailLoader
      fundingId={fundingId}
      memberIntent={memberIntent}
      isLoggedIn={isLoggedIn}
    />
  );
}
