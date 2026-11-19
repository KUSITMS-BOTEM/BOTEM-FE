import { useQuery } from "@tanstack/react-query";

import { friendService } from "@/apis/friend/friendService";

export const friendsQueryKey = ["friends"] as const;

export const useFriendsQuery = () =>
  useQuery({
    queryKey: friendsQueryKey,
    queryFn: friendService.getFriends,
    // 친구 화면은 재시도 UI를 직접 보여주고, 내 메뉴는 홈 진입 때부터 미리 조회해 실패 시 친구 수만 숨기므로 전역 에러 다이얼로그를 띄우지 않는다
    meta: { skipGlobalError: true },
  });
