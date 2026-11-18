import { useQuery } from "@tanstack/react-query";

import { friendService } from "@/apis/friend/friendService";

export const guestFriendProfileQueryKey = (userId: string) =>
  ["friends", userId, "public"] as const;

export const useGuestFriendProfileQuery = (userId: string) =>
  useQuery({
    queryKey: guestFriendProfileQueryKey(userId),
    queryFn: () => friendService.getGuestFriendProfile(userId),
    // 화면이 재시도 UI를 직접 보여주므로 전역 에러 다이얼로그를 띄우지 않는다
    meta: { skipGlobalError: true },
  });
