import { useQuery } from "@tanstack/react-query";

import { friendService } from "@/apis/friend/friendService";

export const friendsQueryKey = ["friends"] as const;

export const useFriendsQuery = (enabled = true) =>
  useQuery({
    queryKey: friendsQueryKey,
    queryFn: friendService.getFriends,
    enabled,
    // 친구 화면은 재시도 UI를 직접 보여주고, 내 메뉴는 실패 시 직접 다이얼로그를 띄우므로 전역 에러 다이얼로그를 띄우지 않는다
    meta: { skipGlobalError: true },
  });
