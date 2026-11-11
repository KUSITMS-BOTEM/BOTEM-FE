import type { HomeFundingCardResponse } from "@/types/home/home";
import { toFundingCardData } from "@/utils/home/toFundingCardData";

const makeCard = (overrides: Partial<HomeFundingCardResponse> = {}): HomeFundingCardResponse => ({
  fundingId: 1,
  cardType: "IN_PROGRESS",
  fundingType: "BIRTHDAY",
  productName: "무선 헤드폰",
  productImageUrl: "https://example.com/headphone.png",
  remainingDays: 7,
  confirmedPercentage: 55,
  pendingPercentage: 15,
  pendingContributionCount: 0,
  ...overrides,
});

describe("toFundingCardData", () => {
  it("진행 중 카드는 default 타입이고 남은 일수를 그대로 전달한다", () => {
    const result = toFundingCardData(makeCard({ remainingDays: 3 }), "지유");

    expect(result.type).toBe("default");
    expect(result.dDay).toBe(3);
  });

  it("마감 후 확인대기가 있으면 notification 타입이다", () => {
    const result = toFundingCardData(
      makeCard({ cardType: "CLOSED_UNOPENED", remainingDays: null, pendingContributionCount: 2 }),
      "지유",
    );

    expect(result.type).toBe("notification");
    expect(result.pendingCount).toBe(2);
  });

  it("마감 후 확인대기가 없으면 open 타입이고 dDay는 null이다", () => {
    const result = toFundingCardData(
      makeCard({ cardType: "CLOSED_UNOPENED", remainingDays: null, pendingContributionCount: 0 }),
      "지유",
    );

    expect(result.type).toBe("open");
    expect(result.dDay).toBeNull();
  });

  it("생일 펀딩은 '{닉네임}님의 생일 펀딩' 제목이고 서프라이즈가 아니다", () => {
    const result = toFundingCardData(makeCard({ fundingType: "BIRTHDAY" }), "지유");

    expect(result.title).toBe("지유님의 생일 펀딩");
    expect(result.isSurprise).toBe(false);
  });

  it("서프라이즈 펀딩은 '{닉네임}님의 서프라이즈 펀딩' 제목이고 서프라이즈로 표시한다", () => {
    const result = toFundingCardData(makeCard({ fundingType: "SURPRISE" }), "지유");

    expect(result.title).toBe("지유님의 서프라이즈 펀딩");
    expect(result.isSurprise).toBe(true);
  });

  it("진행률은 확인 대기 금액 비율을 쓴다", () => {
    const result = toFundingCardData(
      makeCard({ confirmedPercentage: 40, pendingPercentage: 30 }),
      "지유",
    );

    expect(result.progress).toBe(30);
  });
});
