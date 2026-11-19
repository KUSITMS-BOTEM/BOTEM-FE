import { useQuery } from "@tanstack/react-query";

import { friendService } from "@/apis/friend/friendService";
import { friendsQueryKey } from "@/hooks/queries/friend/useFriendsQuery";

export const useFriendWishQuery = (friendId: string, wishId: string) =>
  useQuery({
    queryKey: [...friendsQueryKey, friendId, "wishes", wishId],
    queryFn: () => friendService.getFriendWish(friendId, wishId),
    // 친구 위시 상세 화면이 재시도 UI를 직접 보여주므로 전역 에러 다이얼로그를 띄우지 않는다
    meta: { skipGlobalError: true },
  });
