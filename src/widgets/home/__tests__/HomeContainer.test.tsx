import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { markWishPromptPending } from "@/utils/wish/wishPromptStorage";
import HomeContainer from "@/widgets/home/HomeContainer";

vi.mock("@/hooks/queries/home/useHomeFundingsQuery");
const closedFundingsQuery = vi.fn();
vi.mock("@/hooks/queries/funding/useClosedFundingsQuery", () => ({
  useClosedFundingsQuery: () => closedFundingsQuery(),
}));
vi.mock("@/hooks/queries/wish/useHomeWishesQuery", () => ({ useHomeWishesQuery: vi.fn() }));
const push = vi.fn();
const replace = vi.fn();
let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => searchParams,
}));
vi.mock("@/widgets/funding/FundingOpenSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>펀딩 열기 시트</div> : null),
}));
vi.mock("@/widgets/home/HomeFundingTab", () => ({
  default: ({
    onAddWish,
    onOpenFunding,
  }: {
    onAddWish: () => void;
    onOpenFunding: (wish: object) => void;
  }) => (
    <>
      <button type="button" onClick={onAddWish}>
        펀딩 탭 위시 추가
      </button>
      <button type="button" onClick={() => onOpenFunding({ wishId: 1 })}>
        추천 위시 펀딩 열기
      </button>
    </>
  ),
}));
vi.mock("@/widgets/home/GiftVerificationBannerLayer", () => ({
  default: ({ children }: { children: (cardBanner: null) => React.ReactNode }) => children(null),
}));
vi.mock("@/widgets/home/HomeWishTab", () => ({ default: () => <div>위시 탭 내용</div> }));
vi.mock("@/widgets/user/MyMenuSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>메뉴 시트</div> : null),
}));

