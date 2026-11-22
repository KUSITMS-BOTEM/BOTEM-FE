import type { BankCode } from "@/constants/bank";
import type { FundingType } from "@/types/home/home";

// 펀딩 열기 흐름이 쓰는 상품 정보. 내 위시(WishResponse)와 친구 위시를 모두 받을 수 있게 필요한 필드만 둔다
export type FundingWish = {
  id: number;
  productName: string;
  productImageUrl?: string;
  price: number;
};

export type CreateFundingRequest = {
  wishId: number;
  bank: BankCode;
  accountNumber: string;
  targetAmount: number;
  // "YYYY-MM-DD"
  deadline: string;
  story: string;
  promise?: string;
};

export type CreateSurpriseFundingRequest = {
  recipientId: number;
  wishId: number;
  bank: BankCode;
  accountNumber: string;
  targetAmount: number;
  // "YYYY-MM-DD"
  deadline: string;
  // "YYYY-MM-DD" (서버가 해당 날짜 00:00으로 저장)
  revealAt: string;
  showOnRecipientProfile: boolean;
};

export type CreateFundingResponse = {
  fundingId: number;
  shareKey: string;
  type: FundingType;
  status: string;
  shareUrl: string;
  // 서버가 요청 날짜를 저장 시각으로 정규화한 값. "2026-12-12T23:59:59.999999"
  deadline?: string;
  // 서프라이즈만 값이 있다. "2026-12-15T00:00:00"
  revealAt?: string | null;
};
