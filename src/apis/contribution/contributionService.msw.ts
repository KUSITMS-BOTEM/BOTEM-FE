import { delay, http, HttpResponse } from "msw";

import type {
  ContributionStatus,
  UpdateContributionStatusRequest,
} from "@/types/contribution/contribution";

const MOCK_CONTRIBUTIONS = [
  { contributionId: 1, senderName: "하린이", depositMethod: "토스뱅크 계좌" },
  { contributionId: 2, senderName: "도윤이", depositMethod: "토스뱅크 계좌" },
  { contributionId: 3, senderName: "서준이", depositMethod: "토스뱅크 계좌" },
  { contributionId: 4, senderName: "지아", depositMethod: "토스뱅크 계좌" },
];

// 받았어요·못받았어요·취소하기 흐름을 새로고침 전까지 이어서 확인할 수 있게 상태를 메모리에 둔다
const statusById = new Map<number, ContributionStatus>(
  MOCK_CONTRIBUTIONS.map(({ contributionId }) => [contributionId, "PENDING"]),
);

export const contributionHandlers = [
  http.get("*/api/fundings/:fundingId/contributions/pending", async () => {
    await delay(800);
    const contributions = MOCK_CONTRIBUTIONS.filter(
      ({ contributionId }) => statusById.get(contributionId) === "PENDING",
    );
    return HttpResponse.json({ success: true, data: { contributions }, error: null });
  }),
  http.patch("*/api/fundings/:fundingId/contributions/status", async ({ request }) => {
    await delay(300);
    const { contributionIds, status } = (await request.json()) as UpdateContributionStatusRequest;
    contributionIds.forEach(id => statusById.set(id, status));
    return HttpResponse.json({ success: true, data: null, error: null });
  }),
];
