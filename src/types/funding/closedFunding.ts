import type { FundingType } from "@/types/home/home";

export type ClosedFundingRelationship = "OPENED" | "RECEIVED" | "PARTICIPATED";

export type ClosedFundingRepresentativeMessageResponse = {
  writerName: string;
  writerProfileImageUrl: string | null;
  content: string | null;
  paperTemplateCode: string;
  hasVoice: boolean;
};

export type ClosedFundingResponse = {
  fundingId: number;
  relationship: ClosedFundingRelationship;
  fundingType: FundingType;
  opener: { name: string; profileImageUrl: string | null };
  celebrantName: string;
  deadline: string;
  productName: string;
  productImageUrl: string;
  // 롤링페이퍼 공개 전에는 두 값 모두 null
  rollingPaperCount: number | null;
  representativeMessage: ClosedFundingRepresentativeMessageResponse | null;
};

export type ClosedFundingYearResponse = {
  year: number;
  fundingCount: number;
  fundings: ClosedFundingResponse[];
};

export type ClosedFundingListResponse = {
  tabCounts: { all: number; received: number; participated: number };
  years: ClosedFundingYearResponse[];
};
