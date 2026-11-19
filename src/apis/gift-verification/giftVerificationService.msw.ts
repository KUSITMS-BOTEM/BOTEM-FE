import { delay, http, HttpResponse } from "msw";

import { completeMockGiftVerification } from "@/mocks/mockGiftVerifications";
import type { CompleteGiftVerificationRequest } from "@/types/gift-verification/giftVerification";

const MOCK_UPLOAD_URL = "https://mock-s3.botem.local/gift-verification/mock-upload-token";

export const giftVerificationHandlers = [
  http.post("*/api/gift-verifications/:giftVerificationId/image/upload-url", () =>
    HttpResponse.json({
      success: true,
      data: { uploadUrl: MOCK_UPLOAD_URL, imageUrl: MOCK_UPLOAD_URL },
      error: null,
    }),
  ),
  http.post(
    "*/api/gift-verifications/:giftVerificationId/complete",
    async ({ params, request }) => {
      await delay(800);
      const giftVerificationId = Number(params.giftVerificationId);
      const body = (await request.json()) as CompleteGiftVerificationRequest;
      const target = completeMockGiftVerification(giftVerificationId);

      return HttpResponse.json({
        success: true,
        data: {
          giftVerificationId,
          fundingId: target?.fundingId ?? 0,
          status: "COMPLETED",
          imageUrl: body.imageUrl,
          thankYouMessage: body.thankYouMessage,
          purchasedThroughBotemLink: body.purchasedThroughBotemLink,
          replacementProductName: body.replacementProductName,
          completedAt: new Date().toISOString(),
        },
        error: null,
      });
    },
  ),
];
