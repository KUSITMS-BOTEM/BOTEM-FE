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
  confirmedAmount: number;
  targetAmount: number;
  // 확정 금액 기준 달성률(소수점 버림, 초과 달성 시 100 초과 가능)
  confirmedPercentage: number;
  deadline: string;
  participantCount: number;
  messageCount: number;
  revealAt: string;
  openedAt: string | null;
  messages: SurpriseMessage[];
};

export type SurpriseGiftPreparationResponse = {
  fundingId: number;
  shareKey: string;
  recipientName: string;
  productName: string;
  productImageUrl: string;
  productUrl: string;
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
  revealAt: string;
  giftPreparedAt: string | null;
};

export type SendSurpriseThankCardRequest = {
  message: string;
};

export type SurpriseThankCardResponse = {
  thankCardId: number;
  fundingId: number;
  message: string;
  sentAt: string;
};
