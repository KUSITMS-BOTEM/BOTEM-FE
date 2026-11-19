import { clientApi } from "@/apis/client";
import type {
  AddFriendRequest,
  FriendListResponse,
  FriendProfileResponse,
  FriendWishDetailResponse,
} from "@/types/friend/friend";

export const friendService = {
  getFriends: () => clientApi.get<FriendListResponse>("/api/friends"),
  addFriend: (body: AddFriendRequest) => clientApi.post<null>("/api/friends", body),
  deleteFriend: (friendId: string) => clientApi.delete<null>(`/api/friends/${friendId}`),
  getFriendProfile: (friendId: string) =>
    clientApi.get<FriendProfileResponse>(`/api/friends/${friendId}/profile`),
  getFriendWish: (friendId: string, wishId: string) =>
    clientApi.get<FriendWishDetailResponse>(`/api/friends/${friendId}/wishes/${wishId}`),
};
