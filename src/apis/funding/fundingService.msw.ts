import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

import { MOCK_FUNDING_CARDS, MOCK_SURPRISE_REVEAL_ID } from "@/apis/home/homeService.msw";
import { getMockContributionProgress, getMockContributionRecords } from "@/mocks/mockContributions";
import { getMockCompletedGiftVerification } from "@/mocks/mockGiftVerifications";
import { fromMockShareKey, toMockShareKey } from "@/mocks/mockShareKey";
import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";
import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type {
  FundingResultContributionResponse,
  FundingResultResponse,
} from "@/types/funding/fundingResult";
import type {
  FundingManagementState,
  OwnerFundingDetailResponse,
  OwnerFundingParticipantResponse,
} from "@/types/funding/ownerFundingDetail";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";
import type { RollingPaperMessage } from "@/types/funding/rollingPaper";
import type {
  SurpriseGiftPreparationResponse,
  SurpriseRevealResponse,
  SurpriseThankCardFriend,
} from "@/types/funding/surprise";
import type { FundingType } from "@/types/home/home";

const toContributions = (names: string[]): FundingResultContributionResponse[] =>
  names.map((name, index) => ({
    contributionId: index + 1,
    name,
    profileImageUrl: null,
    status: "CONFIRMED",
    participatedAt: "2026-11-10T14:20:00",
    hasMessage: true,
    hasPhoto: false,
    hasVoice: false,
    thankCardSent: false,
  }));

const MOCK_PRODUCT = {
  productName: "소니 WH-1000XM5",
  productImageUrl: faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
  targetAmount: 364000,
  pendingContributionCount: 0,
  pendingCleanupRequired: false,
  resultOpenedAt: null,
};

// 12는 미달, 13은 달성. 목록에 없는 펀딩 id는 보탠 사람이 없는 마감(참여자 0명 화면)으로 응답한다
const MOCK_RESULTS: Record<number, FundingResultResponse> = {
  12: {
    ...MOCK_PRODUCT,
    fundingId: 12,
    confirmedAmount: 215000,
    achievementPercentage: 59,
    targetReached: false,
    participantCount: 5,
    messageCount: 5,
    contributions: toContributions(["하린이", "도윤이", "서준이", "지아", "민서"]),
  },
  13: {
    ...MOCK_PRODUCT,
    fundingId: 13,
    confirmedAmount: 429000,
    achievementPercentage: 117,
    targetReached: true,
    participantCount: 8,
    messageCount: 8,
    contributions: toContributions([
      "지민",
      "서연",
      "도윤",
      "하은",
      "민준",
      "수아",
      "예준",
      "지우",
    ]),
  },
};

// 마감된 펀딩 목록(20)에서 열어 본 생일 펀딩. 팡을 이미 열어 롤링페이퍼 보기가 활성화된다
MOCK_RESULTS[20] = {
  ...MOCK_PRODUCT,
  fundingId: 20,
  confirmedAmount: 364000,
  achievementPercentage: 100,
  targetReached: true,
  participantCount: 8,
  messageCount: 8,
  contributions: toContributions(["하린이", "도윤이", "서준이"]),
  resultOpenedAt: "2025-10-14T00:00:00",
};

const MOCK_VOICE_URL = "https://cdn.example.com/mock-voice.wav";
const MOCK_VOICE_SECONDS = 8;

// 재생 모션을 눈으로 확인할 수 있게 무음 WAV(8kHz·8bit·모노)를 만들어 내려준다
const toSilentWav = (seconds: number) => {
  const sampleRate = 8000;
  const samples = new Uint8Array(sampleRate * seconds).fill(128);
  const header = new DataView(new ArrayBuffer(44));
  const writeText = (offset: number, text: string) =>
    [...text].forEach((char, index) => header.setUint8(offset + index, char.charCodeAt(0)));
  writeText(0, "RIFF");
  header.setUint32(4, 36 + samples.length, true);
  writeText(8, "WAVEfmt ");
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true);
  header.setUint16(22, 1, true);
  header.setUint32(24, sampleRate, true);
  header.setUint32(28, sampleRate, true);
  header.setUint16(32, 1, true);
  header.setUint16(34, 8, true);
  writeText(36, "data");
  header.setUint32(40, samples.length, true);
  return new Blob([header, samples], { type: "audio/wav" });
};

