import type { FundingDetailResponse } from "@/types/funding/fundingDetail";
import { toFundingCompleteData } from "@/utils/funding/toFundingCompleteData";

const detail = {
  celebrantName: "지유",
  product: { name: "에어팟 프로 3", imageUrl: "https://image.example.com/p.jpg" },
  deadline: "2026-11-30T23:59:59",
  participantCount: 2,
  participants: [
    { order: 1, name: "하린", profileImageUrl: null },
    { order: 2, name: "민지", profileImageUrl: null },
  ],
} as FundingDetailResponse;

describe("toFundingCompleteData", () => {
  it("상세 응답을 완료 화면 값으로 바꾼다", () => {
    expect(toFundingCompleteData(detail, { giverName: "민지" })).toEqual({
      hostName: "지유",
      giverName: "민지",
      contributionOrder: 2,
      productName: "에어팟 프로 3",
      productImageUrl: "https://image.example.com/p.jpg",
      deadline: "2026-11-30T23:59:59",
    });
  });

  it("내 이름을 참여자에서 못 찾으면 참여자 수를 순번으로 쓴다", () => {
    const result = toFundingCompleteData(detail, { giverName: "없는이름" });

    expect(result.contributionOrder).toBe(2);
  });
});
