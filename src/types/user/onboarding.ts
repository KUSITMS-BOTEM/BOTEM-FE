import type { BankCode } from "@/constants/bank";

export type RegisterOnboardingRequest = {
  name: string;
  // 형식: "MM-DD" (연도 없음)
  birthday?: string | null;
  bank: BankCode;
  accountNumber: string;
  // 생략하면 카카오 프로필 이미지를 유지한다. /profile-image/upload-url이 응답한 imageUrl만 전달 가능
  profileImageUrl?: string | null;
};
