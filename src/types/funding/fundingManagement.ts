import type { FundingProduct } from "@/types/funding/fundingDetail";
import type { FundingType } from "@/types/home/home";

export type CloseFundingResponse = {
  fundingId: number;
  type: FundingType;
  status: string;
  deadline: string;
  revealAt: string | null;
  earlyClosedAt: string;
};

export type ExtendFundingRequest = {
  // "YYYY-MM-DD"
  newDeadline: string;
};

export type ExtendFundingResponse = {
  fundingId: number;
  status: string;
  deadline: string;
  extensionCount: number;
  extendedAt: string;
};

export type ChangeFundingProductRequest = {
  wishId: number;
};

export type ChangeFundingProductResponse = {
  fundingId: number;
  product: FundingProduct;
  productChangedAt: string;
};

export type GiftChoiceResponse = {
  fundingId: number;
  // 서프라이즈는 선물 인증을 하지 않아 null
  giftVerificationId: number | null;
  productName: string;
  productImageUrl: string;
  productUrl: string;
};