const toMockRollingPaperMessage = (
  messageId: number,
  participantName: string,
  content: string,
  paperTemplateCode: string,
  extra: Partial<RollingPaperMessage> = {},
): RollingPaperMessage => ({
  messageId,
  participantName,
  participantProfileImageUrl: null,
  content,
  paperTemplateCode,
  decorationCode: null,
  photoUrl: null,
  // 모든 편지지에 음성이 있다고 가정한다. 자막은 본문과 같게 둔다
  voiceUrl: MOCK_VOICE_URL,
  voiceDurationSeconds: MOCK_VOICE_SECONDS,
  voiceTranscript: content,
  ...extra,
});

// paperTemplateCode·decorationCode는 FE가 정한 규칙(`색_스타일`, `큰|작은`)을 따른다
const MOCK_ROLLING_PAPER_MESSAGES: RollingPaperMessage[] = [
  toMockRollingPaperMessage(
    1,
    "민지",
    "지유야 생일 축하해! 올해도 같이 많이 웃자",
    "ORANGE_WHITE_DOT",
    {
      decorationCode: "CAKE|HEART",
      photoUrl: "https://picsum.photos/seed/rolling-paper-1/200/200",
    },
  ),
  toMockRollingPaperMessage(
    2,
    "서준",
    "항상 곁에서 힘이 돼줘서 고마워. 앞으로도 오래오래 함께하자. 사랑해!",
    "LIME_DOT_GRID",
    { decorationCode: "GIFT|" },
  ),
  toMockRollingPaperMessage(
    3,
    "하은",
    "생일 축하해! 맛있는 거 많이 먹고 행복한 하루 보내~",
    "PINK_VIVID_SOLID",
    {
      photoUrl: "https://picsum.photos/seed/rolling-paper-3/200/200",
    },
  ),
  toMockRollingPaperMessage(4, "예준", "지유야 생일 정말 정말 축하해!", "BLUE_SOLID", {
    decorationCode: "|SPARKLES",
  }),
  toMockRollingPaperMessage(
    5,
    "수아",
    "오늘은 네가 주인공이야. 선물 마음에 들었으면 좋겠다!",
    "PINK_COLOR_DOT",
  ),
  toMockRollingPaperMessage(
    6,
    "도윤",
    "지유야 태어나줘서 고마워. 올 한 해도 건강하고 행복하자!",
    "LIME_DOT_GRID",
    { decorationCode: "CAKE|" },
  ),
  toMockRollingPaperMessage(7, "지아", "생일 축하해! 사랑해~", "BLUE_SOLID", {
    decorationCode: "|HEART",
  }),
];

const getMockResult = (fundingId: number): FundingResultResponse =>
  MOCK_RESULTS[fundingId] ?? {
    ...MOCK_PRODUCT,
    fundingId,
    confirmedAmount: 0,
    achievementPercentage: 0,
    targetReached: false,
    participantCount: 0,
    messageCount: 0,
    contributions: [],
  };

// 상품 변경·기간 연장 요청이 바꾼 값. 재조회한 관리 상세에 반영된다
const mockFundingOverrides: Record<
  number,
  Partial<Pick<OwnerFundingDetailResponse, "product" | "productChangedAt" | "deadline">>
> = {};

// 위시 목(wishService.msw)과 같은 id 체계라 wishId로 추천 상품 목을 찾아 펀딩 상품 스냅샷을 만든다
const toFundingProduct = (wishId: number): OwnerFundingDetailResponse["product"] | null => {
  const product = MOCK_RECOMMENDED_PRODUCTS.find(item => item.id === wishId);
  if (!product) return null;
  return {
    name: product.name,
    imageUrl: product.imageUrl,
    price: product.price,
    url: "https://link.coupang.com/a/example",
  };
};

