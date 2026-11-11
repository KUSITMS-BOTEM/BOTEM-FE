import type { BankCode } from "@/constants/bank";

export type PayoutAccountVerificationStatus = "UNVERIFIED" | "VERIFYING" | "VERIFIED" | "FAILED";

export type PayoutAccountResponse = {
  id: number;
  bank: BankCode;
  bankName: string;
  accountNumber: string;
  accountHolder: string | null;
  isDefault: boolean;
  verificationStatus: PayoutAccountVerificationStatus;
};
