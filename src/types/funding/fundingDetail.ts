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
  // '{이름}의 생일' 제목의 주인공. 생일 펀딩은 개설자, 서프라이즈는 받는 사람 (이름이 없으면 닉네임)
  celebrantName: string;
  celebrantProfileImageUrl: string | null;
  targetAmount: number;
  product: FundingProduct;
  productChanged: boolean;
  productChangedAt: string | null;
  story: string | null;
  promise: string | null;
  deadline: string;
  extended: boolean;
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
