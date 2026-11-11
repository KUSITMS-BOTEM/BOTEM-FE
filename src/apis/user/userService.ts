import { clientApi } from "@/apis/client";
import type { RegisterOnboardingRequest } from "@/types/user/onboarding";
import type { MyProfile } from "@/types/user/profile";
import type {
  CreateProfileImageUploadUrlRequest,
  ProfileImageUploadUrlResponse,
} from "@/types/user/profileImageUpload";

export const userService = {
  getMyProfile: () => clientApi.get<MyProfile>("/api/users/me/profile"),
  completeOnboarding: (body: RegisterOnboardingRequest) =>
    clientApi.post<null>("/api/users/me/onboarding", body),
  withdraw: () => clientApi.deleteAuth<null>("/api/users/me"),
  createProfileImageUploadUrl: (body: CreateProfileImageUploadUrlRequest) =>
    clientApi.post<ProfileImageUploadUrlResponse>("/api/users/me/profile-image/upload-url", body),
  // uploadUrl은 S3 presigned PUT이라 Authorization 헤더가 붙으면 서명이 깨진다 — ky 대신 raw fetch로 호출
  uploadProfileImage: async (uploadUrl: string, file: File) => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) throw new Error("프로필 이미지 업로드에 실패했습니다.");
  },
};
