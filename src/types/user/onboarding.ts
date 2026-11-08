import type { BankCode } from "@/constants/bank";

export type RegisterOnboardingRequest = {
  name: string;
  birthday?: string | null;
  bank: BankCode;
  accountNumber: string;
};
