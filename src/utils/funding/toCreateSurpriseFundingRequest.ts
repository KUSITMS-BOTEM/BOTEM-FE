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
  showOnRecipientProfile: boolean,
): CreateSurpriseFundingRequest {
  return {
    recipientId: Number(recipientId),
    wishId,
    bank: account.bank,
    accountNumber: account.accountNumber,
    targetAmount: Number(info.targetAmount),
    deadline: info.deadline,
    revealAt: info.revealDate,
    showOnRecipientProfile,
  };
}
