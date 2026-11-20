import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type { FundingRevealResponse } from "@/types/funding/funding";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";
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

const MOCK_FUNDING_DETAIL: FundingDetailResponse = {
  fundingId: 12,
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
  extended: false,
  remainingDays: 41,
  confirmedPercentage: 40,
  pendingPercentage: 10,
  participantCount: 3,
  participants: [
    { order: 1, name: "하린이", profileImageUrl: null },
    { order: 2, name: "도윤이", profileImageUrl: null },
    { order: 3, name: "서준이", profileImageUrl: null },
  ],
  displayStatus: "IN_PROGRESS",
  canContributeAmount: true,
  canParticipate: true,
  ownerPreview: false,
  giftVerification: null,
  thankCard: null,
};

const MOCK_FUNDING_MANAGEMENT: FundingManagementResponse = {
  fundingId: 12,
  type: "BIRTHDAY",
  title: null,
  story: MOCK_FUNDING_DETAIL.story,
  promise: MOCK_FUNDING_DETAIL.promise,
  product: MOCK_FUNDING_DETAIL.product,
  productChanged: false,
  productChangedAt: null,
  targetAmount: 300000,
  deadline: "2026-12-31T23:59:59",
  revealAt: null,
  remainingDays: 41,
  confirmedPercentage: 40,
  pendingPercentage: 10,
  pendingContributionCount: 2,
  targetReached: false,
  extended: false,
  earlyClosedAt: null,
  giftPreparedAt: null,
  participantCount: 3,
  participants: [
    {
      contributionId: 1,
      order: 1,
      name: "하린이",
      profileImageUrl: null,
      status: "PENDING_CONFIRMATION",
      participatedAt: "2026-11-18T11:20:00",
      thankCardSent: false,
      thankCardSentAt: null,
    },
    {
      contributionId: 2,
      order: 2,
      name: "도윤이",
      profileImageUrl: null,
      status: "PENDING_CONFIRMATION",
      participatedAt: "2026-11-16T09:05:00",
      thankCardSent: false,
      thankCardSentAt: null,
    },
    {
      contributionId: 5,
      order: 3,
      name: "서연",
      profileImageUrl: null,
      status: "CONFIRMED",
      participatedAt: "2026-11-12T18:30:00",
      thankCardSent: true,
      thankCardSentAt: "2026-11-13T10:00:00",
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
  http.get("*/api/fundings/:fundingId", async ({ params, request }) => {
    await delay(300);
    // 토큰이 붙은 조회는 개설자 본인으로 보고 ownerPreview를 true로 응답한다 (id 99는 개설자 화면 확인용)
    const ownerPreview = request.headers.has("Authorization") && params.fundingId === "99";
    return HttpResponse.json({
      success: true,
      data: { ...MOCK_FUNDING_DETAIL, fundingId: Number(params.fundingId), ownerPreview },
      error: null,
    });
  }),
  http.get("*/api/fundings/:fundingId/reveal", async ({ params }) => {
    await delay(300);
    const data = MOCK_REVEALS[Number(params.fundingId)] ?? EMPTY_REVEAL;
    return HttpResponse.json({ success: true, data, error: null });
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
