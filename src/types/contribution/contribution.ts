import type { BankCode } from "@/constants/bank";

export type PendingContributionResponse = {
  contributionId: number;
  participantName: string;
  profileImageUrl: string | null;
  participatedAt: string;
};

export type PendingContributionListResponse = {
  pendingContributionCount: number;
  contributions: PendingContributionResponse[];
};

export type FundingProgressResponse = {
  confirmedPercentage: number;
  pendingPercentage: number;
  pendingContributionCount: number;
  targetReached: boolean;
};

export type ContributionDecisionStatus =
  | "AWAITING_TRANSFER"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "MESSAGE_ONLY";

export type ContributionDecisionResponse = {
  contributionId: number;
  status: ContributionDecisionStatus;
  progress: FundingProgressResponse;
};

export type ConfirmAllContributionsResponse = {
  confirmedCount: number;
  progress: FundingProgressResponse;
};

// ---- 최신 Swagger 스펙 ----

export type ContributionLifecycleStatus =
  | "AWAITING_TRANSFER"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "REJECTED"
  | "MESSAGE_ONLY"
  | "CANCELLED";

export type ContributionPayoutAccount = {
  bank: BankCode;
  bankName: string;
  accountNumber: string;
  accountHolder: string | null;
};

type RollingPaperContent = {
  message: string | null;
  paperTemplateCode: string;
  decorationCode: string | null;
  photoUrl: string | null;
  voiceUrl: string | null;
  voiceDurationSeconds: number | null;
};

type RollingPaperContentRequest = {
  message?: string | null;
  paperTemplateCode: string;
  decorationCode?: string | null;
  photoUrl?: string | null;
  // voiceUrl과 voiceDurationSeconds는 함께 보내야 한다
  voiceUrl?: string | null;
  voiceDurationSeconds?: number | null;
  // 녹음할 때 브라우저가 만든 자막. 인식하지 못했으면 생략
  voiceTranscript?: string | null;
};

type ContributionParticipantRequest = {
  // 클라이언트가 만든 멱등 키 (UUID 권장, 최대 64자)
  requestKey: string;
  // 비로그인은 필수, 로그인은 생략하면 회원 닉네임
  participantName?: string | null;
  // 비로그인만 필수, 숫자 4자리
  guestPassword?: string | null;
};

export type CreateContributionRequest = ContributionParticipantRequest &
  RollingPaperContentRequest & { amount: number };

export type CreateContributionResponse = {
  contributionId: number;
  participantName: string;
  amount: number;
  status: ContributionLifecycleStatus;
  payoutAccount: ContributionPayoutAccount;
};

export type CreateMessageContributionRequest = ContributionParticipantRequest &
  RollingPaperContentRequest;

export type MessageContributionResponse = {
  contributionId: number;
  participantName: string;
  status: ContributionLifecycleStatus;
};

export type MarkTransferSentRequest = {
  guestPassword?: string | null;
};

export type MarkTransferSentResponse = {
  contributionId: number;
  status: ContributionLifecycleStatus;
};

export type MyContributionResponse = RollingPaperContent & {
  contributionId: number;
  participantName: string;
  amount: number;
  status: ContributionLifecycleStatus;
  excludedFromResult: boolean;
  participatedAt: string;
  // 송금 전·REJECTED 보탬에만 내려온다
  payoutAccount: ContributionPayoutAccount | null;
};

export type MyContributionListResponse = {
  editable: boolean;
  contributions: MyContributionResponse[];
};

export type UpdateMyContributionRequest = {
  participantName: string;
  message: string;
  paperTemplateCode: string;
};

export type AccessGuestContributionRequest = {
  participantName: string;
  guestPassword: string;
};

export type GuestContributionResponse = RollingPaperContent & {
  contributionId: number;
  participantName: string;
  amount: number;
  status: ContributionLifecycleStatus;
  // 로그인 JWT가 아니라 X-Guest-Contribution-Token 헤더 전용 단기 토큰
  accessToken: string;
  accessTokenExpiresAt: string;
};

// 롤링페이퍼 콘텐츠 전체를 교체하므로 null로 보낸 기존 첨부는 지워진다
export type UpdateGuestContributionRequest = RollingPaperContentRequest & {
  participantName: string;
};

export type UpdatedGuestContributionResponse = RollingPaperContent & {
  contributionId: number;
  participantName: string;
  amount: number;
  status: ContributionLifecycleStatus;
};

export type SendContributionThankCardRequest = {
  message: string;
};

export type ContributionThankCardResponse = {
  thankCardId: number;
  contributionId: number;
  message: string;
  sentAt: string;
  shareUrl: string;
};
