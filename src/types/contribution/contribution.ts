// 백엔드 스펙이 아직 없어 Figma(입금 확인 바텀시트)와 결제UX 설계 문서 기준으로 가정한 형태다. 스펙이 나오면 맞출 것
export type ContributionStatus = "PENDING" | "CONFIRMED" | "REJECTED";

export type PendingContributionResponse = {
  contributionId: number;
  senderName: string;
  depositMethod: string;
};

export type PendingContributionListResponse = {
  contributions: PendingContributionResponse[];
};

export type UpdateContributionStatusRequest = {
  contributionIds: number[];
  status: ContributionStatus;
};
