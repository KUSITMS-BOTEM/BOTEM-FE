import { useQuery } from "@tanstack/react-query";

import { friendService } from "@/apis/friend/friendService";

export const useFriendsQuery = () =>
  useQuery({
    queryKey: ["friends"],
    queryFn: friendService.getFriends,
  });
