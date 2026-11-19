import type { BankCode } from "@/constants/bank";
import type { FundingType } from "@/types/home/home";

export type FundingRevealResponse = {
  contributorNames: string[];
  totalAmount: number;
  goalAchieved: boolean;
};

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

export type CreateFundingResponse = {
  fundingId: number;
  type: FundingType;
  status: string;
  shareUrl: string;
};
