import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useHomeNoFundingQuery } from "@/hooks/queries/home/useHomeNoFundingQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import type { HomeFundingCardResponse, HomeNoFundingResponse } from "@/types/home/home";
import HomeFundingTab from "@/widgets/home/HomeFundingTab";

vi.mock("@/hooks/queries/home/useHomeFundingsQuery");
vi.mock("@/hooks/queries/home/useHomeNoFundingQuery");
vi.mock("@/hooks/queries/user/useMyProfileQuery");
vi.mock("@/widgets/home/PendingContributionBottomSheet", () => ({
  default: ({ open, fundingId }: { open: boolean; fundingId: number | null }) =>
    open ? <div role="dialog">입금 확인 {fundingId}</div> : null,
}));

const fundingCard: HomeFundingCardResponse = {
  fundingId: 1,
  cardType: "IN_PROGRESS",
  fundingType: "BIRTHDAY",
  productName: "무선 헤드폰",
  productImageUrl: "/headphone.png",
  remainingDays: 7,
  confirmedPercentage: 50,
  pendingPercentage: 0,
  pendingContributionCount: 0,
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

const fundingList = (cards: HomeFundingCardResponse[]) => ({
  fundingCards: cards,
  activeFundingCount: cards.length,
  canOpenFunding: true,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMyProfileQuery).mockReturnValue({
    data: { nickname: "지유" },
  } as unknown as ReturnType<typeof useMyProfileQuery>);
});

describe("HomeFundingTab", () => {
  it("펀딩 카드가 있으면 카드 캐러셀을 보여주고 펀딩 없는 홈은 요청하지 않는다", () => {
    mockQueries({ data: fundingList([fundingCard]) });

    render(<HomeFundingTab onAddWish={vi.fn()} />);

    expect(screen.getByText("작은 보탬들이 차곡차곡 쌓이고 있어요")).toBeInTheDocument();
    expect(screen.getByText("지유님의 생일 펀딩")).toBeInTheDocument();
    expect(useHomeNoFundingQuery).toHaveBeenCalledWith({ enabled: false });
  });

  it("펀딩이 없고 위시 추천 상태면 닉네임 제목과 위시 카드를 보여준다", () => {
    mockQueries({ data: fundingList([]) }, { data: makeNoFunding("WISH_RECOMMENDATION") });

    render(<HomeFundingTab onAddWish={vi.fn()} />);

    expect(useHomeNoFundingQuery).toHaveBeenCalledWith({ enabled: true });
    expect(screen.getByText("지유님, 펀딩 열어볼까요?")).toBeInTheDocument();
    expect(screen.getByText("다이슨 에어랩")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "펀딩 열기" })).toBeInTheDocument();
  });

  it("펀딩도 위시도 없으면 빈 화면을 보여주고 '위시 추가하기'를 누르면 onAddWish를 호출한다", async () => {
    const onAddWish = vi.fn();
    mockQueries({ data: fundingList([]) }, { data: makeNoFunding("EMPTY") });

    render(<HomeFundingTab onAddWish={onAddWish} />);
    await userEvent.click(screen.getByRole("button", { name: "위시 추가하기" }));

    expect(screen.getByText("갖고 싶은걸 먼저 담아볼까요?")).toBeInTheDocument();
    expect(onAddWish).toHaveBeenCalledTimes(1);
  });

  it("펀딩 조회가 실패하면 다시 시도로 펀딩 조회를 다시 요청한다", async () => {
    mockQueries({ isError: true });

    render(<HomeFundingTab onAddWish={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(fundingsRefetch).toHaveBeenCalledTimes(1);
    expect(noFundingRefetch).not.toHaveBeenCalled();
  });

  it("펀딩 없는 홈 조회가 실패하면 다시 시도로 그 조회를 다시 요청한다", async () => {
    mockQueries({ data: fundingList([]) }, { isError: true });

    render(<HomeFundingTab onAddWish={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(noFundingRefetch).toHaveBeenCalledTimes(1);
    expect(fundingsRefetch).not.toHaveBeenCalled();
  });

  it("펀딩 카드가 있으면 이전에 실패한 펀딩 없는 홈 조회 에러는 무시하고 카드를 보여준다", () => {
    mockQueries({ data: fundingList([fundingCard]) }, { isError: true });

    render(<HomeFundingTab onAddWish={vi.fn()} />);

    expect(screen.getByText("지유님의 생일 펀딩")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("펀딩 재조회가 실패해도 이미 받은 카드가 있으면 카드를 계속 보여준다", () => {
    mockQueries({ data: fundingList([fundingCard]), isError: true });

    render(<HomeFundingTab onAddWish={vi.fn()} />);

    expect(screen.getByText("지유님의 생일 펀딩")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("펀딩 없는 홈 재조회가 실패해도 이미 받은 데이터가 있으면 그 화면을 계속 보여준다", () => {
    mockQueries(
      { data: fundingList([]) },
      { data: makeNoFunding("WISH_RECOMMENDATION"), isError: true },
    );

    render(<HomeFundingTab onAddWish={vi.fn()} />);

    expect(screen.getByText("지유님, 펀딩 열어볼까요?")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
  });

  it("조회 중에는 어떤 분기 화면도 보여주지 않는다", () => {
    mockQueries({});

    const { container } = render(<HomeFundingTab onAddWish={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
  it("확인대기 보탬이 있는 마감 카드를 누르면 해당 펀딩 id로 입금 확인 시트가 열린다", async () => {
    mockQueries({
      data: fundingList([
        { ...fundingCard, fundingId: 42, cardType: "CLOSED_UNOPENED", pendingContributionCount: 2 },
      ]),
    });

    render(<HomeFundingTab onAddWish={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "지유님의 생일 펀딩" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("입금 확인 42");
  });

  it("진행 중(default) 카드에는 카드 버튼이 없다", () => {
    mockQueries({ data: fundingList([fundingCard]) });

    render(<HomeFundingTab onAddWish={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "지유님의 생일 펀딩" })).not.toBeInTheDocument();
  });

  it("확인대기 보탬이 없는 마감 카드(open)에는 카드 버튼이 없다", () => {
    mockQueries({
      data: fundingList([
        { ...fundingCard, cardType: "CLOSED_UNOPENED", pendingContributionCount: 0 },
      ]),
    });

    render(<HomeFundingTab onAddWish={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "지유님의 생일 펀딩" })).not.toBeInTheDocument();
  });
});
