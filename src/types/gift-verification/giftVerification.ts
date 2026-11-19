export type CreateGiftVerificationImageUploadUrlRequest = {
  contentType: string;
  contentLength: number;
};

export type GiftVerificationImageUploadUrlResponse = {
  uploadUrl: string;
  imageUrl: string;
};

export type CompleteGiftVerificationRequest = {
  imageUrl: string;
  thankYouMessage: string | null;
  purchasedThroughBotemLink: boolean;
  replacementProductName: string | null;
};

export type GiftVerificationStatus = "PENDING" | "COMPLETED";

export type GiftVerificationResponse = {
  giftVerificationId: number;
  fundingId: number;
  status: GiftVerificationStatus;
  imageUrl: string | null;
  thankYouMessage: string | null;
  purchasedThroughBotemLink: boolean;
  replacementProductName: string | null;
  completedAt: string | null;
};
