import { clientApi } from "@/apis/client";
import type { FriendProfileResponse } from "@/types/friend/friend";

export const wishProfileService = {
  getWishProfile: (wishProfileKey: string) =>
    clientApi.get<FriendProfileResponse>(`/api/wish-profiles/${wishProfileKey}`),
};
