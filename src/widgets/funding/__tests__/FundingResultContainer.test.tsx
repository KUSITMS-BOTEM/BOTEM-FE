import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useChooseGiftMutation } from "@/hooks/mutations/funding/useChooseGiftMutation";
import { useExtendFundingMutation } from "@/hooks/mutations/funding/useExtendFundingMutation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useFundingExtendToastStore } from "@/store/fundingExtendToastStore";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import type { FundingResultResponse } from "@/types/funding/fundingResult";
import FundingResultContainer from "@/widgets/funding/FundingResultContainer";

const replace = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
}));
vi.mock("@/hooks/queries/funding/useFundingResultQuery", () => ({
  useFundingResultQuery: vi.fn(),
}));
vi.mock("@/hooks/queries/funding/useFundingManagementQuery", () => ({
  useFundingManagementQuery: vi.fn(),
}));
vi.mock("@/hooks/mutations/funding/useExtendFundingMutation", () => ({
  useExtendFundingMutation: vi.fn(),
}));
vi.mock("@/hooks/mutations/funding/useChooseGiftMutation", () => ({
  useChooseGiftMutation: vi.fn(),
}));
vi.mock("@/widgets/funding/FundingResultCelebration", () => ({
  default: ({ contributors }: { contributors: unknown[] }) => (
    <div data-testid="celebration" data-count={contributors.length} />
  ),
}));

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않아 open 속성만 토글하도록 대체한다
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

const refetchResult = vi.fn();
const extendMutate = vi.fn();
const chooseGiftMutate = vi.fn();
const refetchManagement = vi.fn();

type QueryState<T> = { data?: T; isLoading?: boolean };

