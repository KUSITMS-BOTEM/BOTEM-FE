import { useMutation, useQueryClient } from "@tanstack/react-query";

import { friendService } from "@/apis/friend/friendService";
import { friendsQueryKey } from "@/hooks/queries/friend/useFriendsQuery";
import { wishProfileQueryKey } from "@/hooks/queries/wish-profile/useWishProfileQuery";

export const useAddFriendMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wishProfileKey: string) => friendService.addFriend({ wishProfileKey }),
    // 위시 프로필 화면이 실패 안내와 재시도를 직접 보여준다
    meta: { skipGlobalError: true },
    // 응답 본문이 없어 무효화한다. 친구 목록·친구 수와, 친구가 되면 위시가 열리는 위시 프로필을 이동 전에 다시 받게 한다
    onSuccess: (_, wishProfileKey) => {
      queryClient.invalidateQueries({ queryKey: friendsQueryKey });
      queryClient.invalidateQueries({ queryKey: wishProfileQueryKey(wishProfileKey) });
    },
  });
};
