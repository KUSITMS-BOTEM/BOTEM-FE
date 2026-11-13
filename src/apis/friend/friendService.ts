import { clientApi } from "@/apis/client";
import type { FriendListResponse } from "@/types/friend/friend";

export const friendService = {
  getFriends: () => clientApi.get<FriendListResponse>("/api/friends"),
};
