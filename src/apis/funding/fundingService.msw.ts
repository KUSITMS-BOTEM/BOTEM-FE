import { faker } from "@faker-js/faker";
import { delay, http, HttpResponse } from "msw";

import type { ClosedFundingListResponse } from "@/types/funding/closedFunding";
import type { FundingRevealResponse } from "@/types/funding/funding";

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

export const fundingHandlers = [
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
];
