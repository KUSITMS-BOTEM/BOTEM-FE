import type { CreateFundingRequest } from "@/types/funding/funding";

type FundingInfoInput = {
  targetAmount: string;
  deadline: string;
  story: string;
  pledge: string;
};

export function toCreateFundingRequest(
  wishId: number,
  info: FundingInfoInput,
  account: Pick<CreateFundingRequest, "bank" | "accountNumber">,
): CreateFundingRequest {
  return {
    wishId,
    bank: account.bank,
    accountNumber: account.accountNumber,
    targetAmount: Number(info.targetAmount),
    deadline: info.deadline,
    story: info.story,
    promise: info.pledge || undefined,
  };
}
