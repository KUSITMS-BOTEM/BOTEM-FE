import type { PendingContributionItemResponse } from "@/types/contribution/contribution";
import type { FundingManagementResponse } from "@/types/funding/fundingManagement";

export const PENDING_ITEMS: PendingContributionItemResponse[] = [
  {
    contributionId: 1,
    participantName: "하린이",
    profileImageUrl: null,
    participatedAt: "2026-11-18T11:20:00",
    amount: 45000,
  },
  {
    contributionId: 2,
    participantName: "도윤이",
    profileImageUrl: null,
    participatedAt: "2026-11-16T09:05:00",
    amount: 30000,
  },
  {
    contributionId: 3,
    participantName: "서준이",
    profileImageUrl: null,
    participatedAt: "2026-11-16T08:00:00",
    amount: 10000,
  },
];

export const FUNDING_MANAGEMENT = {
  fundingId: 1,
  messageCount: 8,
  pendingContributionCount: PENDING_ITEMS.length,
  participants: [
    {
      contributionId: 1,
      order: 1,
      name: "하린이",
      profileImageUrl: null,
      status: "PENDING_CONFIRMATION",
      participatedAt: "2026-11-18T11:20:00",
      thankCardSent: false,
      thankCardSentAt: null,
    },
  ],
} as FundingManagementResponse;

// useFundingManagementQuery·usePendingContributionItemsQuery를 대체하는 목 반환값
export const HOST_QUERIES = {
  management: { data: FUNDING_MANAGEMENT, isError: false, refetch: () => {} },
  pending: {
    data: { pendingContributionCount: PENDING_ITEMS.length, contributions: PENDING_ITEMS },
    isError: false,
    refetch: () => {},
  },
};