describe("HomeContainer", () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    closedFundingsQuery.mockClear();
    useErrorDialogStore.getState().closeErrorDialog();
    searchParams = new URLSearchParams();
    vi.mocked(useHomeFundingsQuery).mockReturnValue({
      data: { fundingCards: [], activeFundingCount: 0, canOpenFunding: true },
    } as unknown as ReturnType<typeof useHomeFundingsQuery>);
  });

  it("tab 쿼리가 없으면 펀딩 탭을 보여준다", () => {
    render(<HomeContainer />);

    expect(screen.getByRole("button", { name: "펀딩 탭 위시 추가" })).toBeInTheDocument();
    expect(screen.queryByText("위시 탭 내용")).not.toBeInTheDocument();
  });

  it("?tab=wish로 들어오면 위시 탭을 보여준다", () => {
    searchParams = new URLSearchParams("tab=wish");
    render(<HomeContainer />);

    expect(screen.getByText("위시 탭 내용")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "위시" })).toHaveAttribute("aria-selected", "true");
  });

  it("'위시' 탭을 누르면 서버 이동 없이 URL만 ?tab=wish로 바꾼다", async () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("tab", { name: "위시" }));

    expect(replaceState).toHaveBeenCalledWith(null, "", "/home?tab=wish");
    expect(replace).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });

  it("위시 탭에서 '펀딩' 탭을 누르면 tab 쿼리를 지운다", async () => {
    searchParams = new URLSearchParams("tab=wish");
    const replaceState = vi.spyOn(window.history, "replaceState");
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("tab", { name: "펀딩" }));

    expect(replaceState).toHaveBeenCalledWith(null, "", "/home");
    replaceState.mockRestore();
  });

  it("위시 탭에서 메뉴를 열어도 tab 쿼리를 유지한다", async () => {
    searchParams = new URLSearchParams("tab=wish");
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));

    expect(replace).toHaveBeenCalledWith("/home?tab=wish&menu=open", { scroll: false });
  });

  it("헤더의 '메뉴 열기'를 누르면 /home?menu=open으로 replace한다", async () => {
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));

    expect(replace).toHaveBeenCalledWith("/home?menu=open", { scroll: false });
  });

  it("+ 메뉴에서 '위시 추가'를 고르면 /wish/recommended로 이동한다", async () => {
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    await userEvent.click(screen.getByRole("button", { name: "위시 추가" }));

    expect(push).toHaveBeenCalledWith("/wish/recommended");
    expect(screen.queryByText("펀딩 열기 시트")).not.toBeInTheDocument();
  });

  it("+ 메뉴에서 '펀딩 추가'를 고르면 펀딩 열기 시트가 열린다", async () => {
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    await userEvent.click(screen.getByRole("button", { name: "펀딩 추가" }));

    expect(screen.getByText("펀딩 열기 시트")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("개설이 불가능할 때 '펀딩 추가'를 고르면 메뉴를 닫고 시트 대신 한도 안내 Dialog를 연다", async () => {
    vi.mocked(useHomeFundingsQuery).mockReturnValue({
      data: { fundingCards: [], activeFundingCount: 5, canOpenFunding: false },
    } as unknown as ReturnType<typeof useHomeFundingsQuery>);
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    await userEvent.click(screen.getByRole("button", { name: "펀딩 추가" }));

    expect(useErrorDialogStore.getState().message).toBe(ERROR_MESSAGES.FUNDING_019.message);
    expect(screen.queryByText("펀딩 열기 시트")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "펀딩 추가" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "추가 메뉴 열기" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("개설이 불가능할 때 추천 위시의 '펀딩 열기'를 누르면 시트 대신 한도 안내 Dialog를 연다", async () => {
    vi.mocked(useHomeFundingsQuery).mockReturnValue({
      data: { fundingCards: [], activeFundingCount: 5, canOpenFunding: false },
    } as unknown as ReturnType<typeof useHomeFundingsQuery>);
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "추천 위시 펀딩 열기" }));

    expect(useErrorDialogStore.getState().message).toBe(ERROR_MESSAGES.FUNDING_019.message);
    expect(screen.queryByText("펀딩 열기 시트")).not.toBeInTheDocument();
  });

  it("자동 열기로 들어오면 펀딩 열기 시트를 열고 open 쿼리를 지운다", () => {
    render(<HomeContainer autoOpenFunding />);

    expect(screen.getByText("펀딩 열기 시트")).toBeInTheDocument();
    expect(useErrorDialogStore.getState().message).toBeNull();
    expect(replace).toHaveBeenCalledWith("/home", { scroll: false });
  });

  it("자동 열기가 개설 한도에 막히면 한 번만 안내하고 open 쿼리를 지운다", () => {
    const limited = () =>
      ({
        data: { fundingCards: [], activeFundingCount: 5, canOpenFunding: false },
      }) as unknown as ReturnType<typeof useHomeFundingsQuery>;
    vi.mocked(useHomeFundingsQuery).mockImplementation(limited);
    const { rerender } = render(<HomeContainer autoOpenFunding />);

    expect(useErrorDialogStore.getState().message).toBe(ERROR_MESSAGES.FUNDING_019.message);
    expect(screen.queryByText("펀딩 열기 시트")).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/home", { scroll: false });

    // 재조회로 새 data가 와도 다시 안내하지 않는다
    useErrorDialogStore.getState().closeErrorDialog();
    rerender(<HomeContainer autoOpenFunding />);

    expect(useErrorDialogStore.getState().message).toBeNull();
  });

  it("홈 펀딩을 조회하기 전에는 펀딩 추가 메뉴를 표시하지 않는다", async () => {
    vi.mocked(useHomeFundingsQuery).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useHomeFundingsQuery>);
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));

    expect(screen.queryByRole("button", { name: "펀딩 추가" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "위시 추가" })).toBeInTheDocument();
  });

  it("탭의 위시 추가 동작은 /wish/recommended로 이동한다", async () => {
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "펀딩 탭 위시 추가" }));

    expect(push).toHaveBeenCalledWith("/wish/recommended");
  });

  it("메뉴를 열기 전에는 마감된 펀딩 목록을 조회하지 않는다", () => {
    render(<HomeContainer />);

    expect(closedFundingsQuery).not.toHaveBeenCalled();
  });

  it("온보딩 직후(위시 프롬프트 대기 중)에도 진입 시 자동으로 이동하지 않는다", () => {
    markWishPromptPending();
    render(<HomeContainer />);

    expect(push).not.toHaveBeenCalled();
  });
});
