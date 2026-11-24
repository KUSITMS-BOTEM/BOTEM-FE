import { useQuery } from "@tanstack/react-query";

import { fundingService } from "@/apis/funding/fundingService";

export const surpriseThankCardFriendsQueryKey = (fundingId: number) =>
  ["fundings", fundingId, "surprise", "thank-card-friends"] as const;

// 목록 시트를 열 때만 조회한다
export const useSurpriseThankCardFriendsQuery = (fundingId: number, enabled = true) =>
  useQuery({
    queryKey: surpriseThankCardFriendsQueryKey(fundingId),
    queryFn: () => fundingService.getSurpriseThankCardFriends(fundingId),
    enabled,
  });
