import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import HomeContainer from "@/widgets/home/HomeContainer";

vi.mock("@/hooks/queries/home/useHomeFundingsQuery");
vi.mock("@/hooks/queries/wish/useHomeWishesQuery", () => ({ useHomeWishesQuery: vi.fn() }));
vi.mock("@/utils/wish/wishPromptStorage", () => ({ consumeWishPromptPending: () => false }));
vi.mock("@/widgets/wish/AddWishBottomSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>위시 추가 시트</div> : null),
}));
vi.mock("@/widgets/funding/FundingOpenSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>펀딩 열기 시트</div> : null),
}));
vi.mock("@/widgets/home/HomeFundingTab", () => ({
  default: ({ onAddWish }: { onAddWish: () => void }) => (
    <button type="button" onClick={onAddWish}>
      펀딩 탭 위시 추가
    </button>
  ),
}));
vi.mock("@/widgets/home/HomeWishTab", () => ({ default: () => <div>위시 탭 내용</div> }));
vi.mock("@/widgets/user/MyMenuSheet", () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>메뉴 시트</div> : null),
}));

describe("HomeContainer", () => {
  beforeEach(() => {
    vi.mocked(useHomeFundingsQuery).mockReturnValue({
      data: { fundingCards: [], activeFundingCount: 0, canOpenFunding: true },
    } as unknown as ReturnType<typeof useHomeFundingsQuery>);
  });

  it("처음에는 펀딩 탭을 보여주고 '위시' 탭을 누르면 위시 탭으로 바뀐다", async () => {
    render(<HomeContainer />);

    expect(screen.getByRole("button", { name: "펀딩 탭 위시 추가" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "위시" }));

    expect(screen.getByText("위시 탭 내용")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "펀딩 탭 위시 추가" })).not.toBeInTheDocument();
  });

  it("+ 메뉴에서 '위시 추가'를 고르면 위시 추가 시트가 열린다", async () => {
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    await userEvent.click(screen.getByRole("button", { name: "위시 추가" }));

    expect(screen.getByText("위시 추가 시트")).toBeInTheDocument();
    expect(screen.queryByText("펀딩 열기 시트")).not.toBeInTheDocument();
  });

  it("+ 메뉴에서 '펀딩 추가'를 고르면 펀딩 열기 시트가 열린다", async () => {
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    await userEvent.click(screen.getByRole("button", { name: "펀딩 추가" }));

    expect(screen.getByText("펀딩 열기 시트")).toBeInTheDocument();
    expect(screen.queryByText("위시 추가 시트")).not.toBeInTheDocument();
  });

  it("개설이 불가능하면 펀딩 추가 메뉴를 표시하지 않는다", async () => {
    vi.mocked(useHomeFundingsQuery).mockReturnValue({
      data: { fundingCards: [], activeFundingCount: 3, canOpenFunding: false },
    } as unknown as ReturnType<typeof useHomeFundingsQuery>);
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "추가 메뉴 열기" }));
    expect(screen.queryByRole("button", { name: "펀딩 추가" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "위시 추가" })).toBeInTheDocument();
  });

  it("탭의 위시 추가 동작은 위시 추가 시트를 연다", async () => {
    render(<HomeContainer />);

    await userEvent.click(screen.getByRole("button", { name: "펀딩 탭 위시 추가" }));

    expect(screen.getByText("위시 추가 시트")).toBeInTheDocument();
  });
});