const MOCK_CLOSED_FUNDINGS: ClosedFundingListResponse = {
  tabCounts: { all: 4, received: 1, participated: 1 },
  years: [
    {
      year: 2025,
      fundingCount: 4,
      fundings: [
        {
          fundingId: 20,
          relationship: "OPENED",
          fundingType: "BIRTHDAY",
          opener: { name: "서준", profileImageUrl: null },
          celebrantName: "서준",
          deadline: "2025-10-13T23:59:59",
          productName: "에어팟 프로 2",
          productImageUrl: faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
          rollingPaperCount: 8,
          representativeMessage: {
            writerName: "하린",
            writerProfileImageUrl: null,
            content: "생일 진짜 축하해!",
            paperTemplateCode: "LIME_DOT_GRID",
            hasVoice: false,
          },
        },
        {
          fundingId: 21,
          relationship: "OPENED",
          fundingType: "SURPRISE",
          opener: { name: "서준", profileImageUrl: null },
          celebrantName: "지유",
          deadline: "2025-10-10T23:59:59",
          productName: "에어팟 프로 2",
          productImageUrl: faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
          rollingPaperCount: null,
          representativeMessage: null,
        },
        {
          fundingId: 22,
          relationship: "RECEIVED",
          fundingType: "SURPRISE",
          opener: { name: "하린", profileImageUrl: null },
          celebrantName: "서준",
          deadline: "2025-10-10T23:59:59",
          productName: "에어팟 프로 2",
          productImageUrl: faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
          rollingPaperCount: 6,
          representativeMessage: {
            writerName: "하린",
            writerProfileImageUrl: null,
            content: "생일 진짜 축하해!",
            paperTemplateCode: "LIME_DOT_GRID",
            hasVoice: false,
          },
        },
        {
          fundingId: 23,
          relationship: "PARTICIPATED",
          fundingType: "BIRTHDAY",
          opener: { name: "도윤", profileImageUrl: null },
          celebrantName: "도윤",
          deadline: "2025-09-02T23:59:59",
          productName: "에어팟 프로 2",
          productImageUrl: faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
          rollingPaperCount: 5,
          representativeMessage: {
            writerName: "하린",
            writerProfileImageUrl: null,
            content: "생일 진짜 축하해!",
            paperTemplateCode: "LIME_DOT_GRID",
            hasVoice: false,
          },
        },
      ],
    },
  ],
};

const MOCK_FUNDING_DETAIL: FundingDetailResponse = {
  fundingId: 12,
  shareKey: toMockShareKey(12),
  type: "BIRTHDAY",
  title: null,
  celebrantName: "민재",
  celebrantProfileImageUrl: null,
  targetAmount: 300000,
  recommendedAmount: 15000,
  product: {
    name: "소니 WH-1000XM5",
    imageUrl: faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
    price: 300000,
    url: "https://www.coupang.com/vp/products/1",
  },
  productChanged: false,
  productChangedAt: null,
  story: "올해 생일엔 출퇴근길에 쓸 노캔 헤드폰이 갖고 싶어요. 조금씩 보태주면 감동할게요!",
  promise: "펀딩이 성공하면 헤드폰 끼고 출근하는 인증샷을 꼭 올릴게요!",
  deadline: "2026-12-31T23:59:59",
  revealAt: null,
  extended: false,
  remainingDays: 41,
  confirmedPercentage: 40,
  pendingPercentage: 10,
  remainingAmount: 180000,
  participantCount: 4,
  participants: [
    { order: 1, name: "하린이", profileImageUrl: null, contributedDate: "2026-11-10" },
    { order: 2, name: "도윤이", profileImageUrl: null, contributedDate: "2026-11-12" },
    { order: 3, name: "서준이", profileImageUrl: null, contributedDate: "2026-11-15" },
    { order: 4, name: "민지", profileImageUrl: null, contributedDate: "2026-11-16" },
  ],
  displayStatus: "IN_PROGRESS",
  canContributeAmount: true,
  canParticipate: true,
  ownerPreview: false,
  giftVerification: null,
  thankCard: null,
};

const MOCK_SURPRISE_RECIPIENT_ID = 98;
const MOCK_SURPRISE_PARTICIPANT_ID = 97;

