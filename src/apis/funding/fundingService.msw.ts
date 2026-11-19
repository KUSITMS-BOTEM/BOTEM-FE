import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

import { MOCK_FUNDING_CARDS } from "@/apis/home/homeService.msw";
import { getMockContributionProgress, getMockContributionRecords } from "@/mocks/mockContributions";
import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type { FundingRevealResponse } from "@/types/funding/funding";
import type {
  FundingManagementState,
  OwnerFundingDetailResponse,
  OwnerFundingParticipantResponse,
} from "@/types/funding/ownerFundingDetail";
import type { FundingType } from "@/types/home/home";

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
    type: card.fundingType as FundingType,
    title: null,
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
    revealAt: null,
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

export const fundingHandlers = [
  http.get("*/api/fundings/:fundingId/management", async ({ params }) => {
    await delay(500);
    const detail = getMockOwnerFundingDetail(Number(params.fundingId));
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
