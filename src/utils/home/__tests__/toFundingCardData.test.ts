import type { HomeFundingCardResponse } from "@/types/home/home";
import { toFundingCardData } from "@/utils/home/toFundingCardData";

const makeCard = (overrides: Partial<HomeFundingCardResponse> = {}): HomeFundingCardResponse => ({
  fundingId: 1,
  cardType: "IN_PROGRESS",
  fundingType: "BIRTHDAY",
  productName: "무선 헤드폰",
  productImageUrl: "https://example.com/headphone.png",
  targetAmount: 300000,
  participantCount: 0,
  participantPreviews: [],
  remainingDays: 7,
  confirmedPercentage: 55,
  pendingPercentage: 15,
  pendingContributionCount: 0,
  earlyOpenable: false,
  ...overrides,
});

describe("toFundingCardData", () => {
  it("진행 중 카드는 default 타입이고 남은 일수를 그대로 전달한다", () => {
    const result = toFundingCardData(makeCard({ remainingDays: 3 }), "지유");

    expect(result.type).toBe("default");
    expect(result.dDay).toBe(3);
  });

  it("마감 전이라도 earlyOpenable이면 earlyComplete 타입이고 남은 일수를 유지한다", () => {
    const result = toFundingCardData(
      makeCard({
        confirmedPercentage: 120,
        pendingPercentage: 0,
        remainingDays: 5,
        earlyOpenable: true,
      }),
      "지유",
    );

    expect(result.type).toBe("earlyComplete");
    expect(result.dDay).toBe(5);
  });

  it("earlyComplete 카드의 진행률은 확정·대기를 합친 전체 달성률(최대 100)이다", () => {
    expect(
      toFundingCardData(
        makeCard({ confirmedPercentage: 100, pendingPercentage: 0, earlyOpenable: true }),
        "지유",
      ).progress,
    ).toBe(100);
    expect(
      toFundingCardData(
        makeCard({ confirmedPercentage: 120, pendingPercentage: 0, earlyOpenable: true }),
        "지유",
      ).progress,
    ).toBe(100);
  });

  it("달성률이 100% 이상이어도 earlyOpenable이 false면 default 타입이다", () => {
    const result = toFundingCardData(
      makeCard({ confirmedPercentage: 100, pendingPercentage: 0, earlyOpenable: false }),
      "지유",
    );

    expect(result.type).toBe("default");
  });

  it("마감 후 확인 대기가 있으면 notification 타입이다", () => {
    const result = toFundingCardData(
      makeCard({ cardType: "CLOSED_UNOPENED", remainingDays: null, pendingContributionCount: 2 }),
      "지유",
    );

    expect(result.type).toBe("notification");
    expect(result.pendingCount).toBe(2);
  });

  it("마감 후 확인 대기가 없고 참여자가 있으면 complete 타입이다", () => {
    const result = toFundingCardData(
      makeCard({
        cardType: "CLOSED_UNOPENED",
        remainingDays: null,
        pendingContributionCount: 0,
        participantCount: 1,
      }),
      "지유",
    );

    expect(result.type).toBe("complete");
  });

  it("마감 후 확인 대기도 참여자도 없으면 open 타입이고 dDay는 null이다", () => {
    const result = toFundingCardData(
      makeCard({
        cardType: "CLOSED_UNOPENED",
        remainingDays: null,
        pendingContributionCount: 0,
        participantCount: 0,
      }),
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

  it("목표 금액을 그대로 넘긴다", () => {
    const result = toFundingCardData(makeCard({ targetAmount: 1500000 }), "지유");

    expect(result.targetAmount).toBe(1500000);
  });

  it("참여자 미리보기를 순서대로 orange·lime·pink 색으로 매핑하고 이미지 URL을 넘긴다", () => {
    const result = toFundingCardData(
      makeCard({
        participantCount: 3,
        participantPreviews: [
          { participantName: "민지", profileImageUrl: "https://example.com/a.png" },
          { participantName: "서준", profileImageUrl: "https://example.com/b.png" },
          { participantName: "하린", profileImageUrl: "https://example.com/c.png" },
        ],
      }),
      "지유",
    );

    expect(result.participants).toEqual([
      { color: "orange", imageUrl: "https://example.com/a.png" },
      { color: "lime", imageUrl: "https://example.com/b.png" },
      { color: "pink", imageUrl: "https://example.com/c.png" },
    ]);
  });

  it("프로필 이미지가 null이거나 http(s)가 아니면 imageUrl이 없다", () => {
    const result = toFundingCardData(
      makeCard({
        participantCount: 2,
        participantPreviews: [
          { participantName: "민지", profileImageUrl: null },
          { participantName: "서준", profileImageUrl: "javascript:alert(1)" },
        ],
      }),
      "지유",
    );

    expect(result.participants?.map(participant => participant.imageUrl)).toEqual([
      undefined,
      undefined,
    ]);
  });

  it("나머지 참여자 수는 전체에서 미리보기 수를 뺀 값이고 0보다 작아지지 않는다", () => {
    const preview = { participantName: "민지", profileImageUrl: null };

    expect(
      toFundingCardData(
        makeCard({ participantCount: 7, participantPreviews: [preview, preview, preview] }),
        "지유",
      ).extraParticipantCount,
    ).toBe(4);
    expect(
      toFundingCardData(makeCard({ participantCount: 0, participantPreviews: [preview] }), "지유")
        .extraParticipantCount,
    ).toBe(0);
  });

  it("진행률은 확인 대기 금액 비율을 쓴다", () => {
    const result = toFundingCardData(
      makeCard({ confirmedPercentage: 40, pendingPercentage: 30 }),
      "지유",
    );

    expect(result.progress).toBe(30);
  });
});
