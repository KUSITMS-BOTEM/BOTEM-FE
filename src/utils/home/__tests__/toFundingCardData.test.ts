import type { HomeFundingCardResponse } from "@/types/home/home";
import { toFundingCardData } from "@/utils/home/toFundingCardData";

const makeCard = (overrides: Partial<HomeFundingCardResponse> = {}): HomeFundingCardResponse => ({
  fundingId: 1,
  shareKey: "share-key-1",
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
  recipientName: null,
  surpriseStage: null,
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

  it("생일 펀딩은 '{닉네임}님의 펀딩' 제목이고 서프라이즈가 아니다", () => {
    const result = toFundingCardData(makeCard({ fundingType: "BIRTHDAY" }), "지유");

    expect(result.title).toBe("지유님의 펀딩");
    expect(result.isSurprise).toBe(false);
  });

  it("서프라이즈 펀딩은 '{닉네임}님의 펀딩' 제목이고 서프라이즈로 표시한다", () => {
    const result = toFundingCardData(makeCard({ fundingType: "SURPRISE" }), "지유");

    expect(result.title).toBe("지유님의 펀딩");
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

  describe("서프라이즈 펀딩", () => {
    const surprise = (overrides: Partial<HomeFundingCardResponse> = {}) =>
      makeCard({ fundingType: "SURPRISE", recipientName: "지유", ...overrides });

    it("진행 중 100%이고 확인 대기가 없으면 earlyOpenable이 false여도 earlyComplete다", () => {
      const result = toFundingCardData(
        surprise({ confirmedPercentage: 100, earlyOpenable: false }),
        "민준",
      );

      expect(result.type).toBe("earlyComplete");
    });

    it("진행 중 100% 미만이면 earlyOpenable이 true여도 default다", () => {
      const result = toFundingCardData(
        surprise({ confirmedPercentage: 99, earlyOpenable: true }),
        "민준",
      );

      expect(result.type).toBe("default");
    });

    it("진행 중 100%여도 확인 대기가 남아 있으면 default다", () => {
      const result = toFundingCardData(
        surprise({ confirmedPercentage: 100, pendingContributionCount: 1 }),
        "민준",
      );

      expect(result.type).toBe("default");
    });

    it("마감 후 확인 대기가 있으면 notification이다", () => {
      const result = toFundingCardData(
        surprise({ cardType: "CLOSED_UNOPENED", pendingContributionCount: 2 }),
        "민준",
      );

      expect(result.type).toBe("notification");
    });

    it("마감 후 선물 준비 전이고 확인 대기가 없으면 complete다", () => {
      const result = toFundingCardData(
        surprise({ cardType: "CLOSED_UNOPENED", surpriseStage: "GIFT_PREPARING" }),
        "민준",
      );

      expect(result.type).toBe("complete");
    });

    it("선물 준비를 마친 카드는 확인 대기와 무관하게 칩 없는 default다", () => {
      const result = toFundingCardData(
        surprise({
          cardType: "CLOSED_UNOPENED",
          surpriseStage: "GIFT_PREPARED",
          pendingContributionCount: 1,
        }),
        "민준",
      );

      expect(result.type).toBe("default");
      expect(result.fxLabelText).toBeUndefined();
    });

    it.each([
      [100, 0, "다 모였어요. 선물을 준비할까요?"],
      [120, 2, "확인 대기 2건을 확인하면 열어볼 수 있어요"],
      [99, 0, "마감됐어요. 선물을 준비할까요?"],
      [60, 3, "마감됐어요. 확인 대기 3건부터 확인해요"],
    ])(
      "선물 준비 전 마감 카드는 달성률 %i%%·확인 대기 %i건이면 칩 문구가 '%s'다",
      (confirmedPercentage, pendingContributionCount, label) => {
        const result = toFundingCardData(
          surprise({
            cardType: "CLOSED_UNOPENED",
            surpriseStage: "GIFT_PREPARING",
            confirmedPercentage,
            pendingContributionCount,
          }),
          "민준",
        );

        expect(result.fxLabelText).toBe(label);
      },
    );

    it("진행 중 카드와 생일 펀딩은 칩 문구를 바꾸지 않는다", () => {
      expect(toFundingCardData(surprise({ confirmedPercentage: 100 }), "민준").fxLabelText).toBe(
        undefined,
      );
      expect(
        toFundingCardData(
          makeCard({ cardType: "CLOSED_UNOPENED", confirmedPercentage: 100 }),
          "민준",
        ).fxLabelText,
      ).toBeUndefined();
    });

    it("선물 준비를 마친 카드는 받침 없는 받는 사람 이름에 '가'를 붙여 아직 못받았다는 라벨을 만든다", () => {
      const result = toFundingCardData(
        surprise({
          cardType: "CLOSED_UNOPENED",
          surpriseStage: "GIFT_PREPARED",
          recipientName: "지유",
        }),
        "민준",
      );

      expect(result.statusLabel).toBe("지유가 아직 못받았어요");
    });

    it("선물 준비를 마친 카드는 받침 있는 받는 사람 이름에 '이'를 붙여 라벨을 만든다", () => {
      const result = toFundingCardData(
        surprise({
          cardType: "CLOSED_UNOPENED",
          surpriseStage: "GIFT_PREPARED",
          recipientName: "민준",
        }),
        "지유",
      );

      expect(result.statusLabel).toBe("민준이 아직 못받았어요");
    });

    it("선물 준비 전 마감 카드에는 아직 못받았다는 라벨이 없다", () => {
      const result = toFundingCardData(
        surprise({ cardType: "CLOSED_UNOPENED", surpriseStage: "GIFT_PREPARING" }),
        "민준",
      );

      expect(result.statusLabel).toBeUndefined();
    });

    it("받는 사람 이름이 null이면 라벨이 없다", () => {
      const result = toFundingCardData(
        surprise({
          cardType: "CLOSED_UNOPENED",
          surpriseStage: "GIFT_PREPARED",
          recipientName: null,
        }),
        "민준",
      );

      expect(result.statusLabel).toBeUndefined();
    });

    it("받는 사람 이름이 빈 문자열이면 라벨이 없다", () => {
      const result = toFundingCardData(
        surprise({
          cardType: "CLOSED_UNOPENED",
          surpriseStage: "GIFT_PREPARED",
          recipientName: "",
        }),
        "민준",
      );

      expect(result.statusLabel).toBeUndefined();
    });

    it("진행 중 카드에는 라벨이 없다", () => {
      expect(toFundingCardData(surprise({ cardType: "IN_PROGRESS" }), "민준").statusLabel).toBe(
        undefined,
      );
    });

    it("생일 펀딩은 마감돼도 받는 사람 이름이 있어도 라벨이 없다", () => {
      const result = toFundingCardData(
        makeCard({ fundingType: "BIRTHDAY", cardType: "CLOSED_UNOPENED", recipientName: "지유" }),
        "민준",
      );

      expect(result.statusLabel).toBeUndefined();
    });
  });
});
