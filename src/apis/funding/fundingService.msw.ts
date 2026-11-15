import { delay, http, HttpResponse } from "msw";

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

export const fundingHandlers = [
  http.get("*/api/fundings/:fundingId/reveal", async ({ params }) => {
    await delay(300);
    const data = MOCK_REVEALS[Number(params.fundingId)] ?? EMPTY_REVEAL;
    return HttpResponse.json({ success: true, data, error: null });
  }),
];
