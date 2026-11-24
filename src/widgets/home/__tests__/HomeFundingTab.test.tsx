import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReducedMotion } from "framer-motion";

import { fundingService } from "@/apis/funding/fundingService";

import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useHomeNoFundingQuery } from "@/hooks/queries/home/useHomeNoFundingQuery";
import { useHomeSurpriseRevealsQuery } from "@/hooks/queries/home/useHomeSurpriseRevealsQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import type {
  HomeFundingCardResponse,
  HomeNoFundingResponse,
  SurpriseRevealCardResponse,
} from "@/types/home/home";
import HomeFundingTab from "@/widgets/home/HomeFundingTab";

vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(),
}));
vi.mock("@/hooks/queries/home/useHomeFundingsQuery");
vi.mock("@/hooks/queries/home/useHomeNoFundingQuery");
vi.mock("@/hooks/queries/home/useHomeSurpriseRevealsQuery");
vi.mock("@/widgets/home/SurpriseSendNowDialog", () => ({
  default: ({ fundingId }: { fundingId: number | null }) =>
    fundingId !== null ? <div role="alertdialog">지금 보낼까요 {fundingId}</div> : null,
}));
vi.mock("@/hooks/queries/user/useMyProfileQuery");
vi.mock("@/apis/funding/fundingService", () => ({
  fundingService: { getResult: vi.fn() },
}));
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("@/widgets/funding/DepositConfirmSheet", () => ({
  default: ({
    open,
    fundingId,
    onReveal,
    revealLabel = "팡! 열어보기",
  }: {
    open: boolean;
    fundingId: number | null;
    onReveal?: () => void;
    revealLabel?: string;
  }) =>
    open ? (
      <div role="dialog">
        입금 확인 {fundingId}
        {onReveal && <button onClick={onReveal}>{revealLabel}</button>}
      </div>
    ) : null,
}));

const fundingCard: HomeFundingCardResponse = {
  fundingId: 1,
  shareKey: "share-key-1",
  cardType: "IN_PROGRESS",
  fundingType: "BIRTHDAY",
  productName: "무선 헤드폰",
  productImageUrl: "/headphone.png",
  targetAmount: 300000,
  participantCount: 0,
  participantPreviews: [],
  remainingDays: 7,
  confirmedPercentage: 50,
  pendingPercentage: 0,
  pendingContributionCount: 0,
  earlyOpenable: false,
  recipientName: null,
  surpriseStage: null,
};

const makeNoFunding = (state: HomeNoFundingResponse["state"]): HomeNoFundingResponse => {
  const content =
    state === "WISH_RECOMMENDATION"
      ? [
          {
            wishId: 21,
            productName: "다이슨 에어랩",
            productImageUrl: "/airwrap.png",
            price: 699000,
            productUrl: "https://example.com",
          },
        ]
      : [];
  return {
    state,
    nickname: "지유",
    birthdayDday: null,
    wishes: { content, page: 0, size: 10, totalElements: content.length, hasNext: false },
  };
};

const fundingsRefetch = vi.fn();
const noFundingRefetch = vi.fn();

type QueryState = { data?: unknown; isError?: boolean };

const mockQueries = (fundings: QueryState, noFunding: QueryState = {}) => {
  vi.mocked(useHomeFundingsQuery).mockReturnValue({
    data: fundings.data,
    isError: fundings.isError ?? false,
    refetch: fundingsRefetch,
  } as unknown as ReturnType<typeof useHomeFundingsQuery>);
  vi.mocked(useHomeNoFundingQuery).mockReturnValue({
    data: noFunding.data,
    isError: noFunding.isError ?? false,
    refetch: noFundingRefetch,
  } as unknown as ReturnType<typeof useHomeNoFundingQuery>);
};

const mockSurpriseReveals = (cards: SurpriseRevealCardResponse[] | undefined) =>
  vi.mocked(useHomeSurpriseRevealsQuery).mockReturnValue({
    data: cards && { cards },
  } as unknown as ReturnType<typeof useHomeSurpriseRevealsQuery>);

