import type { FundingDetailResponse } from "@/types/funding/fundingDetail";

export type FundingCompleteData = {
  hostName: string;
  giverName: string;
  contributionOrder: number;
  productName: string;
  productImageUrl: string;
  deadline: string;
};

type ContributionInput = { giverName: string };

export function toFundingCompleteData(
  detail: FundingDetailResponse,
  { giverName }: ContributionInput,
): FundingCompleteData {
  // 서버가 내 참여를 표시해 주지 않아 이름으로 찾고, 못 찾으면 방금 보탠 마지막 순번으로 본다
  const order =
    detail.participants.find(participant => participant.name === giverName)?.order ??
    detail.participantCount;

  return {
    hostName: detail.celebrantName,
    giverName,
    contributionOrder: order,
    productName: detail.product.name,
    productImageUrl: detail.product.imageUrl,
    deadline: detail.deadline,
  };
}
