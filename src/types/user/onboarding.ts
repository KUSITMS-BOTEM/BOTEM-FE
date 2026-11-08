import type { BankCode } from "@/constants/bank";

export type RegisterOnboardingRequest = {
  name: string;
  // 형식: "MM-DD" (연도 없음)
  birthday?: string | null;
  bank: BankCode;
  accountNumber: string;
};
