import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

import { MOCK_FUNDING_CARDS } from "@/apis/home/homeService.msw";
import { getMockContributionProgress, getMockContributionRecords } from "@/mocks/mockContributions";
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
  fundings: [
    {
      fundingId: 12,
      shareKey: toMockShareKey(12),
      type: "BIRTHDAY",
      productName: "에어팟 프로 2",
      productImageUrl: faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
      deadline: "2025-10-13T23:59:59.999999",
      targetReached: true,
      participantCount: 8,
      recipientName: null,
      giftVerificationStatus: "REQUIRED",
    },
    {
      fundingId: 11,
      shareKey: toMockShareKey(11),
      type: "BIRTHDAY",
      productName: "에어팟 프로 2",
      productImageUrl: faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
      deadline: "2025-10-10T23:59:59.999999",
      targetReached: true,
      participantCount: 8,
      recipientName: null,
      giftVerificationStatus: "COMPLETED",
    },
    {
      fundingId: 9,
      shareKey: toMockShareKey(9),
      type: "SURPRISE",
      productName: "에어팟 프로 2",
      productImageUrl: faker.image.urlPicsumPhotos({ width: 160, height: 160, blur: 0 }),
      deadline: "2025-10-10T23:59:59.999999",
      targetReached: false,
      participantCount: 6,
      recipientName: "서준",
      giftVerificationStatus: null,
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

const DAY_MS = 24 * 60 * 60 * 1000;

const toMockDeadline = (remainingDays: number | null) =>
  remainingDays === null
    ? "2026-11-10T23:59:59.999999"
    : `${new Date(Date.now() + remainingDays * DAY_MS).toISOString().slice(0, 10)}T23:59:59.999999`;

// 홈 카드 목업을 원본으로 삼아 홈과 상세의 달성률·확인 대기 건수가 어긋나지 않게 한다
const getMockOwnerFundingDetail = (fundingId: number): OwnerFundingDetailResponse | null => {
  const card = MOCK_FUNDING_CARDS.find(item => item.fundingId === fundingId);
  if (!card) return null;

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
    // 토큰이 붙은 조회는 개설자 본인으로 보고 ownerPreview를 true로 응답한다 (id 99는 개설자 화면 확인용)
    const ownerPreview = hasToken && fundingId === 99;
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
      data: { ...MOCK_FUNDING_DETAIL, ...surprise, fundingId, shareKey, ownerPreview },
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
