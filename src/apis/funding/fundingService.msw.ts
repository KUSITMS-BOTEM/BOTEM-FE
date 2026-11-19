import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type { FundingRevealResponse } from "@/types/funding/funding";
import type { FundingManagementResponse } from "@/types/funding/fundingManagement";

// 목록에 없는 펀딩 id는 보탠 사람이 없는 마감(참여자 0명 화면)으로 응답한다
const MOCK_REVEALS: Record<number, FundingRevealResponse> = {
  12: {
    contributorNames: ["하린이", "도윤이", "서준이", "지아", "민서"],
    totalAmount: 215000,
    goalAchieved: false,
  },
  13: {
    contributorNames: ["지민", "서연", "도윤", "하은", "민준", "수아", "예준", "지우"],
    totalAmount: 429000,
    goalAchieved: true,
  },
};

const EMPTY_REVEAL: FundingRevealResponse = {
  contributorNames: [],
  totalAmount: 0,
  goalAchieved: false,
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

// 백엔드 DTO(OwnerFundingDetailResponse)에 예시 값이 없어 필드 타입에 맞춰 만든 값이다
export const MOCK_FUNDING_MANAGEMENT: FundingManagementResponse = {
  fundingId: 1,
  type: "BIRTHDAY",
  title: "지유의 생일",
  story: "올해 생일엔 출퇴근길에 쓸 노캔 헤드폰이 갖고 싶어요. 조금씩 보태주면 감동할게요!",
  promise: "펀딩이 성공하면 헤드폰 끼고 출근하는 인증샷을 꼭 올릴게요!",
  product: {
    name: "소니 WH-1000XM5",
    imageUrl: "https://picsum.photos/seed/botem-product/160/160",
    price: 468000,
    url: "https://www.coupang.com/vp/products/1",
  },
  productChanged: false,
  productChangedAt: null,
  targetAmount: 123456789,
  deadline: "2026-12-31T23:59:59",
  revealAt: null,
  remainingDays: 41,
  confirmedPercentage: 60,
  pendingPercentage: 5,
  pendingContributionCount: 3,
  targetReached: false,
  extended: false,
  earlyClosedAt: null,
  giftPreparedAt: null,
  participantCount: 5,
  participants: [
    {
      contributionId: 11,
      order: 1,
      name: "민수",
      profileImageUrl: null,
      status: "CONFIRMED",
      participatedAt: "2026-11-10T09:00:00",
      thankCardSent: false,
      thankCardSentAt: null,
    },
    {
      contributionId: 12,
      order: 2,
      name: "서연",
      profileImageUrl: null,
      status: "CONFIRMED",
      participatedAt: "2026-11-12T18:30:00",
      thankCardSent: true,
      thankCardSentAt: "2026-11-13T10:00:00",
    },
    {
      contributionId: 13,
      order: 3,
      name: "하린",
      profileImageUrl: null,
      status: "PENDING_CONFIRMATION",
      participatedAt: "2026-11-18T11:20:00",
      thankCardSent: false,
      thankCardSentAt: null,
    },
  ],
  messageCount: 8,
  managementState: "IN_PROGRESS",
  actions: {
    canCloseEarly: true,
    canExtend: false,
    canChangeProduct: true,
    canReissueShareCard: true,
  },
};

export const fundingHandlers = [
  http.get("*/api/fundings/:fundingId/management", async ({ params }) => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: { ...MOCK_FUNDING_MANAGEMENT, fundingId: Number(params.fundingId) },
      error: null,
    });
  }),
  http.get("*/api/users/me/fundings/closed", async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: MOCK_CLOSED_FUNDINGS, error: null });
  }),
  http.get("*/api/fundings/:fundingId/reveal", async ({ params }) => {
    await delay(300);
    const data = MOCK_REVEALS[Number(params.fundingId)] ?? EMPTY_REVEAL;
    return HttpResponse.json({ success: true, data, error: null });
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
        type: "BIRTHDAY",
        status: "FUNDING",
        shareUrl: "https://botem.example.com/funding/1",
      },
      error: null,
    });
  }),
  http.post("*/api/fundings/surprise", async () => {
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: {
        fundingId: 2,
        type: "SURPRISE",
        status: "FUNDING",
        shareUrl: "https://botem.example.com/funding/2",
      },
      error: null,
    });
  }),
];
