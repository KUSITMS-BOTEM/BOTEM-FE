"use client";

import type { ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import FundingDetailView from "@/widgets/funding/FundingDetailView";

type FundingShareContainerProps = {
  fundingId: string;
  memberIntent?: ShareMemberIntent;
};

export default function FundingShareContainer({
  fundingId,
  memberIntent,
}: FundingShareContainerProps) {
  return <FundingDetailView fundingId={fundingId} variant="guest" memberIntent={memberIntent} />;
}