// 열기·선물 준비 완료 시각. 새로고침 전까지 유지해 다시 들어왔을 때의 화면을 확인할 수 있다
const mockOpenedSurprises = new Map<number, string>();
const mockPreparedSurprises = new Map<number, string>();
// 선물 선택 저장을 마친 펀딩. 공개 상세의 giftChosen에 반영한다
const mockChosenGifts = new Set<number>();

// 받는 사람이 다른 위시로 바꿨으면 상품 변경 목업(mockFundingOverrides)의 상품을 보여준다
const getMockSurpriseReveal = (fundingId: number): SurpriseRevealResponse => {
  const changedProduct = mockFundingOverrides[fundingId]?.product;
  return {
    fundingId,
    recipientName: "서준",
    organizerName: "하린",
    productName: changedProduct?.name ?? "에어팟 프로 2",
    productImageUrl:
      changedProduct?.imageUrl ?? faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
    productUrl: changedProduct?.url ?? "https://www.coupang.com/vp/products/1",
    productPrice: changedProduct?.price ?? 459000,
    productChanged: changedProduct !== undefined,
    confirmedAmount: 420000,
    targetAmount: 459000,
    confirmedPercentage: 91,
    deadline: "2025-10-10T23:59:59",
    participantCount: MOCK_SURPRISE_THANK_CARD_FRIENDS.length,
    messageCount: MOCK_ROLLING_PAPER_MESSAGES.length,
    revealAt: "2025-10-11T00:00:00",
    // 홈 공개 카드(96)는 열기 전 상태로 시작한다
    openedAt:
      fundingId === MOCK_SURPRISE_REVEAL_ID
        ? (mockOpenedSurprises.get(fundingId) ?? null)
        : "2025-10-11T09:00:00",
    giftChosen: mockChosenGifts.has(fundingId),
    messages: MOCK_ROLLING_PAPER_MESSAGES,
  };
};

const MOCK_SURPRISE_THANK_CARD_FRIENDS: SurpriseThankCardFriend[] = [
  { name: "하린", organizer: true, messageTypes: ["TEXT", "PHOTO"] },
  { name: "서준", organizer: false, messageTypes: ["TEXT"] },
  { name: "민지", organizer: false, messageTypes: ["TEXT", "VOICE"] },
  { name: "도윤", organizer: false, messageTypes: [] },
  { name: "예린", organizer: false, messageTypes: ["STICKER"] },
].map((friend, index) => ({
  ...friend,
  messageTypes: friend.messageTypes as SurpriseThankCardFriend["messageTypes"],
  contributionId: 9600 + index,
  // 비로그인 참여자의 기본 이미지도 확인할 수 있게 마지막 친구는 null로 둔다
  profileImageUrl:
    index === 4 ? null : faker.image.urlPicsumPhotos({ width: 72, height: 72, blur: 0 }),
  contributedDate: "2026-11-10",
  thankCardSent: false,
}));

// 홈 카드 목업(20~23 등 서프라이즈)을 원본으로 삼아 홈과 선물 준비 화면의 달성률이 어긋나지 않게 한다
const getMockSurpriseGiftPreparation = (
  fundingId: number,
): SurpriseGiftPreparationResponse | null => {
  const card = MOCK_FUNDING_CARDS.find(
    item => item.fundingId === fundingId && item.fundingType === "SURPRISE",
  );
  if (!card) return null;
  const targetReached = card.confirmedPercentage >= 100;
  const confirmedAmount = Math.floor((card.targetAmount * card.confirmedPercentage) / 100);
  const preparedAt =
    card.surpriseStage === "GIFT_PREPARED"
      ? "2026-11-20T10:00:00"
      : (mockPreparedSurprises.get(fundingId) ?? null);
  return {
    fundingId,
    shareKey: toMockShareKey(fundingId),
    recipientName: card.recipientName ?? "지유",
    recipientWithdrawn: false,
    recipientPayoutAccount: targetReached
      ? null
      : {
          bank: "TOSS_BANK",
          bankName: "토스뱅크",
          accountNumber: "1000-1234-5678",
          accountHolder: "김지유",
        },
    productName: card.productName,
    productImageUrl: card.productImageUrl,
    productUrl: "https://link.coupang.com/a/example",
    productSellerName: "BOTEM 브랜드샵",
    targetAmount: card.targetAmount,
    confirmedAmount,
    achievementPercentage: card.confirmedPercentage,
    targetReached,
    participantCount: card.participantCount,
    messageCount: card.participantCount,
    pendingContributionCount: 0,
    pendingCleanupRequired: false,
    fundingStartedAt: "2026-11-01T10:00:00",
    deadline: "2026-11-20T23:59:59",
    earlyClosedAt: null,
    revealAt: "2026-11-25T00:00:00",
    giftPreparedAt: preparedAt,
  };
};

