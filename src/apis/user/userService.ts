import { clientApi } from "@/apis/client";
import type { RegisterOnboardingRequest } from "@/types/user/onboarding";
import type { MyProfile } from "@/types/user/profile";

export const userService = {
  getMyProfile: () => clientApi.get<MyProfile>("/api/users/me/profile"),
  completeOnboarding: (body: RegisterOnboardingRequest) =>
    clientApi.post<null>("/api/users/me/onboarding", body),
};
