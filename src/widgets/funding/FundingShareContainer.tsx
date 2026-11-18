"use client";

import FundingDetailView from "@/widgets/funding/FundingDetailView";

type FundingShareContainerProps = {
  fundingId: string;
};

export default function FundingShareContainer({ fundingId }: FundingShareContainerProps) {
  return <FundingDetailView fundingId={fundingId} variant="guest" />;
}