const mockSurpriseGiftPreparationNotFound = () =>
  HttpResponse.json(
    {
      success: false,
      data: null,
      error: { code: "FUNDING_002", message: "펀딩을 찾을 수 없습니다." },
    },
    { status: 404 },
  );

const DAY_MS = 24 * 60 * 60 * 1000;

const toMockDeadline = (remainingDays: number | null) =>
  remainingDays === null
    ? "2026-11-10T23:59:59.999999"
    : `${new Date(Date.now() + remainingDays * DAY_MS).toISOString().slice(0, 10)}T23:59:59.999999`;

// 마감된 펀딩 목록에서 내가 연 펀딩은 홈 카드에 없어, 마감 상태 관리 상세를 목록 항목에서 만든다
const getMockClosedOwnerDetail = (fundingId: number): OwnerFundingDetailResponse | null => {
  const item = MOCK_CLOSED_FUNDINGS.years
    .flatMap(({ fundings }) => fundings)
    .find(funding => funding.fundingId === fundingId && funding.relationship === "OPENED");
  if (!item) return null;

  return {
    fundingId,
    shareKey: toMockShareKey(fundingId),
    type: item.fundingType,
    celebrantName: item.celebrantName,
    title: null,
    story: null,
    promise: null,
    product: {
      name: item.productName,
      imageUrl: item.productImageUrl,
      price: MOCK_PRODUCT.targetAmount,
      url: "https://link.coupang.com/a/example",
    },
    productChanged: false,
    productChangedAt: null,
    targetAmount: MOCK_PRODUCT.targetAmount,
    deadline: item.deadline,
    revealAt: item.fundingType === "SURPRISE" ? item.deadline : null,
    remainingDays: null,
    confirmedPercentage: 100,
    pendingPercentage: 0,
    pendingContributionCount: 0,
    targetReached: true,
    extended: false,
    earlyClosedAt: null,
    giftPreparedAt: null,
    participantCount: 3,
    participants: ["하린이", "도윤이", "서준이"].map((name, index) => ({
      contributionId: fundingId * 100 + index,
      order: index + 1,
      name,
      profileImageUrl: null,
      status: "CONFIRMED" as const,
      participatedAt: "2025-10-05T10:00:00",
      thankCardSent: false,
      thankCardSentAt: null,
    })),
    messageCount: item.rollingPaperCount ?? 3,
    managementState: "CLOSED",
    actions: {
      canCloseEarly: false,
      canExtend: false,
      canChangeProduct: false,
      canReissueShareCard: false,
    },
  };
};

