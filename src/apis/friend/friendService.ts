import { clientApi } from "@/apis/client";
import type { FriendListResponse, FriendProfileResponse } from "@/types/friend/friend";

export const friendService = {
  getFriends: () => clientApi.get<FriendListResponse>("/api/friends"),
  getFriendProfile: (friendId: string) =>
    clientApi.get<FriendProfileResponse>(`/api/friends/${friendId}`),
};
