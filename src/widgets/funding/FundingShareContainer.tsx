"use client";

import type { ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import FundingDetailView from "@/widgets/funding/FundingDetailView";

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
    <FundingDetailView
      fundingId={fundingId}
      variant="guest"
      memberIntent={memberIntent}
      isLoggedIn={isLoggedIn}
    />
  );
}