// 홈 카드 목업을 원본으로 삼아 홈과 상세의 달성률·확인 대기 건수가 어긋나지 않게 한다
const getMockOwnerFundingDetail = (fundingId: number): OwnerFundingDetailResponse | null => {
  const card = MOCK_FUNDING_CARDS.find(item => item.fundingId === fundingId);
  if (!card) return getMockClosedOwnerDetail(fundingId);

  const progress = getMockContributionProgress(fundingId);
  const confirmedPercentage = card.confirmedPercentage + progress.confirmedAddedPercentage;
  const isClosed = card.cardType === "CLOSED_UNOPENED";
  const previewRows: OwnerFundingParticipantResponse[] = card.participantPreviews.map(
    (preview, index) => ({
      contributionId: fundingId * 100 + index,
      order: index + 1,
      name: preview.participantName,
      profileImageUrl: preview.profileImageUrl,
      status: "CONFIRMED",
      participatedAt: "2026-11-15T10:00:00",
      thankCardSent: false,
      thankCardSentAt: null,
    }),
  );
  const contributionRows: OwnerFundingParticipantResponse[] = getMockContributionRecords(
    fundingId,
  ).map((record, index) => ({
    contributionId: record.contributionId,
    order: previewRows.length + index + 1,
    name: record.participantName,
    profileImageUrl: record.profileImageUrl,
    status: record.status,
    participatedAt: record.participatedAt,
    thankCardSent: false,
    thankCardSentAt: null,
  }));
  const managementState: FundingManagementState =
    card.participantCount === 0
      ? "NO_PARTICIPANTS"
      : isClosed
        ? "CLOSED"
        : confirmedPercentage >= 100
          ? "TARGET_REACHED"
          : "IN_PROGRESS";

  return {
    fundingId,
    shareKey: toMockShareKey(fundingId),
    type: card.fundingType as FundingType,
    title: null,
    celebrantName: card.fundingType === "SURPRISE" ? "서연" : "민재",
    story: "올해 생일엔 꼭 갖고 싶던 선물이 있어요. 조금씩 보태주면 감동할게요!",
    promise: null,
    product: {
      name: card.productName,
      imageUrl: card.productImageUrl,
      price: card.targetAmount,
      url: "https://link.coupang.com/a/example",
    },
    productChanged: false,
    productChangedAt: null,
    targetAmount: card.targetAmount,
    deadline: toMockDeadline(card.remainingDays),
    revealAt: card.fundingType === "SURPRISE" ? "2026-12-25T00:00:00" : null,
    remainingDays: card.remainingDays,
    confirmedPercentage,
    pendingPercentage: progress.pendingPercentage,
    pendingContributionCount: progress.pendingContributionCount,
    targetReached: confirmedPercentage >= 100,
    extended: false,
    earlyClosedAt: null,
    giftPreparedAt: null,
    participantCount: card.participantCount,
    participants: [...previewRows, ...contributionRows],
    messageCount: card.participantCount === 0 ? 0 : 3,
    managementState,
    actions: {
      canCloseEarly: !isClosed,
      canExtend: isClosed && confirmedPercentage < 100 && card.fundingType === "BIRTHDAY",
      canChangeProduct: !isClosed,
      canReissueShareCard: !isClosed,
    },
  };
};

// 상품 변경·기간 연장 요청이 바꾼 값을 관리 상세에 덧입힌다
const getMockManagement = (fundingId: number): OwnerFundingDetailResponse | null => {
  const detail = getMockOwnerFundingDetail(fundingId);
  const override = mockFundingOverrides[fundingId];
  if (!detail || !override) return detail;
  const extended = detail.extended || override.deadline !== undefined;
  return {
    ...detail,
    ...override,
    productChanged: detail.productChanged || override.productChangedAt !== undefined,
    extended,
    actions: { ...detail.actions, canExtend: detail.actions.canExtend && !extended },
  };
};

