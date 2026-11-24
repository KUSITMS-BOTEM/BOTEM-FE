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
    // 공개 화면은 실패 시 메시지 남긴 친구 이름으로 대신하고, 목록 시트는 재시도 UI를 직접 보여준다
    meta: { skipGlobalError: true },
  });
