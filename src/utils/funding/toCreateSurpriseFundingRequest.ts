import type { CreateFundingRequest, CreateSurpriseFundingRequest } from "@/types/funding/funding";

type SurpriseInfoInput = {
  targetAmount: string;
  // 선택 입력이라 정하지 않으면 빈 문자열이거나 없다
  recommendedAmount?: string;
  deadline: string;
  revealDate: string;
};

export function toCreateSurpriseFundingRequest(
  recipientId: string,
  wishId: number,
  info: SurpriseInfoInput,
  account: Pick<CreateFundingRequest, "bank" | "accountNumber">,
  showOnRecipientProfile: boolean,
): CreateSurpriseFundingRequest {
  return {
    recipientId: Number(recipientId),
    wishId,
    bank: account.bank,
    accountNumber: account.accountNumber,
    targetAmount: Number(info.targetAmount),
    recommendedAmount: info.recommendedAmount ? Number(info.recommendedAmount) : undefined,
    deadline: info.deadline,
    revealAt: info.revealDate,
    showOnRecipientProfile,
  };
}