export const fundingHandlers = [
  http.get("*/api/fundings/:fundingId/management", async ({ params }) => {
    await delay(500);
    const detail = getMockManagement(Number(params.fundingId));
    if (!detail) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "FUNDING_002", message: "펀딩을 찾을 수 없습니다." },
        },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: detail, error: null });
  }),
  http.get("*/api/users/me/fundings/closed", async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: MOCK_CLOSED_FUNDINGS, error: null });
  }),
  http.get("*/api/fundings/share/:shareKey", async ({ params, request }) => {
    await delay(300);
    const shareKey = String(params.shareKey);
    const fundingId = fromMockShareKey(shareKey);
    const hasToken = request.headers.has("Authorization");
    // 토큰이 붙은 조회는 개설자 본인으로 보고 ownerPreview를 true로 응답한다 (id 99는 개설자 화면, 15는 서프라이즈 개설자 확인용)
    const ownerPreview = hasToken && (fundingId === 99 || fundingId === 15);
    // id 97·98은 서프라이즈. 98은 토큰이 붙으면 받는 사람으로 보고 403, 97은 토큰이 있어도 참여자라 200이다
    if (fundingId === MOCK_SURPRISE_RECIPIENT_ID && hasToken) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "FUNDING_046", message: "아직 공개되지 않은 서프라이즈예요." },
        },
        { status: 403 },
      );
    }
    const surprise =
      fundingId === MOCK_SURPRISE_RECIPIENT_ID || fundingId === MOCK_SURPRISE_PARTICIPANT_ID
        ? { type: "SURPRISE" as const, celebrantName: "서연", revealAt: "2026-12-25T00:00:00" }
        : {};
    return HttpResponse.json({
      success: true,
      data: {
        ...MOCK_FUNDING_DETAIL,
        ...surprise,
        fundingId,
        shareKey,
        ownerPreview,
        giftVerification: getMockCompletedGiftVerification(fundingId),
      },
      error: null,
    });
  }),
  // id 98은 공개 전(404 FUNDING_016)으로 응답해 잠금 안내를 확인할 수 있다
  http.get("*/api/fundings/:fundingId/surprise", async ({ params }) => {
    await delay(300);
    const fundingId = Number(params.fundingId);
    if (fundingId === MOCK_SURPRISE_RECIPIENT_ID) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "FUNDING_016", message: "공개된 서프라이즈를 찾을 수 없습니다." },
        },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      success: true,
      data: getMockSurpriseReveal(fundingId),
      error: null,
    });
  }),
  http.post("*/api/fundings/:fundingId/surprise/open", async ({ params }) => {
    await delay(500);
    const fundingId = Number(params.fundingId);
    if (!mockOpenedSurprises.has(fundingId))
      mockOpenedSurprises.set(fundingId, new Date().toISOString());
    return HttpResponse.json({
      success: true,
      data: getMockSurpriseReveal(fundingId),
      error: null,
    });
  }),
  http.get("*/api/fundings/:fundingId/surprise/thank-card-friends", async ({ params }) => {
    await delay(400);
    return HttpResponse.json({
      success: true,
      data: { fundingId: Number(params.fundingId), friends: MOCK_SURPRISE_THANK_CARD_FRIENDS },
      error: null,
    });
  }),
  http.get("*/api/fundings/:fundingId/surprise/gift-preparation", async ({ params }) => {
    await delay(400);
    const preparation = getMockSurpriseGiftPreparation(Number(params.fundingId));
    if (!preparation) return mockSurpriseGiftPreparationNotFound();
    return HttpResponse.json({ success: true, data: preparation, error: null });
  }),
  http.post("*/api/fundings/:fundingId/surprise/gift-preparation/complete", async ({ params }) => {
    await delay(500);
    const fundingId = Number(params.fundingId);
    const preparation = getMockSurpriseGiftPreparation(fundingId);
    if (!preparation) return mockSurpriseGiftPreparationNotFound();
    if (!preparation.giftPreparedAt) mockPreparedSurprises.set(fundingId, new Date().toISOString());
    return HttpResponse.json({
      success: true,
      data: getMockSurpriseGiftPreparation(fundingId),
      error: null,
    });
  }),
  http.get(MOCK_VOICE_URL, () => new HttpResponse(toSilentWav(MOCK_VOICE_SECONDS))),
  http.get("*/api/fundings/:fundingId/rolling-paper", async ({ params }) => {
    await delay(800);
    return HttpResponse.json({
      success: true,
      data: {
        fundingId: Number(params.fundingId),
        celebrantName: "지유",
        messageCount: MOCK_ROLLING_PAPER_MESSAGES.length,
        messages: MOCK_ROLLING_PAPER_MESSAGES,
      },
      error: null,
    });
  }),
  http.get("*/api/fundings/:fundingId/result", async ({ params }) => {
    await delay(300);
    const data = getMockResult(Number(params.fundingId));
    return HttpResponse.json({ success: true, data, error: null });
  }),
  http.post("*/api/fundings/:fundingId/result/open", async ({ params }) => {
    await delay(300);
    const data = {
      ...getMockResult(Number(params.fundingId)),
      resultOpenedAt: "2026-11-15T00:00:00",
    };
    return HttpResponse.json({ success: true, data, error: null });
  }),
  // 버튼 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다. 실서버는 마감 후 변경을 409(FUNDING_043)로 막는다
  http.patch("*/api/fundings/:fundingId/product", async ({ params, request }) => {
    await delay(800);
    const fundingId = Number(params.fundingId);
    const { wishId } = (await request.json()) as { wishId: number };
    const product = toFundingProduct(wishId);
    if (!product) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: "WISH_002", message: "위시를 찾을 수 없습니다.", detail: null },
        },
        { status: 404 },
      );
    }
    const productChangedAt = new Date().toISOString();
    mockFundingOverrides[fundingId] = {
      ...mockFundingOverrides[fundingId],
      product,
      productChangedAt,
    };
    return HttpResponse.json({
      success: true,
      data: { fundingId, product, productChangedAt },
      error: null,
    });
  }),
  // 버튼 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다. 실서버는 같은 펀딩에 다시 요청해도 같은 결과를 돌려준다
  http.post("*/api/fundings/:fundingId/gift-choice", async ({ params }) => {
    await delay(800);
    const fundingId = Number(params.fundingId);
    // 서프라이즈는 개설자 관리 상세가 없어 받는 사람 공개 상세의 상품으로 응답한다
    const reveal = getMockSurpriseReveal(fundingId);
    const management = getMockManagement(fundingId);
    const product = management?.product ?? {
      name: reveal.productName,
      imageUrl: reveal.productImageUrl,
      url: reveal.productUrl,
    };
    mockChosenGifts.add(fundingId);
    return HttpResponse.json({
      success: true,
      data: {
        fundingId,
        // 서프라이즈는 선물 인증 대기로 가지 않아 인증 ID가 없다
        giftVerificationId: !management || management.type === "SURPRISE" ? null : fundingId,
        productName: product.name,
        productImageUrl: product.imageUrl,
        productUrl: product.url,
      },
      error: null,
    });
  }),
  http.post("*/api/fundings/:fundingId/extension", async ({ params, request }) => {
    await delay(800);
    const fundingId = Number(params.fundingId);
    const { newDeadline } = (await request.json()) as { newDeadline: string };
    const deadline = `${newDeadline}T23:59:59.999999`;
    mockFundingOverrides[fundingId] = { ...mockFundingOverrides[fundingId], deadline };
    return HttpResponse.json({
      success: true,
      data: {
        fundingId,
        status: "FUNDING",
        deadline,
        extensionCount: 1,
        extendedAt: new Date().toISOString(),
      },
      error: null,
    });
  }),
  // 조기 마감 확인 Dialog의 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.post("*/api/fundings/:fundingId/close", async ({ params }) => {
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: {
        fundingId: Number(params.fundingId),
        type: "BIRTHDAY",
        status: "CLOSED",
        deadline: "2026-12-31",
        revealAt: null,
        earlyClosedAt: new Date().toISOString(),
      },
      error: null,
    });
  }),
  // 확인 시트의 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.post("*/api/fundings", async () => {
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: {
        fundingId: 1,
        shareKey: toMockShareKey(1),
        type: "BIRTHDAY",
        status: "FUNDING",
        shareUrl: "https://botem.example.com/funding/1",
      },
      error: null,
    });
  }),
  http.post("*/api/fundings/surprise", async ({ request }) => {
    await delay(1000);
    const body = (await request.json().catch(() => ({}))) as {
      deadline?: string;
      revealAt?: string;
    };
    return HttpResponse.json({
      success: true,
      data: {
        fundingId: 15,
        shareKey: toMockShareKey(15),
        type: "SURPRISE",
        status: "FUNDING",
        shareUrl: "https://botem.example.com/funding/15",
        // 실서버처럼 요청 날짜를 마감일은 그날 끝, 공개일은 그날 0시로 정규화해 돌려준다
        deadline: `${body.deadline ?? "2026-12-12"}T23:59:59.999999`,
        revealAt: `${body.revealAt ?? "2026-12-15"}T00:00:00`,
      },
      error: null,
    });
  }),
];
