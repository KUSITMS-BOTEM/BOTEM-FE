import type { CreateFundingRequest, CreateSurpriseFundingRequest } from "@/types/funding/funding";

type SurpriseInfoInput = {
  targetAmount: string;
  deadline: string;
  revealDate: string;
};

export function toCreateSurpriseFundingRequest(
  recipientId: string,
  wishId: number,
  info: SurpriseInfoInput,
  account: Pick<CreateFundingRequest, "bank" | "accountNumber">,
  notifyRecipientFriends: boolean,
): CreateSurpriseFundingRequest {
  return {
    recipientId: Number(recipientId),
    wishId,
    bank: account.bank,
    accountNumber: account.accountNumber,
    targetAmount: Number(info.targetAmount),
    deadline: info.deadline,
    // 공개 시간은 밤 12시(자정)로 고정이다
    revealAt: `${info.revealDate}T00:00:00`,
    notifyRecipientFriends,
  };
}