const revealCard: SurpriseRevealCardResponse = {
  fundingId: 77,
  productImageUrl: "/gift.png",
  productName: "무선 이어폰",
  organizerName: "민준",
  participantCount: 4,
  revealAt: "2026-10-13T00:00:00",
};

const surpriseCard: HomeFundingCardResponse = {
  ...fundingCard,
  fundingId: 42,
  fundingType: "SURPRISE",
  recipientName: "하린",
  surpriseStage: null,
};

const fundingList = (cards: HomeFundingCardResponse[]) => ({
  fundingCards: cards,
  activeFundingCount: cards.length,
  canOpenFunding: true,
});

const renderTab = (
  onAddWish: () => void = vi.fn(),
  props: Partial<React.ComponentProps<typeof HomeFundingTab>> = {},
) =>
  render(<HomeFundingTab onAddWish={onAddWish} {...props} />, {
    wrapper: ({ children }) => (
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {children}
      </QueryClientProvider>
    ),
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useReducedMotion).mockReturnValue(true);
  mockSurpriseReveals([]);
  vi.mocked(useMyProfileQuery).mockReturnValue({
    data: { nickname: "지유" },
  } as unknown as ReturnType<typeof useMyProfileQuery>);
});

describe("HomeFundingTab", () => {
  it("펀딩 카드가 있으면 카드 캐러셀을 보여주고 펀딩 없는 홈은 요청하지 않는다", () => {
    mockQueries({ data: fundingList([fundingCard]) });

    renderTab();

    expect(screen.getByText("작은 보탬들이 차곡차곡 쌓이고 있어요")).toBeInTheDocument();
    expect(screen.getByText("지유님의 펀딩")).toBeInTheDocument();
    expect(useHomeNoFundingQuery).toHaveBeenCalledWith({ enabled: false });
  });

  it("펀딩이 없고 위시 추천 상태면 닉네임 제목과 위시 카드를 보여준다", () => {
    mockQueries({ data: fundingList([]) }, { data: makeNoFunding("WISH_RECOMMENDATION") });

    renderTab();

    expect(useHomeNoFundingQuery).toHaveBeenCalledWith({ enabled: true });
    expect(screen.getByText("지유님, 펀딩 열어볼까요?")).toBeInTheDocument();
    expect(screen.getByText("다이슨 에어랩")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "펀딩 열기" })).toBeInTheDocument();
  });

  it("펀딩도 위시도 없으면 빈 화면을 보여주고 '위시 추가하기'를 누르면 onAddWish를 호출한다", async () => {
    const onAddWish = vi.fn();
    mockQueries({ data: fundingList([]) }, { data: makeNoFunding("EMPTY") });

    renderTab(onAddWish);
    await userEvent.click(screen.getByRole("button", { name: "위시 추가하기" }));

    expect(screen.getByText("갖고 싶은걸 먼저 담아볼까요?")).toBeInTheDocument();
    expect(onAddWish).toHaveBeenCalledTimes(1);
  });

  it("펀딩 조회가 실패하면 다시 시도로 펀딩 조회를 다시 요청한다", async () => {
    mockQueries({ isError: true });

    renderTab();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(fundingsRefetch).toHaveBeenCalledTimes(1);
    expect(noFundingRefetch).not.toHaveBeenCalled();
  });

  it("펀딩 없는 홈 조회가 실패하면 다시 시도로 그 조회를 다시 요청한다", async () => {
    mockQueries({ data: fundingList([]) }, { isError: true });

    renderTab();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(noFundingRefetch).toHaveBeenCalledTimes(1);
    expect(fundingsRefetch).not.toHaveBeenCalled();
  });

  it("펀딩 카드가 있으면 이전에 실패한 펀딩 없는 홈 조회 에러는 무시하고 카드를 보여준다", () => {
    mockQueries({ data: fundingList([fundingCard]) }, { isError: true });

    renderTab();

    expect(screen.getByText("지유님의 펀딩")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("펀딩 재조회가 실패해도 이미 받은 카드가 있으면 카드를 계속 보여준다", () => {
    mockQueries({ data: fundingList([fundingCard]), isError: true });

    renderTab();

    expect(screen.getByText("지유님의 펀딩")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("펀딩 없는 홈 재조회가 실패해도 이미 받은 데이터가 있으면 그 화면을 계속 보여준다", () => {
    mockQueries(
      { data: fundingList([]) },
      { data: makeNoFunding("WISH_RECOMMENDATION"), isError: true },
    );

    renderTab();

    expect(screen.getByText("지유님, 펀딩 열어볼까요?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("조회 중에는 어떤 분기 화면도 보여주지 않는다", () => {
    mockQueries({});

    const { container } = renderTab();

    expect(container).toBeEmptyDOMElement();
  });
  it("확인 대기 보탬이 있는 마감 카드를 누르면 해당 펀딩 id로 입금 확인 시트가 열린다", async () => {
    mockQueries({
      data: fundingList([
        { ...fundingCard, fundingId: 42, cardType: "CLOSED_UNOPENED", pendingContributionCount: 2 },
      ]),
    });

    renderTab();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("입금 확인 42");
  });

  it("입금 확인 시트에서 팡! 열어보기를 누르면 그 펀딩의 결과 데이터를 받은 뒤 공개 화면으로 이동한다", async () => {
    vi.mocked(fundingService.getResult).mockResolvedValue(null);
    mockQueries({
      data: fundingList([
        { ...fundingCard, fundingId: 42, cardType: "CLOSED_UNOPENED", pendingContributionCount: 2 },
      ]),
    });

    renderTab();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));
    await userEvent.click(screen.getByRole("button", { name: "팡! 열어보기" }));

    expect(fundingService.getResult).toHaveBeenCalledWith(42);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/funding/42/reveal"));
  });

  it("진행 중(default) 카드를 누르면 펀딩 상세 화면으로 이동한다", async () => {
    mockQueries({ data: fundingList([fundingCard]) });

    renderTab();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));

    expect(push).toHaveBeenCalledWith("/funding/1");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("참여자가 없는 마감 카드(open)를 누르면 결과 데이터를 받은 뒤 공개 화면으로 이동한다", async () => {
    mockQueries({
      data: fundingList([
        { ...fundingCard, fundingId: 42, cardType: "CLOSED_UNOPENED", pendingContributionCount: 0 },
      ]),
    });

    renderTab();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));

    expect(fundingService.getResult).toHaveBeenCalledWith(42);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/funding/42/reveal"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("마감 카드를 누르면 결과 데이터를 받은 뒤에 공개 화면으로 이동한다", async () => {
    let resolveResult: (
      value: Awaited<ReturnType<typeof fundingService.getResult>>,
    ) => void = () => {};
    vi.mocked(fundingService.getResult).mockReturnValue(
      new Promise(resolve => {
        resolveResult = resolve;
      }),
    );
    mockQueries({
      data: fundingList([
        {
          ...fundingCard,
          fundingId: 42,
          cardType: "CLOSED_UNOPENED",
          pendingContributionCount: 0,
          participantCount: 3,
        },
      ]),
    });

    renderTab();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));

    expect(fundingService.getResult).toHaveBeenCalledWith(42);
    expect(push).not.toHaveBeenCalled();

    resolveResult(null);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/funding/42/reveal"));
  });

  it("결과 데이터 응답이 1.5초 안에 오지 않으면 기다리지 않고 공개 화면으로 이동한다", async () => {
    vi.mocked(fundingService.getResult).mockReturnValue(new Promise(() => {}));
    mockQueries({
      data: fundingList([
        {
          ...fundingCard,
          fundingId: 42,
          cardType: "CLOSED_UNOPENED",
          pendingContributionCount: 0,
          participantCount: 3,
        },
      ]),
    });

    renderTab();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));
    expect(push).not.toHaveBeenCalled();

    await waitFor(() => expect(push).toHaveBeenCalledWith("/funding/42/reveal"), {
      timeout: 2500,
    });
  });

  it("결과 데이터를 기다리는 동안 홈을 떠나면 늦게 끝나도 공개 화면으로 이동하지 않는다", async () => {
    let resolveReveal: (
      value: Awaited<ReturnType<typeof fundingService.getResult>>,
    ) => void = () => {};
    vi.mocked(fundingService.getResult).mockReturnValue(
      new Promise(resolve => {
        resolveReveal = resolve;
      }),
    );
    mockQueries({
      data: fundingList([
        {
          ...fundingCard,
          fundingId: 42,
          cardType: "CLOSED_UNOPENED",
          pendingContributionCount: 0,
          participantCount: 3,
        },
      ]),
    });

    const { unmount } = renderTab();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));
    unmount();
    resolveReveal(null);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(push).not.toHaveBeenCalled();
  });

  it("결과 데이터를 받는 동안 마감 카드를 연타해도 요청과 이동은 한 번만 한다", async () => {
    let resolveResult: (
      value: Awaited<ReturnType<typeof fundingService.getResult>>,
    ) => void = () => {};
    vi.mocked(fundingService.getResult).mockReturnValue(
      new Promise(resolve => {
        resolveResult = resolve;
      }),
    );
    mockQueries({
      data: fundingList([
        {
          ...fundingCard,
          fundingId: 42,
          cardType: "CLOSED_UNOPENED",
          pendingContributionCount: 0,
          participantCount: 3,
        },
      ]),
    });

    renderTab();
    const card = screen.getByRole("button", { name: "지유님의 펀딩" });
    await userEvent.click(card);
    await userEvent.click(card);
    resolveResult(null);

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(fundingService.getResult).toHaveBeenCalledTimes(1);
  });

  it("확인 대기가 없고 참여자가 있는 마감 카드(complete)를 누르면 공개 시트 없이 공개 화면으로 이동한다", async () => {
    mockQueries({
      data: fundingList([
        {
          ...fundingCard,
          fundingId: 42,
          cardType: "CLOSED_UNOPENED",
          pendingContributionCount: 0,
          participantCount: 3,
        },
      ]),
    });

    renderTab();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/funding/42/reveal"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("지금 열 수 있는 카드(earlyOpenable, earlyComplete)를 누르면 상세가 아니라 공개 화면으로 이동한다", async () => {
    mockQueries({
      data: fundingList([
        {
          ...fundingCard,
          fundingId: 42,
          cardType: "IN_PROGRESS",
          fundingType: "BIRTHDAY",
          confirmedPercentage: 100,
          pendingPercentage: 0,
          pendingContributionCount: 0,
          participantCount: 3,
          earlyOpenable: true,
        },
      ]),
    });

    renderTab();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/funding/42/reveal"));
    expect(push).not.toHaveBeenCalledWith("/funding/42");
  });

  describe("서프라이즈", () => {
    it("마감된 서프라이즈 카드를 누르면 선물 준비 화면으로 이동한다", async () => {
      mockQueries({
        data: fundingList([{ ...surpriseCard, cardType: "CLOSED_UNOPENED" }]),
      });

      renderTab();
      await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));

      expect(push).toHaveBeenCalledWith("/funding/42/surprise-gift");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("진행 중이고 100% 모인 서프라이즈 카드를 누르면 이동 없이 지금 보낼지 묻는 다이얼로그를 연다", async () => {
      mockQueries({
        data: fundingList([{ ...surpriseCard, cardType: "IN_PROGRESS", confirmedPercentage: 100 }]),
      });

      renderTab();
      await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));

      expect(screen.getByRole("alertdialog")).toHaveTextContent("지금 보낼까요 42");
      expect(push).not.toHaveBeenCalled();
    });

    it("진행 중이지만 100% 미만인 서프라이즈 카드는 펀딩 상세로 이동한다", async () => {
      mockQueries({
        data: fundingList([{ ...surpriseCard, cardType: "IN_PROGRESS", confirmedPercentage: 60 }]),
      });

      renderTab();
      await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));

      expect(push).toHaveBeenCalledWith("/funding/42");
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("서프라이즈의 입금 확인 시트에서 선물 준비하기를 누르면 결과 조회 없이 선물 준비 화면으로 이동한다", async () => {
      mockQueries({
        data: fundingList([
          { ...surpriseCard, cardType: "CLOSED_UNOPENED", pendingContributionCount: 2 },
        ]),
      });

      renderTab();
      await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));
      await userEvent.click(screen.getByRole("button", { name: "선물 준비하기" }));

      expect(push).toHaveBeenCalledWith("/funding/42/surprise-gift");
      expect(fundingService.getResult).not.toHaveBeenCalled();
    });

    it("생일 펀딩의 입금 확인 시트 열어보기는 기존처럼 공개 화면으로 이동한다", async () => {
      vi.mocked(fundingService.getResult).mockResolvedValue(null);
      mockQueries({
        data: fundingList([
          {
            ...fundingCard,
            fundingId: 43,
            cardType: "CLOSED_UNOPENED",
            pendingContributionCount: 1,
          },
        ]),
      });

      renderTab();
      await userEvent.click(screen.getByRole("button", { name: "지유님의 펀딩" }));
      await userEvent.click(screen.getByRole("button", { name: "팡! 열어보기" }));

      await waitFor(() => expect(push).toHaveBeenCalledWith("/funding/43/reveal"));
      expect(push).not.toHaveBeenCalledWith("/funding/43/surprise-gift");
    });
  });

  describe("서프라이즈 공개 배너", () => {
    it("공개된 서프라이즈가 있으면 배너를 보여주고 열어보기를 누르면 받는 사람 공개 화면으로 이동한다", async () => {
      mockSurpriseReveals([revealCard]);
      mockQueries({ data: fundingList([fundingCard]) });

      renderTab();
      const banner = screen.getByRole("region", { name: "서프라이즈 선물 안내" });
      expect(banner).toHaveTextContent("친구들이 몰래 준비한 선물이 있어요");
      expect(banner).toHaveTextContent("민준외 3명이 함께 준비했어요");
      await userEvent.click(screen.getByRole("button", { name: "열어보기" }));

      expect(push).toHaveBeenCalledWith("/surprised/77/reveal");
    });

    it("공개 카드는 펀딩 카드 캐러셀에 넣지 않는다", () => {
      mockSurpriseReveals([revealCard]);
      mockQueries({ data: fundingList([fundingCard]) });

      renderTab();

      expect(screen.queryByText(/준비한 서프라이즈/)).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "지유님의 펀딩" })).toBeInTheDocument();
    });

    it("X를 누르면 이번 방문에서는 배너를 숨긴다", async () => {
      mockSurpriseReveals([revealCard]);
      mockQueries({ data: fundingList([fundingCard]) });
      renderTab();

      await userEvent.click(screen.getByRole("button", { name: "서프라이즈 선물 안내 닫기" }));

      expect(
        screen.queryByRole("region", { name: "서프라이즈 선물 안내" }),
      ).not.toBeInTheDocument();
    });

    it("선물 인증 배너가 떠 있는 동안에는 서프라이즈 배너를 보여주지 않는다", () => {
      mockSurpriseReveals([revealCard]);
      mockQueries({ data: fundingList([fundingCard]) });

      renderTab(vi.fn(), { banner: <div>선물 인증 배너</div>, showSurpriseBanner: false });

      expect(screen.getByText("선물 인증 배너")).toBeInTheDocument();
      expect(
        screen.queryByRole("region", { name: "서프라이즈 선물 안내" }),
      ).not.toBeInTheDocument();
    });

    it("상단 고정형 선물 인증 배너가 떠 있어 showSurpriseBanner가 false면 카드 배너도 없다", () => {
      mockSurpriseReveals([revealCard]);
      mockQueries({ data: fundingList([fundingCard]) });

      renderTab(vi.fn(), { showSurpriseBanner: false });

      expect(
        screen.queryByRole("region", { name: "서프라이즈 선물 안내" }),
      ).not.toBeInTheDocument();
    });

    it("공개 카드 조회 결과가 없으면 배너를 보여주지 않는다", () => {
      mockSurpriseReveals(undefined);
      mockQueries({ data: fundingList([fundingCard]) });

      renderTab();

      expect(
        screen.queryByRole("region", { name: "서프라이즈 선물 안내" }),
      ).not.toBeInTheDocument();
    });
  });
});
