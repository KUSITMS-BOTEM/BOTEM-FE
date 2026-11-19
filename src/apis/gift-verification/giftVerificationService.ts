import { clientApi } from "@/apis/client";
import type {
  CompleteGiftVerificationRequest,
  CreateGiftVerificationImageUploadUrlRequest,
  GiftVerificationImageUploadUrlResponse,
  GiftVerificationResponse,
} from "@/types/gift-verification/giftVerification";

export const giftVerificationService = {
  createImageUploadUrl: (
    giftVerificationId: number,
    body: CreateGiftVerificationImageUploadUrlRequest,
  ) =>
    clientApi.post<GiftVerificationImageUploadUrlResponse>(
      `/api/gift-verifications/${giftVerificationId}/image/upload-url`,
      body,
    ),
  // uploadUrl은 S3 presigned PUT이라 Authorization 헤더가 붙으면 서명이 깨진다 — ky 대신 raw fetch로 호출
  uploadImage: async (uploadUrl: string, file: File) => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) throw new Error("인증 사진 업로드에 실패했습니다.");
  },
  complete: (giftVerificationId: number, body: CompleteGiftVerificationRequest) =>
    clientApi.post<GiftVerificationResponse>(
      `/api/gift-verifications/${giftVerificationId}/complete`,
      body,
    ),
};