const mockQueries = ({
  result = {},
  management = {},
}: {
  result?: QueryState<FundingResultResponse>;
  management?: QueryState<OwnerFundingDetailResponse>;
}) => {
  vi.mocked(useFundingResultQuery).mockReturnValue({
    data: undefined,
    isLoading: false,
    refetch: refetchResult,
    ...result,
  } as unknown as ReturnType<typeof useFundingResultQuery>);
  vi.mocked(useFundingManagementQuery).mockReturnValue({
    data: undefined,
    isLoading: false,
    refetch: refetchManagement,
    ...management,
  } as unknown as ReturnType<typeof useFundingManagementQuery>);
  vi.mocked(useExtendFundingMutation).mockReturnValue({
    mutate: extendMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useExtendFundingMutation>);
  vi.mocked(useChooseGiftMutation).mockReturnValue({
    mutate: chooseGiftMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useChooseGiftMutation>);
};

const makeResult = (
  achievementPercentage: number,
  confirmedAmount: number,
): FundingResultResponse => ({
  fundingId: 7,
  productName: "소니 WH-1000XM5",
  productImageUrl: "https://image.example.com/product.jpg",
  targetAmount: 364000,
  confirmedAmount,
  achievementPercentage,
  targetReached: achievementPercentage >= 100,
  participantCount: 2,
  messageCount: 2,
  pendingContributionCount: 0,
  pendingCleanupRequired: false,
  resultOpenedAt: "2026-11-15T00:00:00",
  contributions: [1, 2].map(contributionId => ({
    contributionId,
    name: `친구${contributionId}`,
    profileImageUrl: null,
    status: "CONFIRMED" as const,
    participatedAt: "2026-11-10T14:20:00",
    hasMessage: true,
    hasPhoto: false,
    hasVoice: false,
    thankCardSent: false,
  })),
});

const makeManagement = (
  overrides: Partial<OwnerFundingDetailResponse> = {},
): OwnerFundingDetailResponse => ({
  shareKey: "share-key-7",
  fundingId: 7,
  type: "BIRTHDAY",
  title: null,
  celebrantName: "지유",
  story: null,
  promise: null,
  product: {
    name: "에어팟 프로 2",
    imageUrl: "https://image.example.com/airpods.jpg",
    price: 400000,
    url: "https://shop.example.com/airpods",
  },
  productChanged: false,
  productChangedAt: null,
  targetAmount: 364000,
  deadline: "2026-11-13T23:59:59.999999",
  revealAt: null,
  remainingDays: null,
  confirmedPercentage: 82,
  pendingPercentage: 0,
  pendingContributionCount: 0,
  targetReached: false,
  extended: false,
  earlyClosedAt: null,
  giftPreparedAt: null,
  participantCount: 2,
  participants: [],
  messageCount: 2,
  managementState: "CLOSED",
  actions: {
    canCloseEarly: false,
    canExtend: true,
    canChangeProduct: false,
    canReissueShareCard: false,
  },
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("FundingResultContainer", () => {
  it("fundingId를 숫자로 바꿔 결과와 관리 상세를 조회한다", () => {
    mockQueries({ result: { isLoading: true }, management: { isLoading: true } });

    render(<FundingResultContainer fundingId="7" />);

    expect(useFundingResultQuery).toHaveBeenCalledWith(7);
    expect(useFundingManagementQuery).toHaveBeenCalledWith(7);
  });

  it("둘 중 하나라도 로딩 중이면 로딩 안내를 보여준다", () => {
    mockQueries({ result: { data: makeResult(100, 364000) }, management: { isLoading: true } });

    render(<FundingResultContainer fundingId="7" />);

    expect(screen.getByRole("status")).toHaveTextContent("펀딩 결과를 불러오는 중이에요");
  });

  it("관리 상세 조회에 실패하면 에러를 보여주고 '다시 시도'는 실패한 쪽만 다시 조회한다", async () => {
    mockQueries({ result: { data: makeResult(100, 364000) } });
    render(<FundingResultContainer fundingId="7" />);

    expect(screen.getByText("펀딩 결과를 불러오지 못했어요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetchManagement).toHaveBeenCalledTimes(1);
    expect(refetchResult).not.toHaveBeenCalled();
  });

  it("결과 조회에 실패하면 결과만 다시 조회한다", async () => {
    mockQueries({ management: { data: makeManagement() } });
    render(<FundingResultContainer fundingId="7" />);

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(refetchResult).toHaveBeenCalledTimes(1);
    expect(refetchManagement).not.toHaveBeenCalled();
  });

  it("달성률이 100% 이상이면 확정 금액으로 달성 화면을 보여주고 관리 상세의 상품 가격을 쓴다", () => {
    mockQueries({
      result: { data: makeResult(100, 364000) },
      management: { data: makeManagement() },
    });

    render(<FundingResultContainer fundingId="7" />);

    expect(
      screen.getByRole("heading", { name: /364,000원이\s*모두 모였어요/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("400,000원")).toBeInTheDocument();
    expect(screen.getByText("에어팟 프로 2")).toBeInTheDocument();
    expect(screen.getByTestId("celebration")).toHaveAttribute("data-count", "2");
  });

  it("달성률이 100% 미만이면 관리 상세의 상품 가격으로 차액을 계산한다", () => {
    mockQueries({
      result: { data: makeResult(99, 300000) },
      management: { data: makeManagement() },
    });

    render(<FundingResultContainer fundingId="7" />);

    expect(
      screen.getByRole("heading", { name: /300,000원이\s*모였어요\s*어떻게 할까요\?/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/차액 100,000원만/)).toBeInTheDocument();
    expect(screen.getByText("기존 선물")).toBeInTheDocument();
  });

  it("상품을 바꾼 펀딩이면 '변경한 선물'로 표시한다", () => {
    mockQueries({
      result: { data: makeResult(50, 200000) },
      management: { data: makeManagement({ productChanged: true }) },
    });

    render(<FundingResultContainer fundingId="7" />);

    expect(screen.getByText("변경한 선물")).toBeInTheDocument();
  });

  it("연장할 수 없는 펀딩이면 기간연장 버튼을 보여주지 않는다", () => {
    mockQueries({
      result: { data: makeResult(50, 200000) },
      management: {
        data: makeManagement({
          extended: true,
          actions: {
            canCloseEarly: false,
            canExtend: false,
            canChangeProduct: false,
            canReissueShareCard: false,
          },
        }),
      },
    });

    render(<FundingResultContainer fundingId="7" />);

    expect(screen.queryByRole("button", { name: "기간연장 (1회)" })).not.toBeInTheDocument();
  });

  it("기간연장 시트는 관리 상세의 마감일을 기존 마감일로 보여준다", async () => {
    mockQueries({
      result: { data: makeResult(50, 200000) },
      management: { data: makeManagement() },
    });
    render(<FundingResultContainer fundingId="7" />);

    await userEvent.click(screen.getByRole("button", { name: "기간연장 (1회)" }));

    expect(screen.getByText(/기존 마감일은 11월 13일까지에요/)).toBeInTheDocument();
  });

  it("닫기를 누르면 홈으로 이동하며 결과 화면을 히스토리에서 지운다", async () => {
    mockQueries({
      result: { data: makeResult(100, 364000) },
      management: { data: makeManagement() },
    });
    render(<FundingResultContainer fundingId="7" />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home");
  });

  describe("구매", () => {
    type ChooseGiftOptions = {
      onSuccess: (data: { productUrl: string }) => void;
      onError: () => void;
    };
    const makeTab = () =>
      ({ opener: {}, location: { href: "" }, close: vi.fn() }) as unknown as Window;
    const lastOptions = () => chooseGiftMutate.mock.lastCall![1] as ChooseGiftOptions;

    beforeEach(() => chooseGiftMutate.mockReset());

    it.each([
      ["목표 달성", 100, "쿠팡에서 선물 사러 가기"],
      ["목표 미달", 50, "차액으로 구매"],
    ])("%s: '%s' 버튼을 누르면 선물 선택을 저장한다", async (_, percentage, label) => {
      mockQueries({
        result: { data: makeResult(percentage as number, 200000) },
        management: { data: makeManagement() },
      });
      const open = vi.spyOn(window, "open").mockImplementation(() => makeTab());
      render(<FundingResultContainer fundingId="7" />);

      await userEvent.click(screen.getByRole("button", { name: label as string }));

      expect(chooseGiftMutate).toHaveBeenCalledTimes(1);
      open.mockRestore();
    });

    it("응답을 기다리기 전에 빈 탭을 열고, 성공하면 응답의 상품 링크로 보낸다", async () => {
      mockQueries({
        result: { data: makeResult(100, 364000) },
        management: { data: makeManagement() },
      });
      const tab = makeTab();
      const open = vi.spyOn(window, "open").mockImplementation(() => tab);
      render(<FundingResultContainer fundingId="7" />);

      await userEvent.click(screen.getByRole("button", { name: "쿠팡에서 선물 사러 가기" }));
      expect(open).toHaveBeenCalledWith("", "_blank");
      lastOptions().onSuccess({ productUrl: "https://www.coupang.com/vp/products/1" });

      expect(tab.opener).toBeNull();
      expect(tab.location.href).toBe("https://www.coupang.com/vp/products/1");
      open.mockRestore();
    });

    it("응답의 상품 링크가 http(s)가 아니면 열어 둔 탭을 닫는다", async () => {
      mockQueries({
        result: { data: makeResult(100, 364000) },
        management: { data: makeManagement() },
      });
      const tab = makeTab();
      const open = vi.spyOn(window, "open").mockImplementation(() => tab);
      render(<FundingResultContainer fundingId="7" />);

      await userEvent.click(screen.getByRole("button", { name: "쿠팡에서 선물 사러 가기" }));
      lastOptions().onSuccess({ productUrl: "javascript:alert(1)" });

      expect(tab.close).toHaveBeenCalled();
      expect(tab.location.href).toBe("");
      open.mockRestore();
    });

    it("선물 선택 저장에 실패하면 열어 둔 탭을 닫는다", async () => {
      mockQueries({
        result: { data: makeResult(50, 200000) },
        management: { data: makeManagement() },
      });
      const tab = makeTab();
      const open = vi.spyOn(window, "open").mockImplementation(() => tab);
      render(<FundingResultContainer fundingId="7" />);

      await userEvent.click(screen.getByRole("button", { name: "차액으로 구매" }));
      lastOptions().onError();

      expect(tab.close).toHaveBeenCalled();
      open.mockRestore();
    });
  });

  it("닫기를 누르면 다른 선물 고르기에서 기억해 둔 상태를 비운다", async () => {
    mockQueries({
      result: { data: makeResult(50, 200000) },
      management: { data: makeManagement() },
    });
    useGiftChangeStore.getState().start(7, null);
    render(<FundingResultContainer fundingId="7" />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(useGiftChangeStore.getState().fundingId).toBeNull();
  });

  it("연장에 성공하면 펀딩 상세로 돌아가며 연장 토스트를 예약한다", async () => {
    mockQueries({
      result: { data: makeResult(50, 200000) },
      management: { data: makeManagement() },
    });
    extendMutate.mockImplementation((_date: string, options: { onSuccess: () => void }) =>
      options.onSuccess(),
    );
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 13));
    const user = userEvent.setup();
    render(<FundingResultContainer fundingId="7" />);

    await user.click(screen.getByRole("button", { name: "기간연장 (1회)" }));
    await user.click(screen.getByRole("button", { name: "새 마감일 날짜를 선택해주세요" }));
    await user.click(screen.getByRole("button", { name: /11월 20일/ }));
    await user.click(screen.getByRole("button", { name: "연장하기" }));
    vi.useRealTimers();

    expect(extendMutate.mock.calls[0][0]).toBe("2026-11-20");
    expect(replace).toHaveBeenCalledWith("/funding/7");
    expect(useFundingExtendToastStore.getState().pending).toBe(true);
  });
});
