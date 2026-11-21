import type {
  OwnerFundingDetailResponse,
  OwnerFundingParticipantResponse,
} from "@/types/funding/ownerFundingDetail";
import { calcFundingPercent } from "@/utils/funding/fundingProgress";
import { formatSurpriseTitle, toOwnerFundingView } from "@/utils/funding/toOwnerFundingView";

const participant = (
  contributionId: number,
  order: number,
  profileImageUrl: string | null = null,
): OwnerFundingParticipantResponse => ({
  contributionId,
  order,
  name: `참여자${order}`,
  profileImageUrl,
  status: "CONFIRMED",
  participatedAt: "2026-11-20T14:03:12",
  thankCardSent: false,
  thankCardSentAt: null,
});

const detail = (overrides: Partial<OwnerFundingDetailResponse> = {}) =>
  ({
    type: "BIRTHDAY",
    title: "지유의 생일",
    story: "사연",
    promise: "약속",
    product: {
      name: "헤드폰",
      imageUrl: "https://image.example.com/p.jpg",
      price: 459000,
      url: "",
    },
    targetAmount: 459000,
    deadline: "2026-11-30T23:59:59.999999",
    confirmedPercentage: 45,
    pendingContributionCount: 2,
    participantCount: 0,
    participants: [],
    messageCount: 3,
    ...overrides,
  }) as OwnerFundingDetailResponse;

describe("toOwnerFundingView", () => {
  it("달성률은 금액에서 다시 계산하지 않고 서버 확정 달성률을 그대로 옮긴다 (100 초과는 100)", () => {
    // 50000원의 58%는 29000원이지만 29000/50000*100은 부동소수점으로 57.99…가 된다
    expect(
      toOwnerFundingView(detail({ targetAmount: 50000, confirmedPercentage: 58 })).progress,
    ).toBe(58);
    expect(toOwnerFundingView(detail({ confirmedPercentage: 120 })).progress).toBe(100);
  });

  it("제목·사연·약속·상품·마감일(YYYY-MM-DD)·확인 대기 건수를 화면 값으로 옮긴다", () => {
    expect(toOwnerFundingView(detail())).toMatchObject({
      title: "지유의 생일",
      story: "사연",
      pledge: "약속",
      productName: "헤드폰",
      deadline: "2026-11-30",
      pendingContributionCount: 2,
      messageCount: 3,
    });
  });

  it("서버 관리 상태가 CLOSED면 금액·마감일과 상관없이 마감으로 옮기고, 진행 중이면 마감이 아니다", () => {
    expect(
      toOwnerFundingView(
        detail({
          managementState: "CLOSED",
          earlyClosedAt: "2026-11-20T10:00:00",
          confirmedPercentage: 50,
          deadline: "2099-12-31T23:59:59",
        }),
      ).closed,
    ).toBe(true);
    expect(toOwnerFundingView(detail({ managementState: "IN_PROGRESS" })).closed).toBe(false);
  });

  it("제목이 없으면 펀딩 종류로 제목을 정하고, 사연·약속이 없으면 빈 문자열로 둔다", () => {
    expect(
      toOwnerFundingView(detail({ title: null, story: null, promise: null, type: "BIRTHDAY" })),
    ).toMatchObject({ title: "생일 펀딩", story: "", pledge: "" });
  });

  it("서프라이즈 펀딩은 '{닉네임}의 펀딩' 제목을 두 줄로 나누고, 형식이 다르면 서버 제목을 쓴다", () => {
    expect(toOwnerFundingView(detail({ type: "SURPRISE", title: "지유의 펀딩" })).title).toBe(
      "지유의\n서프라이즈 펀딩",
    );
    expect(toOwnerFundingView(detail({ type: "SURPRISE", title: "지유의 생일" })).title).toBe(
      "지유의 생일",
    );
    expect(toOwnerFundingView(detail({ type: "SURPRISE", title: null })).title).toBe(
      "서프라이즈 펀딩",
    );
  });

  it("formatSurpriseTitle은 이름 뒤에서 줄을 나눠 서프라이즈 제목을 만든다", () => {
    expect(formatSurpriseTitle("서연")).toBe("서연의\n서프라이즈 펀딩");
  });

  it.each([0, 1, 33, 45, 99, 100])(
    "확정 달성률 %i%%를 진행 카드가 다시 계산해도 같은 값이 나오는 금액으로 바꾼다",
    confirmedPercentage => {
      const { currentAmount, targetAmount } = toOwnerFundingView(
        detail({ confirmedPercentage, targetAmount: 123457 }),
      );

      expect(calcFundingPercent(currentAmount, targetAmount)).toBe(confirmedPercentage);
    },
  );

  it("같은 사람이 여러 번 보탠 줄은 한 명으로 묶어 최대 3명만 프로필로 보여주고 나머지는 숫자로 센다", () => {
    const view = toOwnerFundingView(
      detail({
        participantCount: 5,
        participants: [
          participant(1, 1, "https://image.example.com/a.jpg"),
          participant(2, 1),
          participant(3, 2),
          participant(4, 3, "javascript:alert(1)"),
          participant(5, 4),
        ],
      }),
    );

    expect(view.profiles).toEqual([
      { color: "orange", imageUrl: "https://image.example.com/a.jpg" },
      { color: "lime", imageUrl: undefined },
      { color: "pink", imageUrl: undefined },
    ]);
    expect(view.extraParticipantCount).toBe(2);
  });

  it("연장 여부·가능한 관리 동작을 그대로 옮긴다", () => {
    const actions = {
      canCloseEarly: false,
      canExtend: true,
      canChangeProduct: false,
      canReissueShareCard: true,
    };

    expect(toOwnerFundingView(detail({ extended: true, actions }))).toMatchObject({
      extended: true,
      actions,
    });
  });

  it("참여자를 한 사람당 한 줄의 친구 목록으로 옮기고 안전하지 않은 프로필 주소는 버린다", () => {
    const view = toOwnerFundingView(
      detail({
        participants: [
          { ...participant(1, 1, "https://image.example.com/a.jpg"), thankCardSent: true },
          participant(2, 1),
          participant(3, 2, "javascript:alert(1)"),
        ],
      }),
    );

    expect(view.friends).toEqual([
      {
        id: 1,
        name: "참여자1",
        contributedAt: "2026-11-20T14:03:12",
        profileImageUrl: "https://image.example.com/a.jpg",
        thankCardSent: true,
      },
      {
        id: 3,
        name: "참여자2",
        contributedAt: "2026-11-20T14:03:12",
        profileImageUrl: undefined,
        thankCardSent: false,
      },
    ]);
  });
});
