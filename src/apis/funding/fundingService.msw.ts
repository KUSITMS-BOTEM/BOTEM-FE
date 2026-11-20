import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

import { MOCK_RECOMMENDED_PRODUCTS } from "@/mocks/mockRecommendedProducts";
import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type {
  FundingManagementResponse,
  FundingResultContributionResponse,
  FundingResultResponse,
} from "@/types/funding/funding";

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
  Partial<Pick<FundingManagementResponse, "product" | "productChangedAt" | "deadline">>
> = {};

// 위시 목(wishService.msw)과 같은 id 체계라 wishId로 추천 상품 목을 찾아 펀딩 상품 스냅샷을 만든다
const toFundingProduct = (wishId: number): FundingManagementResponse["product"] | null => {
  const product = MOCK_RECOMMENDED_PRODUCTS.find(item => item.id === wishId);
  if (!product) return null;
  return {
    name: product.name,
    imageUrl: product.imageUrl,
    price: product.price,
    url: "https://link.coupang.com/a/example",
  };
};

// 결과 화면이 쓰는 상품·마감일·연장 가능 여부를 위해 결과 mock과 같은 펀딩으로 맞춘다
const getMockManagement = (fundingId: number): FundingManagementResponse => {
  const result = getMockResult(fundingId);
  const override = mockFundingOverrides[fundingId] ?? {};
  const extended = override.deadline !== undefined;
  return {
    fundingId,
    type: "BIRTHDAY",
    title: null,
    story: "올해 생일에는 오래 사용한 헤드폰을 바꾸고 싶어요.",
    promise: null,
    product: override.product ?? {
      name: result.productName,
      imageUrl: result.productImageUrl,
      price: result.targetAmount,
      url: "https://www.coupang.com/vp/products/7334036476",
    },
    productChanged: override.productChangedAt !== undefined,
    productChangedAt: override.productChangedAt ?? null,
    targetAmount: result.targetAmount,
    deadline: override.deadline ?? "2026-11-13T23:59:59.999999",
    revealAt: null,
    remainingDays: null,
    confirmedPercentage: result.achievementPercentage,
    pendingPercentage: 0,
    pendingContributionCount: 0,
    targetReached: result.targetReached,
    extended,
    earlyClosedAt: null,
    giftPreparedAt: null,
    participantCount: result.participantCount,
    participants: [],
    messageCount: result.messageCount,
    managementState: result.participantCount === 0 ? "NO_PARTICIPANTS" : "CLOSED",
    actions: {
      canCloseEarly: false,
      // 생일 펀딩이 마감 후 목표에 못 미쳤고 연장한 적이 없을 때만 연장할 수 있다
      canExtend: !result.targetReached && !extended,
      canChangeProduct: false,
      canReissueShareCard: false,
    },
  };
};

const MOCK_CLOSED_FUNDINGS: ClosedFundingListResponse = {
  fundings: [
    {
      fundingId: 12,
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

export const fundingHandlers = [
  http.get("*/api/users/me/fundings/closed", async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: MOCK_CLOSED_FUNDINGS, error: null });
  }),
  http.get("*/api/fundings/:fundingId/result", async ({ params }) => {
    await delay(300);
    const data = getMockResult(Number(params.fundingId));
    return HttpResponse.json({ success: true, data, error: null });
  }),
  http.get("*/api/fundings/:fundingId/management", async ({ params }) => {
    await delay(300);
    const data = getMockManagement(Number(params.fundingId));
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
  // 확인 시트의 로딩 상태를 눈으로 확인할 수 있게 지연을 둔다
  http.post("*/api/fundings", async () => {
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: {
        fundingId: 1,
        type: "BIRTHDAY",
        status: "FUNDING",
        shareUrl: "https://botem.example.com/funding/1",
      },
      error: null,
    });
  }),
];
