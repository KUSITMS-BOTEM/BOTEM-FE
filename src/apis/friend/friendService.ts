import { clientApi } from "@/apis/client";
import type {
  FriendListResponse,
  FriendProfileResponse,
  FriendWishDetailResponse,
  GuestFriendProfileResponse,
} from "@/types/friend/friend";

export const friendService = {
  getFriends: () => clientApi.get<FriendListResponse>("/api/friends"),
  getFriendProfile: (friendId: string) =>
    clientApi.get<FriendProfileResponse>(`/api/friends/${friendId}/profile`),
  getFriendWish: (friendId: string, wishId: string) =>
    clientApi.get<FriendWishDetailResponse>(`/api/friends/${friendId}/wishes/${wishId}`),
  // TODO(API): 비로그인 공개 프로필 API가 나오면 경로·식별자(userId/공유 키)를 맞춘다
  getGuestFriendProfile: (userId: string) =>
    clientApi.get<GuestFriendProfileResponse>(`/api/friends/${userId}/public`),
};
