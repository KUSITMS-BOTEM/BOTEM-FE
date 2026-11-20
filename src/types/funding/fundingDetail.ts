import type { FundingType } from "@/types/home/home";

export type FundingProduct = {
  name: string;
  imageUrl: string;
  price: number;
  url: string;
};

export type FundingDisplayStatus =
  "IN_PROGRESS" | "TARGET_REACHED" | "CLOSED" | "GIFT_PREPARING" | "COMPLETED";

export type FundingDetailParticipant = {
  order: number;
  name: string;
  profileImageUrl: string | null;
};

// TODO(API): Swagger에 giftVerification·thankCard 하위 스키마가 없어 API 설명 문구 기준으로 추정한 필드다. BE 스펙이 나오면 맞출 것
export type FundingDetailGiftVerification = {
  imageUrl: string;
  thankYouMessage: string | null;
  completedAt: string;
};

export type FundingDetailThankCard = {
  message: string;
  sentAt: string;
};

export type FundingDetailResponse = {
  fundingId: number;
  type: FundingType;
  title: string | null;
  product: FundingProduct;
  productChanged: boolean;
  productChangedAt: string | null;
  story: string | null;
  promise: string | null;
  deadline: string;
  remainingDays: number | null;
  confirmedPercentage: number;
  pendingPercentage: number;
  participantCount: number;
  participants: FundingDetailParticipant[];
  displayStatus: FundingDisplayStatus;
  canContributeAmount: boolean;
  canParticipate: boolean;
  ownerPreview: boolean;
  giftVerification: FundingDetailGiftVerification | null;
  thankCard: FundingDetailThankCard | null;
};
