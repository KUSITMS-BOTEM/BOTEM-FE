import { clientApi } from "@/apis/client";
import type { MyProfile } from "@/types/user/profile";

export const userService = {
  getMyProfile: () => clientApi.get<MyProfile>("/api/users/me/profile"),
};
