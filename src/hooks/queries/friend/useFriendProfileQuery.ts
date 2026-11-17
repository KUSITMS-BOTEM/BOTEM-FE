import { useQuery } from "@tanstack/react-query";

import { friendService } from "@/apis/friend/friendService";

export const useFriendProfileQuery = (friendId: string) =>
  useQuery({
    queryKey: ["friends", friendId],
    queryFn: () => friendService.getFriendProfile(friendId),
    // 친구 프로필 화면이 재시도 UI를 직접 보여주므로 전역 에러 다이얼로그를 띄우지 않는다
    meta: { skipGlobalError: true },
  });
