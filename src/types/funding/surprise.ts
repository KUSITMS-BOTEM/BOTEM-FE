import type { BankCode } from "@/constants/bank";

export type SurpriseMessage = {
  messageId: number;
  participantName: string;
  participantProfileImageUrl: string | null;
  content: string | null;
  paperTemplateCode: string;
  decorationCode: string | null;
  photoUrl: string | null;
  voiceUrl: string | null;
  voiceDurationSeconds: number | null;
  voiceTranscript: string | null;
};

export type SurpriseRevealResponse = {
  fundingId: number;
  recipientName: string;
  organizerName: string;
  productName: string;
  productImageUrl: string;
  productUrl: string;
  // 상품 스냅샷 가격. 목표 금액(targetAmount)과 다를 수 있어 차액은 이 값으로 계산한다
  productPrice: number;
  // 받는 사람이 다른 위시로 바꿨는지
  productChanged: boolean;
  confirmedAmount: number;
  targetAmount: number;
  // 확정 금액 기준 달성률(소수점 버림, 초과 달성 시 100 초과 가능)
  confirmedPercentage: number;
  deadline: string;
  participantCount: number;
  messageCount: number;
  revealAt: string;
  openedAt: string | null;
  // 받는 사람이 구매할 선물을 확정했는지 (확정 후엔 상품을 바꿀 수 없다)
  giftChosen: boolean;
  messages: SurpriseMessage[];
};

// 목표 미달일 때만 오는 받는 사람 대표계좌 (탈퇴·미등록·목표 달성이면 null)
export type SurpriseRecipientPayoutAccount = {
  bank: BankCode;
  bankName: string;
  accountNumber: string;
  accountHolder: string | null;
};

export type SurpriseGiftPreparationResponse = {
  fundingId: number;
  shareKey: string;
  // 탈퇴했으면 '탈퇴한 사용자'
  recipientName: string | null;
  recipientWithdrawn: boolean;
  recipientPayoutAccount: SurpriseRecipientPayoutAccount | null;
  productName: string;
  productImageUrl: string;
  productUrl: string;
  productSellerName: string | null;
  targetAmount: number;
  confirmedAmount: number;
  achievementPercentage: number;
  targetReached: boolean;
  participantCount: number;
  messageCount: number;
  pendingContributionCount: number;
  pendingCleanupRequired: boolean;
  fundingStartedAt: string;
  deadline: string;
  earlyClosedAt: string | null;
  revealAt: string | null;
  giftPreparedAt: string | null;
};

export type SurpriseThankCardFriendMessageType = "TEXT" | "PHOTO" | "VOICE" | "STICKER";

export type SurpriseThankCardFriend = {
  contributionId: number;
  name: string;
  // 비로그인 참여자는 null
  profileImageUrl: string | null;
  // 서프라이즈를 연 주최자의 보탬
  organizer: boolean;
  messageTypes: SurpriseThankCardFriendMessageType[];
  // "YYYY-MM-DD"
  contributedDate: string;
  thankCardSent: boolean;
};

export type SurpriseThankCardFriendsResponse = {
  fundingId: number;
  friends: SurpriseThankCardFriend[];
};
