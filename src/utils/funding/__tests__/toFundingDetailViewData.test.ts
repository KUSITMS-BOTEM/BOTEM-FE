import { MOCK_FUNDING_MANAGEMENT } from "@/apis/funding/fundingService.msw";
import type {
  FundingManagementParticipant,
  FundingManagementResponse,
} from "@/types/funding/fundingManagement";
import { calcFundingPercent } from "@/utils/funding/fundingProgress";
import { toFundingDetailViewData } from "@/utils/funding/toFundingDetailViewData";

const participant = (
  overrides: Partial<FundingManagementParticipant>,
): FundingManagementParticipant => ({
  contributionId: 1,
  order: 1,
  name: "민수",
  profileImageUrl: null,
  status: "CONFIRMED",
  participatedAt: "2026-11-10T09:00:00",
  thankCardSent: false,
  thankCardSentAt: null,
  ...overrides,
});

const management = (overrides: Partial<FundingManagementResponse> = {}) => ({
  ...MOCK_FUNDING_MANAGEMENT,
  ...overrides,
});

describe("toFundingDetailViewData", () => {
  it("제목·사연·공약·상품·목표액을 옮기고 마감일은 날짜만 남긴다", () => {
    const data = toFundingDetailViewData(management());

    expect(data).toMatchObject({
      title: "지유의 생일",
      story: MOCK_FUNDING_MANAGEMENT.story,
      pledge: MOCK_FUNDING_MANAGEMENT.promise,
      productName: "소니 WH-1000XM5",
      productImageUrl: MOCK_FUNDING_MANAGEMENT.product.imageUrl,
      targetAmount: 123456789,
      deadline: "2026-12-31",
    });
  });

  it("제목·사연·공약이 null이면 빈 제목과 undefined로 바꾼다", () => {
    const data = toFundingDetailViewData(management({ title: null, story: null, promise: null }));

    expect(data.title).toBe("");
    expect(data.story).toBeUndefined();
    expect(data.pledge).toBeUndefined();
  });

  it("달성률로 만든 금액을 카드가 다시 계산해도 같은 달성률이 나온다", () => {
    const data = toFundingDetailViewData(
      management({ targetAmount: 123456789, confirmedPercentage: 60 }),
    );

    expect(calcFundingPercent(data.currentAmount, data.targetAmount)).toBe(60);
  });

  it("목표를 달성했으면 금액을 목표액으로 둔다", () => {
    const data = toFundingDetailViewData(
      management({ targetAmount: 50000, confirmedPercentage: 99, targetReached: true }),
    );

    expect(data.currentAmount).toBe(50000);
  });

  it("같은 사람이 여러 번 보태면 첫 참여만 남기고 프로필은 순서대로 최대 3명이다", () => {
    const data = toFundingDetailViewData(
      management({
        participantCount: 4,
        participants: [
          participant({ contributionId: 22, order: 2, participatedAt: "2026-11-15T00:00:00" }),
          participant({ contributionId: 21, order: 2, participatedAt: "2026-11-11T00:00:00" }),
          participant({ contributionId: 10, order: 1, profileImageUrl: "https://a.com/1.png" }),
          participant({ contributionId: 30, order: 3 }),
          participant({ contributionId: 40, order: 4 }),
        ],
      }),
    );

    expect(data.friends.map(friend => friend.id)).toEqual([10, 21, 30, 40]);
    expect(data.profiles).toEqual([
      { order: 1, imageUrl: "https://a.com/1.png" },
      { order: 2, imageUrl: undefined },
      { order: 3, imageUrl: undefined },
    ]);
  });

  it("추가 인원은 참여자 수에서 보이는 프로필 수를 빼고 0 아래로 내려가지 않는다", () => {
    expect(toFundingDetailViewData(management({ participantCount: 5 })).extraParticipantCount).toBe(
      2,
    );
    expect(
      toFundingDetailViewData(management({ participantCount: 0, participants: [] }))
        .extraParticipantCount,
    ).toBe(0);
  });
});
