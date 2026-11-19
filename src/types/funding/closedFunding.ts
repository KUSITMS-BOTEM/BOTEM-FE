import type { FundingType } from "@/types/home/home";

export type GiftVerificationStatus = "REQUIRED" | "COMPLETED";

export type ClosedFundingResponse = {
  fundingId: number;
  type: FundingType;
  productName: string;
  productImageUrl: string;
  deadline: string;
  targetReached: boolean;
  participantCount: number;
  recipientName: string | null;
  giftVerificationStatus: GiftVerificationStatus | null;
};

export type ClosedFundingListResponse = {
  fundings: ClosedFundingResponse[];
};
